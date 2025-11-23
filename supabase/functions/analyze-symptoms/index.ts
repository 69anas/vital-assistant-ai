import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms, severity, duration, patientHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing symptoms:", { symptoms, severity, duration });

    const systemPrompt = `You are an AI medical assistant helping doctors analyze patient symptoms and suggest possible diagnoses. 

IMPORTANT GUIDELINES:
- Provide differential diagnoses based on the symptoms
- Assign a confidence level (low, medium, high, very_high)
- Explain your reasoning clearly
- Consider the severity and duration
- Include relevant red flags or urgent considerations
- Always remind that this is AI-assisted analysis and requires doctor's clinical judgment

Format your response as structured data that will be used in a medical interface.`;

    const userPrompt = `Patient Symptoms Analysis Request:

Symptoms: ${symptoms}
Severity: ${severity}
Duration: ${duration}
${patientHistory ? `Patient History: ${patientHistory}` : ''}

Please provide:
1. Primary diagnosis suggestion with confidence level
2. Differential diagnoses (2-3 alternatives)
3. Clinical reasoning
4. Any red flags or urgent considerations
5. Recommended diagnostic tests or examinations`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_diagnosis",
              description: "Provide structured diagnosis analysis",
              parameters: {
                type: "object",
                properties: {
                  primary_diagnosis: {
                    type: "string",
                    description: "The most likely diagnosis"
                  },
                  confidence: {
                    type: "string",
                    enum: ["low", "medium", "high", "very_high"],
                    description: "Confidence level in the diagnosis"
                  },
                  reasoning: {
                    type: "string",
                    description: "Clinical reasoning for the diagnosis"
                  },
                  differential_diagnoses: {
                    type: "array",
                    items: { type: "string" },
                    description: "Alternative possible diagnoses"
                  },
                  red_flags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Urgent considerations or warning signs"
                  },
                  recommended_tests: {
                    type: "array",
                    items: { type: "string" },
                    description: "Recommended diagnostic tests"
                  }
                },
                required: ["primary_diagnosis", "confidence", "reasoning", "differential_diagnoses"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_diagnosis" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    console.log("AI response received");

    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      const analysis = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("No valid analysis returned from AI");
  } catch (error) {
    console.error("Error in analyze-symptoms:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});