
-- Create a function to check if user is allowed admin (specific emails)
CREATE OR REPLACE FUNCTION public.is_allowed_admin(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_email IN ('alsamos@alsamos.com', 'samandar@alsamos.com')
$$;

-- Add a column to projects to track if it's saved/finalized
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_saved boolean DEFAULT false;

-- Update RLS policy - users can create projects but only admins can "save" them
DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;

-- Allow authenticated users to create projects (draft/unsaved)
CREATE POLICY "Users can create draft projects" 
ON public.projects 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Only admins can update projects (including saving them)
CREATE POLICY "Admins can update all projects" 
ON public.projects 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- Users can update their own unsaved projects (but not the is_saved field - controlled by trigger)
CREATE POLICY "Users can update own draft projects" 
ON public.projects 
FOR UPDATE 
USING (auth.uid() = user_id AND is_saved = false);

-- Create trigger to prevent non-admins from setting is_saved to true
CREATE OR REPLACE FUNCTION public.check_project_save_permission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If trying to set is_saved to true, check if user is admin
  IF NEW.is_saved = true AND (OLD.is_saved IS NULL OR OLD.is_saved = false) THEN
    IF NOT has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Only admins can save projects';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_project_save_permission_trigger ON public.projects;
CREATE TRIGGER check_project_save_permission_trigger
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.check_project_save_permission();
