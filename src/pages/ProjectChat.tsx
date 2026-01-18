import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VideoChat } from "@/components/chat/VideoChat";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Project {
  id: string;
  title: string;
  service_type: string;
  status: string;
}

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  user_name?: string;
}

const ProjectChat = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (data) {
        setProject(data);
      }
      setLoadingProject(false);
    };

    fetchProject();
  }, [projectId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!projectId) return;

      const { data } = await supabase
        .from("project_messages")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`project-messages:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "project_messages",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !projectId || sending) return;

    setSending(true);
    const { error } = await supabase.from("project_messages").insert({
      project_id: projectId,
      user_id: user.id,
      content: newMessage.trim(),
    });

    if (!error) {
      setNewMessage("");
    }
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading || loadingProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-display font-bold text-foreground mb-4">
              Project Not Found
            </h1>
            <Link to="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{project.title} - Chat | Alsamos Corporation</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-32 pb-24">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {project.title}
                </h1>
                <p className="text-muted-foreground">
                  {project.service_type} • {project.status.replace("_", " ")}
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Video Chat */}
              <div className="lg:col-span-2">
                <VideoChat roomId={projectId!} roomName={`${project.title} Call`} />
              </div>

              {/* Text Chat */}
              <div className="glass rounded-xl p-4 flex flex-col h-[600px]">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold text-foreground">
                    Messages
                  </h3>
                </div>

                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <p className="text-muted-foreground text-sm text-center py-8">
                        No messages yet. Start the conversation!
                      </p>
                    ) : (
                      messages.map((msg) => {
                        const isOwn = msg.user_id === user.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-xl px-4 py-2 ${
                                isOwn
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-secondary-foreground"
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}
                              >
                                {new Date(msg.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>

                <div className="mt-4 pt-4 border-t border-border flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProjectChat;
