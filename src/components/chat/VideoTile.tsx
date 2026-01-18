import { useRef, useEffect } from "react";
import { User, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoTileProps {
  stream: MediaStream | null;
  name: string;
  isLocal?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isConnecting?: boolean;
}

export const VideoTile = ({
  stream,
  name,
  isLocal = false,
  isMuted = false,
  isVideoOff = false,
  isConnecting = false,
}: VideoTileProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideo = stream && stream.getVideoTracks().length > 0 && !isVideoOff;

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden bg-secondary aspect-video",
        isLocal && "ring-2 ring-primary/50"
      )}
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={cn(
            "w-full h-full object-cover",
            isLocal && "transform -scale-x-100"
          )}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-secondary">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted flex items-center justify-center">
            <User className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Connecting overlay */}
      {isConnecting && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Connecting...</span>
          </div>
        </div>
      )}

      {/* Name badge */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <div className="glass-strong px-3 py-1.5 rounded-lg flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
            {name} {isLocal && "(You)"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "glass-strong w-7 h-7 rounded-full flex items-center justify-center",
              isMuted && "bg-destructive/20"
            )}
          >
            {isMuted ? (
              <MicOff className="w-3.5 h-3.5 text-destructive" />
            ) : (
              <Mic className="w-3.5 h-3.5 text-foreground" />
            )}
          </div>
          {isVideoOff && (
            <div className="glass-strong w-7 h-7 rounded-full flex items-center justify-center bg-destructive/20">
              <VideoOff className="w-3.5 h-3.5 text-destructive" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
