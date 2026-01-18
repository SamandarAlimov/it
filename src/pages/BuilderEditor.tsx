import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Send, 
  ChevronLeft, 
  Code, 
  Eye, 
  Download,
  FileCode,
  Loader2,
  Bot,
  User,
  Copy,
  Check,
  Sparkles,
  Settings,
  Layers,
  Globe,
  ExternalLink
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { PublishDialog } from "@/components/builder/PublishDialog";
import { CustomDomainDialog } from "@/components/builder/CustomDomainDialog";

interface BuilderProject {
  id: string;
  name: string;
  description: string | null;
  project_type: string;
  status: string;
  subdomain?: string | null;
  is_published?: boolean;
  published_at?: string | null;
  custom_domain?: string | null;
  domain_verified?: boolean;
  domain_verification_token?: string | null;
}

interface BuilderFile {
  id: string;
  file_path: string;
  file_name: string;
  content: string;
  file_type: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export default function BuilderEditor() {
  const { projectId } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<BuilderProject | null>(null);
  const [files, setFiles] = useState<BuilderFile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showDomainDialog, setShowDomainDialog] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (projectId && user) {
      fetchProjectData();
    }
  }, [projectId, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchProjectData = async () => {
    try {
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from("builder_projects")
        .select("*")
        .eq("id", projectId)
        .maybeSingle();

      if (projectError) throw projectError;
      if (!projectData) {
        toast.error("Loyiha topilmadi");
        navigate("/builder");
        return;
      }
      setProject(projectData);

      // Fetch files
      const { data: filesData } = await supabase
        .from("builder_files")
        .select("*")
        .eq("project_id", projectId)
        .order("file_path");
      
      setFiles(filesData || []);
      if (filesData && filesData.length > 0) {
        setSelectedFile(filesData[0].file_path);
      }

      // Fetch chat history
      const { data: chatData } = await supabase
        .from("builder_chat_history")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at");
      
      setMessages((chatData || []) as ChatMessage[]);

    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setSending(true);

    // Add user message to UI
    const tempUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    // Save user message to database
    await supabase
      .from("builder_chat_history")
      .insert({
        project_id: projectId,
        role: "user",
        content: userMessage,
      });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/builder-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: userMessage }],
            projectId,
            userId: user!.id,
            stream: false,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("So'rovlar limiti oshdi, biroz kuting");
          return;
        }
        if (response.status === 402) {
          toast.error("Kredit qo'shing");
          return;
        }
        throw new Error("AI xatolik");
      }

      const data = await response.json();

      if (data.type === "code_generated") {
        // Refresh files
        const { data: filesData } = await supabase
          .from("builder_files")
          .select("*")
          .eq("project_id", projectId)
          .order("file_path");
        
        setFiles(filesData || []);
        if (filesData && filesData.length > 0 && !selectedFile) {
          setSelectedFile(filesData[0].file_path);
        }

        // Add assistant message
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `✅ ${data.summary}\n\n${data.files.length} ta fayl yaratildi: ${data.files.map((f: any) => f.file_name).join(", ")}`,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Save assistant message
        await supabase
          .from("builder_chat_history")
          .insert({
            project_id: projectId,
            role: "assistant",
            content: assistantMessage.content,
          });

        toast.success("Kod muvaffaqiyatli yaratildi!");
        setActiveTab("code");
      } else if (data.type === "message") {
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.content,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Xabar yuborishda xatolik");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyFileContent = async (content: string, filePath: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedFile(filePath);
    toast.success("Nusxa olindi!");
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const downloadProject = () => {
    // Create a simple HTML file with all code
    const html = files.find(f => f.file_name === "index.html")?.content || "";
    const css = files.find(f => f.file_type === "css")?.content || "";
    const js = files.filter(f => ["tsx", "ts", "jsx", "js"].includes(f.file_type))
      .map(f => `// ${f.file_name}\n${f.content}`)
      .join("\n\n");

    const fullHtml = html || `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project?.name || "My Project"}</title>
  <style>${css}</style>
</head>
<body>
  <div id="root"></div>
  <script>${js}</script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.name || "project"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Loyiha yuklab olindi!");
  };

  const getSelectedFileContent = () => {
    return files.find(f => f.file_path === selectedFile)?.content || "";
  };

  const generatePreviewHtml = () => {
    const appContent = files.find(f => f.file_path === "src/App.tsx")?.content || "";
    const cssContent = files.find(f => f.file_type === "css")?.content || "";
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>${cssContent}</style>
</head>
<body class="bg-gray-50">
  <div id="root" class="p-4">
    <div class="text-center py-10">
      <h2 class="text-xl font-semibold text-gray-700 mb-2">Ko'rish uchun loyihani eksport qiling</h2>
      <p class="text-gray-500">Hozircha faqat kod ko'rinishida</p>
    </div>
  </div>
</body>
</html>`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/builder")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold">{project?.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {project?.is_published && project?.subdomain && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`/p/${project.subdomain}`, "_blank")}
              className="gap-2 text-muted-foreground"
            >
              <ExternalLink className="h-4 w-4" />
              Ko'rish
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={downloadProject} className="gap-2">
            <Download className="h-4 w-4" />
            Yuklab olish
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setShowPublishDialog(true)}>
            <Globe className="h-4 w-4" />
            {project?.is_published ? "Nashr sozlamalari" : "Nashr qilish"}
          </Button>
        </div>
      </header>

      {/* Publish Dialog */}
      <PublishDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        projectId={projectId!}
        projectName={project?.name || ""}
        currentSubdomain={project?.subdomain}
        isPublished={project?.is_published}
        customDomain={project?.custom_domain}
        domainVerified={project?.domain_verified}
        onPublished={(subdomain) => {
          setProject(prev => prev ? { ...prev, subdomain, is_published: true } : null);
        }}
        onOpenCustomDomain={() => {
          setShowPublishDialog(false);
          setShowDomainDialog(true);
        }}
      />

      {/* Custom Domain Dialog */}
      <CustomDomainDialog
        open={showDomainDialog}
        onOpenChange={setShowDomainDialog}
        projectId={projectId!}
        projectName={project?.name || ""}
        currentDomain={project?.custom_domain}
        isVerified={project?.domain_verified}
        verificationToken={project?.domain_verification_token}
        onUpdated={(domain, verified) => {
          setProject(prev => prev ? { 
            ...prev, 
            custom_domain: domain, 
            domain_verified: verified 
          } : null);
        }}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Chat Panel */}
          <ResizablePanel defaultSize={35} minSize={25}>
            <div className="h-full flex flex-col">
              <div className="p-3 border-b border-border bg-muted/30">
                <h3 className="font-medium flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  AI Assistant
                </h3>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-10">
                      <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">
                        Salom! Men sizga web sayt yoki ilova yaratishda yordam beraman.
                        Nimani yaratmoqchisiz?
                      </p>
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-muted-foreground">Masalan:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {[
                            "Portfolio sayti yarat",
                            "Todo ilovasi yarat",
                            "Landing page yarat"
                          ].map((suggestion) => (
                            <Button
                              key={suggestion}
                              variant="outline"
                              size="sm"
                              onClick={() => setInputMessage(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "flex-row-reverse" : ""
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        message.role === "user" ? "bg-primary" : "bg-muted"
                      )}>
                        {message.role === "user" ? (
                          <User className="h-4 w-4 text-primary-foreground" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div className={cn(
                        "max-w-[85%] rounded-lg p-3",
                        message.role === "user" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {sending && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t border-border">
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nimani yaratmoqchisiz? Masalan: 'Portfolio sayti yarat'..."
                    className="pr-12 min-h-[60px] max-h-[150px] resize-none"
                    disabled={sending}
                  />
                  <Button
                    size="icon"
                    className="absolute right-2 bottom-2"
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || sending}
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Code/Preview Panel */}
          <ResizablePanel defaultSize={65}>
            <div className="h-full flex flex-col">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "code" | "preview")} className="h-full flex flex-col">
                <div className="border-b border-border px-4">
                  <TabsList className="h-12">
                    <TabsTrigger value="code" className="gap-2">
                      <Code className="h-4 w-4" />
                      Kod
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="gap-2">
                      <Eye className="h-4 w-4" />
                      Ko'rish
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="code" className="flex-1 m-0 overflow-hidden">
                  <div className="h-full flex">
                    {/* File Tree */}
                    <div className="w-48 border-r border-border bg-muted/30 overflow-auto">
                      <div className="p-2">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider px-2 py-1">
                          Fayllar
                        </div>
                        {files.length === 0 ? (
                          <div className="text-sm text-muted-foreground p-2">
                            Hali fayllar yo'q
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            {files.map((file) => (
                              <button
                                key={file.id}
                                className={cn(
                                  "w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 hover:bg-muted transition-colors",
                                  selectedFile === file.file_path && "bg-muted"
                                )}
                                onClick={() => setSelectedFile(file.file_path)}
                              >
                                <FileCode className="h-4 w-4 text-muted-foreground" />
                                <span className="truncate">{file.file_name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Code Editor */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {selectedFile && (
                        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20">
                          <span className="text-sm text-muted-foreground">{selectedFile}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyFileContent(getSelectedFileContent(), selectedFile)}
                            className="gap-2"
                          >
                            {copiedFile === selectedFile ? (
                              <>
                                <Check className="h-4 w-4" />
                                Nusxalandi
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                Nusxa olish
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                      <ScrollArea className="flex-1">
                        <pre className="p-4 text-sm font-mono">
                          <code>{getSelectedFileContent()}</code>
                        </pre>
                      </ScrollArea>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="flex-1 m-0">
                  <iframe
                    srcDoc={generatePreviewHtml()}
                    className="w-full h-full border-0"
                    title="Preview"
                  />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
