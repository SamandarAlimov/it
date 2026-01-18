import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  createPeerConnection,
  addLocalTracks,
  createOffer,
  createAnswer,
  handleAnswer,
  handleIceCandidate,
  getLocalStream,
  toggleTrack,
  stopStream,
} from "@/utils/webrtc";

interface Participant {
  id: string;
  name: string;
  stream: MediaStream | null;
  isConnected: boolean;
}

interface SignalingMessage {
  type: "offer" | "answer" | "ice-candidate" | "join" | "leave";
  from: string;
  fromName: string;
  to?: string;
  payload?: RTCSessionDescriptionInit | RTCIceCandidateInit | null;
}

export const useWebRTCChat = (roomId: string) => {
  const { user } = useAuth();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const broadcastMessage = useCallback(
    (message: Omit<SignalingMessage, "from" | "fromName">) => {
      if (channelRef.current && user) {
        channelRef.current.send({
          type: "broadcast",
          event: "signaling",
          payload: {
            ...message,
            from: user.id,
            fromName: userName,
          },
        });
      }
    },
    [user, userName]
  );

  const sendDirectMessage = useCallback(
    (to: string, message: Omit<SignalingMessage, "from" | "fromName" | "to">) => {
      if (channelRef.current && user) {
        channelRef.current.send({
          type: "broadcast",
          event: "signaling",
          payload: {
            ...message,
            from: user.id,
            fromName: userName,
            to,
          },
        });
      }
    },
    [user, userName]
  );

  const createPeerForUser = useCallback(
    (userId: string, userName: string, stream: MediaStream) => {
      if (peerConnections.current.has(userId)) {
        console.log(`[useWebRTCChat] Already have connection for ${userId}`);
        return peerConnections.current.get(userId)!;
      }

      const pc = createPeerConnection(
        userId,
        (candidate) => {
          sendDirectMessage(userId, {
            type: "ice-candidate",
            payload: candidate.toJSON(),
          });
        },
        (remoteStream) => {
          setParticipants((prev) => {
            const updated = new Map(prev);
            const existing = updated.get(userId);
            updated.set(userId, {
              id: userId,
              name: existing?.name || userName,
              stream: remoteStream,
              isConnected: true,
            });
            return updated;
          });
        },
        (state) => {
          console.log(`[useWebRTCChat] Connection state for ${userId}: ${state}`);
          if (state === "disconnected" || state === "failed" || state === "closed") {
            setParticipants((prev) => {
              const updated = new Map(prev);
              const existing = updated.get(userId);
              if (existing) {
                updated.set(userId, { ...existing, isConnected: false });
              }
              return updated;
            });
          }
        }
      );

      addLocalTracks(pc, stream);
      peerConnections.current.set(userId, pc);

      return pc;
    },
    [sendDirectMessage]
  );

  const handleSignalingMessage = useCallback(
    async (message: SignalingMessage) => {
      if (!user || !localStream) return;
      if (message.from === user.id) return;
      if (message.to && message.to !== user.id) return;

      console.log(`[useWebRTCChat] Received ${message.type} from ${message.fromName}`);

      switch (message.type) {
        case "join": {
          // New user joined, create offer and send
          setParticipants((prev) => {
            const updated = new Map(prev);
            if (!updated.has(message.from)) {
              updated.set(message.from, {
                id: message.from,
                name: message.fromName,
                stream: null,
                isConnected: false,
              });
            }
            return updated;
          });

          const pc = createPeerForUser(message.from, message.fromName, localStream);
          const offer = await createOffer(pc);
          sendDirectMessage(message.from, { type: "offer", payload: offer });
          break;
        }

        case "offer": {
          if (!message.payload) return;
          setParticipants((prev) => {
            const updated = new Map(prev);
            if (!updated.has(message.from)) {
              updated.set(message.from, {
                id: message.from,
                name: message.fromName,
                stream: null,
                isConnected: false,
              });
            }
            return updated;
          });

          const pc = createPeerForUser(message.from, message.fromName, localStream);
          const answer = await createAnswer(pc, message.payload as RTCSessionDescriptionInit);
          sendDirectMessage(message.from, { type: "answer", payload: answer });
          break;
        }

        case "answer": {
          if (!message.payload) return;
          const pc = peerConnections.current.get(message.from);
          if (pc) {
            await handleAnswer(pc, message.payload as RTCSessionDescriptionInit);
          }
          break;
        }

        case "ice-candidate": {
          if (!message.payload) return;
          const pc = peerConnections.current.get(message.from);
          if (pc) {
            await handleIceCandidate(pc, message.payload as RTCIceCandidateInit);
          }
          break;
        }

        case "leave": {
          const pc = peerConnections.current.get(message.from);
          if (pc) {
            pc.close();
            peerConnections.current.delete(message.from);
          }
          setParticipants((prev) => {
            const updated = new Map(prev);
            updated.delete(message.from);
            return updated;
          });
          break;
        }
      }
    },
    [user, localStream, createPeerForUser, sendDirectMessage]
  );

  const joinRoom = useCallback(async () => {
    if (!user || isConnected) return;

    setIsConnecting(true);
    setError(null);

    try {
      const stream = await getLocalStream(true, true);
      setLocalStream(stream);
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);

      const channel = supabase.channel(`video-chat:${roomId}`, {
        config: {
          presence: { key: user.id },
          broadcast: { self: false },
        },
      });

      channel
        .on("broadcast", { event: "signaling" }, ({ payload }) => {
          handleSignalingMessage(payload as SignalingMessage);
        })
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          console.log("[useWebRTCChat] Presence sync:", state);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({ user_id: user.id, name: userName });
            broadcastMessage({ type: "join" });
            setIsConnected(true);
            console.log("[useWebRTCChat] Joined room:", roomId);
          }
        });

      channelRef.current = channel;
    } catch (err) {
      console.error("[useWebRTCChat] Error joining room:", err);
      setError(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setIsConnecting(false);
    }
  }, [user, roomId, isConnected, handleSignalingMessage, broadcastMessage, userName]);

  const leaveRoom = useCallback(() => {
    broadcastMessage({ type: "leave" });

    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    stopStream(localStream);
    setLocalStream(null);
    setParticipants(new Map());
    setIsConnected(false);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);

    console.log("[useWebRTCChat] Left room");
  }, [broadcastMessage, localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const enabled = toggleTrack(localStream, "video");
      setIsVideoEnabled(enabled);
    }
  }, [localStream]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const enabled = toggleTrack(localStream, "audio");
      setIsAudioEnabled(enabled);
    }
  }, [localStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, []);

  return {
    localStream,
    participants: Array.from(participants.values()),
    isVideoEnabled,
    isAudioEnabled,
    isConnecting,
    isConnected,
    error,
    joinRoom,
    leaveRoom,
    toggleVideo,
    toggleAudio,
    userName,
  };
};
