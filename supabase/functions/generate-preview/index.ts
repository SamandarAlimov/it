import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId } = await req.json();

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Project ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch project details
    const { data: project, error: projectError } = await supabase
      .from('builder_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('Project fetch error:', projectError);
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch project files to understand what kind of project it is
    const { data: files } = await supabase
      .from('builder_files')
      .select('file_name, content, file_type')
      .eq('project_id', projectId)
      .limit(5);

    // Generate a descriptive prompt based on project info
    const projectType = project.project_type || 'website';
    const projectName = project.name || 'Web Project';
    const projectDescription = project.description || '';
    
    // Analyze files to determine project theme
    let codeContext = '';
    if (files && files.length > 0) {
      const htmlFile = files.find(f => f.file_name?.endsWith('.html'));
      const cssFile = files.find(f => f.file_name?.endsWith('.css'));
      if (htmlFile?.content) {
        // Extract title and main content hints
        const titleMatch = htmlFile.content.match(/<title>([^<]+)<\/title>/i);
        const h1Match = htmlFile.content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        if (titleMatch) codeContext += ` Title: ${titleMatch[1]}.`;
        if (h1Match) codeContext += ` Heading: ${h1Match[1]}.`;
      }
      if (cssFile?.content) {
        // Check for color themes
        const colorMatch = cssFile.content.match(/(?:background|color):\s*(#[a-fA-F0-9]{3,6}|rgb[^;]+)/gi);
        if (colorMatch && colorMatch.length > 0) {
          codeContext += ` Color scheme includes: ${colorMatch.slice(0, 3).join(', ')}.`;
        }
      }
    }

    const prompt = `Generate a professional website screenshot preview mockup for a ${projectType} project called "${projectName}". ${projectDescription}${codeContext} 
    
    Style: Modern, clean UI mockup showing a website on a laptop or browser frame. High quality, professional look. 16:9 aspect ratio. The website should look polished and complete with navigation, hero section, and content areas visible.`;

    console.log('Generating preview with prompt:', prompt);

    // Call Lovable AI to generate the preview image
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate preview image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    console.log('AI response received');

    const imageUrl = aiResponse.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error('No image in response:', JSON.stringify(aiResponse));
      return new Response(
        JSON.stringify({ error: 'No image generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the project with the preview image URL
    const { error: updateError } = await supabase
      .from('builder_projects')
      .update({ preview_image: imageUrl })
      .eq('id', projectId);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save preview image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Preview generated successfully for project:', projectId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        preview_image: imageUrl,
        message: 'Preview generated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Generate preview error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
