-- Builder Projects table - stores user's AI-built projects
CREATE TABLE public.builder_projects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    project_type TEXT NOT NULL DEFAULT 'landing', -- landing, webapp, ecommerce, other
    template_id UUID REFERENCES public.templates(id),
    status TEXT NOT NULL DEFAULT 'draft', -- draft, generating, ready, published
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Builder Files table - stores generated code files
CREATE TABLE public.builder_files (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.builder_projects(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    content TEXT NOT NULL,
    file_type TEXT NOT NULL, -- html, css, js, jsx, tsx, json, etc.
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(project_id, file_path)
);

-- Builder Chat History table - stores AI conversation
CREATE TABLE public.builder_chat_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.builder_projects(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- user, assistant, system
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Builder Versions table - version history for rollback
CREATE TABLE public.builder_versions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.builder_projects(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1,
    snapshot JSONB NOT NULL, -- full project snapshot
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(project_id, version_number)
);

-- Enable Row Level Security
ALTER TABLE public.builder_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for builder_projects
CREATE POLICY "Users can view their own projects" 
ON public.builder_projects FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
ON public.builder_projects FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.builder_projects FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.builder_projects FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all projects" 
ON public.builder_projects FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for builder_files (via project ownership)
CREATE POLICY "Users can view files of their own projects" 
ON public.builder_files FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.builder_projects WHERE id = project_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage files of their own projects" 
ON public.builder_files FOR ALL 
USING (EXISTS (SELECT 1 FROM public.builder_projects WHERE id = project_id AND user_id = auth.uid()));

-- RLS Policies for builder_chat_history (via project ownership)
CREATE POLICY "Users can view chat of their own projects" 
ON public.builder_chat_history FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.builder_projects WHERE id = project_id AND user_id = auth.uid()));

CREATE POLICY "Users can add chat to their own projects" 
ON public.builder_chat_history FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.builder_projects WHERE id = project_id AND user_id = auth.uid()));

-- RLS Policies for builder_versions (via project ownership)
CREATE POLICY "Users can view versions of their own projects" 
ON public.builder_versions FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.builder_projects WHERE id = project_id AND user_id = auth.uid()));

CREATE POLICY "Users can create versions of their own projects" 
ON public.builder_versions FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.builder_projects WHERE id = project_id AND user_id = auth.uid()));

-- Updated at trigger function (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_builder_projects_updated_at
    BEFORE UPDATE ON public.builder_projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_builder_files_updated_at
    BEFORE UPDATE ON public.builder_files
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.builder_chat_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.builder_files;