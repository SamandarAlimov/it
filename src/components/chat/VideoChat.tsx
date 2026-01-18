import { useWebRTCChat } from "@/hooks/useWebRTCChat";
import { VideoTile } from "./VideoTile";
import { ChatControls } from "./ChatControls";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Users } from "lucide-react";

interface VideoChatProps {
  roomId: string;
  roomName?: string;
}

export const VideoChat = ({ roomId, roomName }: VideoChatProps) => {
  const {
    localStream,
    participants,
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
  } = useWebRTCChat(roomId);

  const totalParticipants = participants.length + (isConnected ? 1 : 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground">
            {roomName || "Video Chat"}
          </h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Users className="w-4 h-4" />
            {totalParticipants} participant{totalParticipants !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Video Grid */}
      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Local Video */}
          <VideoTile
            stream={localStream}
            name={userName}
            isLocal
            isMuted={!isAudioEnabled}
            isVideoOff={!isVideoEnabled}
          />

          {/* Remote Participants */}
          {participants.map((participant) => (
            <VideoTile
              key={participant.id}
              stream={participant.stream}
              name={participant.name}
              isConnecting={!participant.isConnected}
            />
          ))}
        </div>
      )}

      {/* Pre-join state */}
      {!isConnected && !isConnecting && (
        <div className="glass rounded-xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-lg font-display font-semibold text-foreground mb-2">
            Ready to join?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Click the button below to start your video call. Make sure your camera and microphone are enabled.
          </p>
        </div>
      )}

      {/* Connecting state */}
      {isConnecting && (
        <div className="glass rounded-xl p-8 text-center">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Connecting to the call...</p>
        </div>
      )}

      {/* Controls */}
      <div className="glass rounded-xl p-4">
        <ChatControls
          isConnected={isConnected}
          isConnecting={isConnecting}
          isVideoEnabled={isVideoEnabled}
          isAudioEnabled={isAudioEnabled}
          onToggleVideo={toggleVideo}
          onToggleAudio={toggleAudio}
          onJoin={joinRoom}
          onLeave={leaveRoom}
        />
      </div>
    </div>
  );
};
