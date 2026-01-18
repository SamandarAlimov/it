// WebRTC Peer Connection Manager
export interface PeerConnection {
  pc: RTCPeerConnection;
  remoteStream: MediaStream | null;
  userId: string;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export const createPeerConnection = (
  userId: string,
  onIceCandidate: (candidate: RTCIceCandidate) => void,
  onTrack: (stream: MediaStream) => void,
  onConnectionStateChange: (state: RTCPeerConnectionState) => void
): RTCPeerConnection => {
  const pc = new RTCPeerConnection(ICE_SERVERS);

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      onIceCandidate(event.candidate);
    }
  };

  pc.ontrack = (event) => {
    onTrack(event.streams[0]);
  };

  pc.onconnectionstatechange = () => {
    onConnectionStateChange(pc.connectionState);
  };

  console.log(`[WebRTC] Created peer connection for user: ${userId}`);
  return pc;
};

export const addLocalTracks = (
  pc: RTCPeerConnection,
  stream: MediaStream
): void => {
  stream.getTracks().forEach((track) => {
    pc.addTrack(track, stream);
    console.log(`[WebRTC] Added ${track.kind} track`);
  });
};

export const createOffer = async (pc: RTCPeerConnection): Promise<RTCSessionDescriptionInit> => {
  const offer = await pc.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  });
  await pc.setLocalDescription(offer);
  console.log("[WebRTC] Created and set local offer");
  return offer;
};

export const createAnswer = async (
  pc: RTCPeerConnection,
  offer: RTCSessionDescriptionInit
): Promise<RTCSessionDescriptionInit> => {
  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  console.log("[WebRTC] Created and set local answer");
  return answer;
};

export const handleAnswer = async (
  pc: RTCPeerConnection,
  answer: RTCSessionDescriptionInit
): Promise<void> => {
  if (pc.signalingState === "have-local-offer") {
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
    console.log("[WebRTC] Set remote answer");
  }
};

export const handleIceCandidate = async (
  pc: RTCPeerConnection,
  candidate: RTCIceCandidateInit
): Promise<void> => {
  try {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
    console.log("[WebRTC] Added ICE candidate");
  } catch (error) {
    console.error("[WebRTC] Error adding ICE candidate:", error);
  }
};

export const getLocalStream = async (
  video: boolean = true,
  audio: boolean = true
): Promise<MediaStream> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: video
        ? {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          }
        : false,
      audio: audio
        ? {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        : false,
    });
    console.log("[WebRTC] Got local stream");
    return stream;
  } catch (error) {
    console.error("[WebRTC] Error getting local stream:", error);
    throw error;
  }
};

export const toggleTrack = (
  stream: MediaStream,
  kind: "audio" | "video"
): boolean => {
  const tracks = kind === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();
  const newState = !tracks[0]?.enabled;
  tracks.forEach((track) => {
    track.enabled = newState;
  });
  console.log(`[WebRTC] ${kind} track ${newState ? "enabled" : "disabled"}`);
  return newState;
};

export const stopStream = (stream: MediaStream | null): void => {
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
      console.log(`[WebRTC] Stopped ${track.kind} track`);
    });
  }
};
