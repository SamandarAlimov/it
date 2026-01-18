-- Create contact_submissions table for contact form
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  service TEXT,
  budget TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public inserts (no auth required for contact form)
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to submit a contact form
CREATE POLICY "Anyone can submit contact form" 
ON public.contact_submissions 
FOR INSERT 
WITH CHECK (true);

-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  author_name TEXT NOT NULL DEFAULT 'Alsamos Team',
  read_time INTEGER NOT NULL DEFAULT 5,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for blog posts (public read)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published blog posts
CREATE POLICY "Anyone can read published posts" 
ON public.blog_posts 
FOR SELECT 
USING (published = true);

-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_role TEXT NOT NULL,
  company TEXT NOT NULL,
  quote TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for testimonials (public read)
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Anyone can read active testimonials
CREATE POLICY "Anyone can read active testimonials" 
ON public.testimonials 
FOR SELECT 
USING (active = true);

-- Insert sample testimonials
INSERT INTO public.testimonials (client_name, client_role, company, quote, rating) VALUES
('Alexander Kim', 'CTO', 'TechFlow Inc', 'Alsamos delivered our e-commerce platform 2 weeks ahead of schedule. Their attention to detail and technical expertise exceeded our expectations.', 5),
('Sarah Johnson', 'Founder', 'HealthFirst App', 'The AI integration they built for our healthcare platform has reduced diagnosis time by 60%. Incredible work!', 5),
('Michael Chen', 'CEO', 'FinanceHub', 'Professional team, excellent communication, and world-class results. Our fintech app handles millions of transactions smoothly.', 5),
('Elena Petrova', 'Product Manager', 'EduLearn', 'From concept to launch in 3 months. The team at Alsamos truly understands how to build scalable solutions.', 5),
('David Park', 'Director of Engineering', 'LogiTrack', 'Their cloud infrastructure setup reduced our operational costs by 40%. Highly recommend for any DevOps needs.', 5);

-- Insert sample blog posts
INSERT INTO public.blog_posts (title, slug, excerpt, content, category, author_name, read_time, published) VALUES
('Building Scalable Web Applications with Next.js 15', 'building-scalable-web-apps-nextjs-15', 'Learn how to leverage the latest Next.js features to build performant and scalable web applications.', 'Full article content here...', 'Web Development', 'Sardor Aliev', 8, true),
('The Future of AI in Enterprise Software', 'future-ai-enterprise-software', 'Explore how artificial intelligence is transforming business operations and decision-making processes.', 'Full article content here...', 'AI & Automation', 'Azizbek Rahimov', 10, true),
('Mobile App Development Trends for 2024', 'mobile-app-trends-2024', 'Stay ahead of the curve with the latest mobile development trends and technologies.', 'Full article content here...', 'Mobile Development', 'Bobur Umarov', 6, true),
('Securing Your Cloud Infrastructure: Best Practices', 'securing-cloud-infrastructure', 'Essential security measures every organization should implement for their cloud deployments.', 'Full article content here...', 'Cybersecurity', 'Dilnoza Karimova', 7, true);
