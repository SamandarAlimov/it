import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  FolderOpen, 
  FileText, 
  ShoppingBag, 
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Rocket,
  CheckCircle2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WelcomeOnboardingProps {
  open: boolean;
  onComplete: () => void;
  userId: string;
}

const steps = [
  {
    icon: Rocket,
    title: "Welcome to Alsamos!",
    description: "We're excited to have you on board. Let us show you around the platform and help you get started with your first project.",
    highlight: "Your journey to digital excellence starts here."
  },
  {
    icon: FolderOpen,
    title: "Manage Your Projects",
    description: "Track all your projects in one place. View progress, communicate with our team, and access project files anytime.",
    highlight: "Start a new project with just a few clicks."
  },
  {
    icon: FileText,
    title: "Invoices & Payments",
    description: "View and manage all your invoices. Track payment status, download receipts, and keep your finances organized.",
    highlight: "Secure and transparent billing."
  },
  {
    icon: ShoppingBag,
    title: "Premium Templates",
    description: "Browse our collection of premium templates. Purchase and download ready-to-use solutions for your business.",
    highlight: "Launch faster with pre-built solutions."
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description: "Connect directly with our team through project chat. Get real-time updates and quick responses to your questions.",
    highlight: "We're always here to help."
  }
];

export const WelcomeOnboarding = ({ open, onComplete, userId }: WelcomeOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    setCompleting(true);
    
    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to save progress");
    } else {
      toast.success("Welcome aboard! Let's get started.");
    }
    
    setCompleting(false);
    onComplete();
  };

  const handleSkip = async () => {
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", userId);
    onComplete();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLastStep = currentStep === steps.length - 1;
  const CurrentIcon = steps[currentStep].icon;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-background border-border" hideCloseButton>
        {/* Progress bar */}
        <div className="h-1 bg-secondary">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center animate-scale-in">
              <CurrentIcon className="w-10 h-10 text-primary" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8 animate-fade-in" key={currentStep}>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              {steps[currentStep].title}
            </h2>
            <p className="text-muted-foreground mb-4">
              {steps[currentStep].description}
            </p>
            <p className="text-sm text-primary font-medium">
              {steps[currentStep].highlight}
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? "bg-primary w-8" 
                    : index < currentStep 
                      ? "bg-primary/50" 
                      : "bg-secondary"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip tour
            </Button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}

              {isLastStep ? (
                <Button onClick={handleComplete} disabled={completing}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {completing ? "Finishing..." : "Get Started"}
                </Button>
              ) : (
                <Button onClick={nextStep}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
