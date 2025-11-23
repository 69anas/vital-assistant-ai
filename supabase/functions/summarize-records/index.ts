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
    const { medicalRecordText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Summarizing medical record, length:", medicalRecordText?.length);

    const systemPrompt = `You are an AI medical assistant that summarizes medical records for doctors.

IMPORTANT GUIDELINES:
- Extract key clinical findings
- Highlight important diagnoses and treatments
- Identify critical lab results and vital signs
- Note allergies and medication history
- Summarize chronologically if applicable
- Flag any urgent or concerning information
- Keep summaries concise but comprehensive

Format your response as structured summary data.`;

    const userPrompt = `Please summarize the following medical record:

${medicalRecordText}

Provide:
1. A concise summary (2-3 paragraphs)
2. Key findings (bullet points)
3. Important diagnoses
4. Current medications
5. Allergies
6. Any urgent flags or concerns`;

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
              name: "provide_summary",
              description: "Provide structured medical record summary",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "Concise narrative summary of the medical record"
                  },
                  key_findings: {
                    type: "array",
                    items: { type: "string" },
                    description: "Important clinical findings and observations"
                  },
                  diagnoses: {
                    type: "array",
                    items: { type: "string" },
                    description: "Diagnoses mentioned in the record"
                  },
                  medications: {
                    type: "array",
                    items: { type: "string" },
                    description: "Current medications"
                  },
                  allergies: {
                    type: "array",
                    items: { type: "string" },
                    description: "Known allergies"
                  },
                  urgent_flags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Urgent concerns or red flags"
                  }
                },
                required: ["summary", "key_findings"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_summary" } }
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
      const summary = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(summary), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("No valid summary returned from AI");
  } catch (error) {
    console.error("Error in summarize-records:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});