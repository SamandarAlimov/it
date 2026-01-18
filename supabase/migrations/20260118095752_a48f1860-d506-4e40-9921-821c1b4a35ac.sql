-- Add preview_image field to builder_projects table
ALTER TABLE public.builder_projects 
ADD COLUMN IF NOT EXISTS preview_image text;

-- Add comment for documentation
COMMENT ON COLUMN public.builder_projects.preview_image IS 'URL to the generated preview image for the project';