import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface BuilderFile {
  id: string;
  file_path: string;
  file_name: string;
  content: string;
  file_type: string;
}

interface BuilderProject {
  id: string;
  name: string;
  description: string | null;
  subdomain: string;
  is_published: boolean;
}

export default function PublishedProject() {
  const { subdomain } = useParams<{ subdomain: string }>();
  const [project, setProject] = useState<BuilderProject | null>(null);
  const [files, setFiles] = useState<BuilderFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subdomain) {
      fetchProject();
    }
  }, [subdomain]);

  const fetchProject = async () => {
    try {
      // Fetch published project by subdomain
      const { data: projectData, error: projectError } = await supabase
        .from("builder_projects")
        .select("*")
        .eq("subdomain", subdomain)
        .eq("is_published", true)
        .maybeSingle();

      if (projectError) throw projectError;

      if (!projectData) {
        setError("Loyiha topilmadi yoki nashr qilinmagan");
        return;
      }

      setProject(projectData);

      // Fetch project files
      const { data: filesData, error: filesError } = await supabase
        .from("builder_files")
        .select("*")
        .eq("project_id", projectData.id)
        .order("file_path");

      if (filesError) throw filesError;
      setFiles(filesData || []);

    } catch (err) {
      console.error("Error fetching project:", err);
      setError("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const generatePreviewHtml = () => {
    // Find main files
    const appFile = files.find(f => f.file_path === "src/App.tsx" || f.file_name === "App.tsx");
    const cssFile = files.find(f => f.file_type === "css");
    const indexHtml = files.find(f => f.file_name === "index.html");

    // If there's a complete index.html, use it
    if (indexHtml && indexHtml.content.includes("<!DOCTYPE")) {
      return indexHtml.content;
    }

    // Build preview from React components
    const cssContent = cssFile?.content || "";
    const appContent = appFile?.content || "";

    // Extract JSX from React component
    const jsxMatch = appContent.match(/return\s*\(\s*([\s\S]*?)\s*\);?\s*\}?\s*$/m);
    let htmlContent = "";

    if (jsxMatch) {
      htmlContent = jsxMatch[1]
        // Convert className to class
        .replace(/className=/g, "class=")
        // Remove JSX expressions for simple rendering
        .replace(/\{[^}]*\}/g, "")
        // Clean up empty attributes
        .replace(/\s+>/g, ">")
        .trim();
    }

    return `
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project?.name || "Loyiha"}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${cssContent}
    body {
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, sans-serif;
    }
  </style>
</head>
<body>
  <div id="root">
    ${htmlContent || `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="text-align: center; color: white; padding: 40px;">
          <h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem;">${project?.name || "Loyiha"}</h1>
          <p style="font-size: 1.125rem; opacity: 0.9;">${project?.description || "AI yordamida yaratilgan"}</p>
        </div>
      </div>
    `}
  </div>
</body>
</html>`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-muted-foreground">{error || "Loyiha topilmadi"}</p>
        </div>
      </div>
    );
  }

  // Render the published content
  return (
    <div className="min-h-screen">
      <iframe
        srcDoc={generatePreviewHtml()}
        className="w-full h-screen border-0"
        title={project.name}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
