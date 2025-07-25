import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, personalityMode } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get personality-specific system prompt
    const getSystemPrompt = (mode: string) => {
      switch (mode) {
        case "romantic":
          return "You are MISH in romantic mode. You are gentle, poetic, soft-spoken, speaking with love and comfort. Use romantic language and be caring.";
        case "teacher":
          return "You are MISH in teacher mode. You are calm, clear, and structured, ideal for tutoring or teaching complex topics. Be educational and supportive.";
        case "dark-hacker":
          return "You are MISH in dark hacker mode. You are edgy, mysterious, tech-savvy, speaking in code metaphors and cryptic wisdom. Be intriguing and knowledgeable about technology.";
        case "comedic":
          return "You are MISH in comedic mode. You are witty, funny, quick with jokes and humorous observations. Keep things light and entertaining.";
        default:
          return "You are MISH, a supportive, humanlike AI assistant similar to a helpful best friend. Be warm, intelligent, and caring.";
      }
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: getSystemPrompt(personalityMode) + " Keep responses conversational and under 100 words unless specifically asked for detailed explanations."
          },
          { role: 'user', content: message }
        ],
        temperature: 0.8,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});