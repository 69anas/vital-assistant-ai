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
    const { diagnosis, patientInfo, allergies, currentMedications } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Suggesting treatment for diagnosis:", diagnosis);

    const systemPrompt = `You are an AI medical assistant helping doctors create treatment plans based on diagnoses.

IMPORTANT GUIDELINES:
- Provide evidence-based treatment recommendations
- Consider patient allergies and current medications
- Suggest priority level (routine, urgent, emergency)
- Include medication names, dosages, and frequencies
- Provide precautions and contraindications
- Include follow-up recommendations
- Always emphasize that this requires doctor's review and approval

Format your response as structured treatment data.`;

    const userPrompt = `Treatment Planning Request:

Diagnosis: ${diagnosis}
${patientInfo ? `Patient Info: ${patientInfo}` : ''}
${allergies ? `Allergies: ${allergies}` : 'No known allergies'}
${currentMedications ? `Current Medications: ${currentMedications}` : 'No current medications'}

Please provide:
1. Treatment plan overview
2. Specific medications with dosages
3. Priority level (routine, urgent, emergency)
4. Precautions and contraindications
5. Follow-up instructions
6. Lifestyle recommendations`;

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
              name: "provide_treatment",
              description: "Provide structured treatment plan",
              parameters: {
                type: "object",
                properties: {
                  treatment_plan: {
                    type: "string",
                    description: "Overview of the treatment approach"
                  },
                  medications: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of medications with dosages"
                  },
                  priority: {
                    type: "string",
                    enum: ["routine", "urgent", "emergency"],
                    description: "Treatment priority level"
                  },
                  precautions: {
                    type: "string",
                    description: "Important precautions and contraindications"
                  },
                  follow_up: {
                    type: "string",
                    description: "Follow-up instructions and timeline"
                  },
                  lifestyle_recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lifestyle and self-care recommendations"
                  }
                },
                required: ["treatment_plan", "medications", "priority", "follow_up"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_treatment" } }
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
      const treatment = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(treatment), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("No valid treatment plan returned from AI");
  } catch (error) {
    console.error("Error in suggest-treatment:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});