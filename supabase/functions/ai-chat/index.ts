// AgroSphere AI assistant — uses Lovable AI Gateway (no API key required from user)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Sən AgroSphere platformasının AI köməkçisisən — Azərbaycan fermerlərinə kömək edirsən.
Cavabları HƏMİŞƏ Azərbaycan dilində ver. Qısa, praktik, dostcasına ol.
Mövzular: bitki xəstəlikləri, məhsul qiymətləri, hava şəraiti, gübrələmə, suvarma, texnika seçimi, işçi tapma,
icma sualları, bazar məsləhətləri. Texniki məsləhət verməzdən əvvəl mümkünsə bölgəni və bitkini soruş.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      let userMsg = "AI cavab verə bilmədi";
      if (response.status === 429) userMsg = "Çox sorğu göndərildi, bir az sonra yenidən cəhd edin";
      if (response.status === 402) userMsg = "AI kreditləri bitib";
      return new Response(JSON.stringify({ error: userMsg, detail: text }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
