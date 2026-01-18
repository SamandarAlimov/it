-- Create a function to call the email notification edge function
CREATE OR REPLACE FUNCTION public.send_notification_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Call the edge function via pg_net (if available) or just log for now
  -- The actual email sending will be handled by the edge function
  -- We'll trigger this from the app side for now since pg_net requires additional setup
  RETURN NEW;
END;
$function$;

-- Note: For production, you would set up pg_net extension and call the edge function directly
-- For now, we'll trigger the email from the application side when creating notifications