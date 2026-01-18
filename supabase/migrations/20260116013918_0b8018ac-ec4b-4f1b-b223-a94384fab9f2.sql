-- Add custom domain field to builder_projects
ALTER TABLE public.builder_projects 
ADD COLUMN IF NOT EXISTS custom_domain text UNIQUE,
ADD COLUMN IF NOT EXISTS domain_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS domain_verification_token text;

-- Create index for custom domain lookups
CREATE INDEX IF NOT EXISTS idx_builder_projects_custom_domain ON public.builder_projects(custom_domain) WHERE custom_domain IS NOT NULL;

-- Update RLS policy to allow access by custom domain
DROP POLICY IF EXISTS "Anyone can view published projects by subdomain" ON public.builder_projects;
CREATE POLICY "Anyone can view published projects by domain"
ON public.builder_projects
FOR SELECT
USING (is_published = true AND (subdomain IS NOT NULL OR (custom_domain IS NOT NULL AND domain_verified = true)));