-- Add publishing fields to builder_projects
ALTER TABLE public.builder_projects 
ADD COLUMN IF NOT EXISTS subdomain text UNIQUE,
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at timestamp with time zone;

-- Create index for subdomain lookups
CREATE INDEX IF NOT EXISTS idx_builder_projects_subdomain ON public.builder_projects(subdomain) WHERE subdomain IS NOT NULL;

-- Add RLS policy for public access to published projects
CREATE POLICY "Anyone can view published projects by subdomain"
ON public.builder_projects
FOR SELECT
USING (is_published = true AND subdomain IS NOT NULL);

-- Allow public to view files of published projects
CREATE POLICY "Anyone can view files of published projects"
ON public.builder_files
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM builder_projects 
    WHERE builder_projects.id = builder_files.project_id 
    AND builder_projects.is_published = true
  )
);