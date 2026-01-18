import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ProjectChatbot } from "./ProjectChatbot";

interface ProjectChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: () => void;
}

export const ProjectChatbotDialog = ({
  open,
  onOpenChange,
  onProjectCreated,
}: ProjectChatbotDialogProps) => {
  const handleProjectCreated = () => {
    onProjectCreated?.();
    // Keep dialog open for a moment to show success message
    setTimeout(() => {
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 h-[600px] max-h-[80vh]">
        <ProjectChatbot
          onProjectCreated={handleProjectCreated}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
