-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- Create user_roles table for role-based access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by owner"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create projects table for client tracking
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  service_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  budget DECIMAL(10,2),
  start_date DATE,
  estimated_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects"
ON public.projects FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert projects"
ON public.projects FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update projects"
ON public.projects FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  stripe_invoice_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoices"
ON public.invoices FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage invoices"
ON public.invoices FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create templates table for marketplace
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stripe_price_id TEXT,
  image_url TEXT,
  demo_url TEXT,
  download_url TEXT NOT NULL,
  features TEXT[],
  active BOOLEAN NOT NULL DEFAULT true,
  downloads INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 4.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active templates"
ON public.templates FOR SELECT
USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage templates"
ON public.templates FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create template_purchases table
CREATE TABLE public.template_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.template_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchases"
ON public.template_purchases FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create purchase record"
ON public.template_purchases FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create project_messages table for chat
CREATE TABLE public.project_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project participants can view messages"
ON public.project_messages FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Project participants can send messages"
ON public.project_messages FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_messages;

-- Create project_files table
CREATE TABLE public.project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project participants can view files"
ON public.project_files FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Project participants can upload files"
ON public.project_files FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Assign client role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample templates
INSERT INTO public.templates (title, slug, description, category, price, download_url, features, image_url) VALUES
('E-Commerce Starter', 'ecommerce-starter', 'Modern e-commerce template with cart, checkout, and product management.', 'Web', 49.00, 'https://example.com/downloads/ecommerce.zip', ARRAY['React', 'Tailwind', 'Stripe Integration'], 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=400&h=300&fit=crop'),
('SaaS Dashboard', 'saas-dashboard', 'Complete admin dashboard with charts, tables, and user management.', 'Web', 79.00, 'https://example.com/downloads/saas.zip', ARRAY['React', 'Chart.js', 'Auth Ready'], 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'),
('Mobile UI Kit', 'mobile-ui-kit', '200+ mobile UI components for iOS and Android applications.', 'Mobile', 99.00, 'https://example.com/downloads/mobile-ui.zip', ARRAY['React Native', 'Figma Files', '200+ Components'], 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop'),
('AI Chatbot Template', 'ai-chatbot', 'Ready-to-deploy chatbot template with customizable responses.', 'AI', 149.00, 'https://example.com/downloads/chatbot.zip', ARRAY['OpenAI API', 'Custom Training', 'Analytics'], 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop');

-- Update contact_submissions to allow admin read
CREATE POLICY "Admins can read contact submissions"
ON public.contact_submissions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Update blog_posts for admin management
CREATE POLICY "Admins can manage blog posts"
ON public.blog_posts FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update testimonials for admin management
CREATE POLICY "Admins can manage testimonials"
ON public.testimonials FOR ALL
USING (public.has_role(auth.uid(), 'admin'));