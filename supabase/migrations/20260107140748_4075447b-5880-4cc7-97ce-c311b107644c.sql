
-- Trigger function for new project messages
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_owner_id uuid;
  project_title text;
  sender_name text;
BEGIN
  -- Get project owner and title
  SELECT user_id, title INTO project_owner_id, project_title
  FROM public.projects
  WHERE id = NEW.project_id;
  
  -- Get sender name
  SELECT COALESCE(full_name, email) INTO sender_name
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  -- Only notify if the message sender is not the project owner
  IF NEW.user_id != project_owner_id THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      project_owner_id,
      'New Message',
      'New message from ' || COALESCE(sender_name, 'Team') || ' in project "' || project_title || '"',
      'message',
      '/dashboard/projects/' || NEW.project_id || '/chat'
    );
  END IF;
  
  -- Also notify admins about the new message
  INSERT INTO public.notifications (user_id, title, message, type, link)
  SELECT 
    ur.user_id,
    'New Project Message',
    'New message in project "' || project_title || '" from ' || COALESCE(sender_name, 'Client'),
    'message',
    '/dashboard/projects/' || NEW.project_id || '/chat'
  FROM public.user_roles ur
  WHERE ur.role = 'admin' AND ur.user_id != NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Trigger for new messages
CREATE TRIGGER on_new_project_message
AFTER INSERT ON public.project_messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_message();

-- Trigger function for new invoices
CREATE OR REPLACE FUNCTION public.notify_new_invoice()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_title text;
BEGIN
  -- Get project title if exists
  IF NEW.project_id IS NOT NULL THEN
    SELECT title INTO project_title
    FROM public.projects
    WHERE id = NEW.project_id;
  END IF;
  
  -- Notify the user about the new invoice
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (
    NEW.user_id,
    'New Invoice',
    'A new invoice of $' || NEW.amount || ' has been created' || 
    CASE WHEN project_title IS NOT NULL THEN ' for project "' || project_title || '"' ELSE '' END,
    'invoice',
    '/dashboard/invoices'
  );
  
  RETURN NEW;
END;
$$;

-- Trigger for new invoices
CREATE TRIGGER on_new_invoice
AFTER INSERT ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_invoice();

-- Trigger function for project status changes
CREATE OR REPLACE FUNCTION public.notify_project_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger if status actually changed
  IF OLD.status != NEW.status THEN
    -- Notify the project owner
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.user_id,
      'Project Status Updated',
      'Your project "' || NEW.title || '" status changed from "' || OLD.status || '" to "' || NEW.status || '"',
      'project',
      '/dashboard/projects'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for project status changes
CREATE TRIGGER on_project_status_change
AFTER UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.notify_project_status_change();
