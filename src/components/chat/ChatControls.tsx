import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Phone,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatControlsProps {
  isConnected: boolean;
  isConnecting: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onJoin: () => void;
  onLeave: () => void;
}

export const ChatControls = ({
  isConnected,
  isConnecting,
  isVideoEnabled,
  isAudioEnabled,
  onToggleVideo,
  onToggleAudio,
  onJoin,
  onLeave,
}: ChatControlsProps) => {
  if (!isConnected) {
    return (
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={onJoin}
          disabled={isConnecting}
          className="gap-2 px-8"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Phone className="w-5 h-5" />
              Join Video Call
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleAudio}
        className={cn(
          "w-12 h-12 rounded-full transition-colors",
          !isAudioEnabled && "bg-destructive/20 border-destructive text-destructive hover:bg-destructive/30"
        )}
      >
        {isAudioEnabled ? (
          <Mic className="w-5 h-5" />
        ) : (
          <MicOff className="w-5 h-5" />
        )}
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={onToggleVideo}
        className={cn(
          "w-12 h-12 rounded-full transition-colors",
          !isVideoEnabled && "bg-destructive/20 border-destructive text-destructive hover:bg-destructive/30"
        )}
      >
        {isVideoEnabled ? (
          <Video className="w-5 h-5" />
        ) : (
          <VideoOff className="w-5 h-5" />
        )}
      </Button>

      <Button
        variant="destructive"
        size="icon"
        onClick={onLeave}
        className="w-12 h-12 rounded-full"
      >
        <PhoneOff className="w-5 h-5" />
      </Button>
    </div>
  );
};
