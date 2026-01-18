-- Enable pg_net extension for HTTP calls from database
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Update notify_new_message to also send email
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  project_owner_id uuid;
  project_title text;
  sender_name text;
  supabase_url text;
  service_role_key text;
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
    
    -- Send email notification via edge function
    SELECT current_setting('app.settings.supabase_url', true) INTO supabase_url;
    SELECT current_setting('app.settings.service_role_key', true) INTO service_role_key;
    
    IF supabase_url IS NOT NULL AND service_role_key IS NOT NULL THEN
      PERFORM extensions.http_post(
        supabase_url || '/functions/v1/send-notification-email',
        jsonb_build_object(
          'user_id', project_owner_id,
          'notification_type', 'message',
          'title', 'New Message',
          'message', 'New message from ' || COALESCE(sender_name, 'Team') || ' in project "' || project_title || '"',
          'link', '/dashboard/projects/' || NEW.project_id || '/chat'
        ),
        'application/json',
        ARRAY[
          ('Authorization', 'Bearer ' || service_role_key)::extensions.http_header
        ]
      );
    END IF;
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
$function$;

-- Update notify_new_invoice to also send email
CREATE OR REPLACE FUNCTION public.notify_new_invoice()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  project_title text;
  supabase_url text;
  service_role_key text;
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
  
  -- Send email notification via edge function
  SELECT current_setting('app.settings.supabase_url', true) INTO supabase_url;
  SELECT current_setting('app.settings.service_role_key', true) INTO service_role_key;
  
  IF supabase_url IS NOT NULL AND service_role_key IS NOT NULL THEN
    PERFORM extensions.http_post(
      supabase_url || '/functions/v1/send-notification-email',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'notification_type', 'invoice',
        'title', 'New Invoice',
        'message', 'A new invoice of $' || NEW.amount || ' has been created' || 
          CASE WHEN project_title IS NOT NULL THEN ' for project "' || project_title || '"' ELSE '' END,
        'link', '/dashboard/invoices'
      ),
      'application/json',
      ARRAY[
        ('Authorization', 'Bearer ' || service_role_key)::extensions.http_header
      ]
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update notify_project_status_change to also send email
CREATE OR REPLACE FUNCTION public.notify_project_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  supabase_url text;
  service_role_key text;
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
    
    -- Send email notification via edge function
    SELECT current_setting('app.settings.supabase_url', true) INTO supabase_url;
    SELECT current_setting('app.settings.service_role_key', true) INTO service_role_key;
    
    IF supabase_url IS NOT NULL AND service_role_key IS NOT NULL THEN
      PERFORM extensions.http_post(
        supabase_url || '/functions/v1/send-notification-email',
        jsonb_build_object(
          'user_id', NEW.user_id,
          'notification_type', 'project',
          'title', 'Project Status Updated',
          'message', 'Your project "' || NEW.title || '" status changed from "' || OLD.status || '" to "' || NEW.status || '"',
          'link', '/dashboard/projects'
        ),
        'application/json',
        ARRAY[
          ('Authorization', 'Bearer ' || service_role_key)::extensions.http_header
        ]
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;