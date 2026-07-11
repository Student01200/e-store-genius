import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().default(""),
  targetAudience: z.string().default(""),
  designStyle: z.string().default("minimal"),
  currency: z.string().default("USD"),
});

export const generateStoreContent = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => Input.parse(raw))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const system = `You write brand and product copy for e-commerce storefronts. Respond with STRICT JSON only, no prose, no markdown.`;
    const prompt = `Generate storefront content for this business.

Business name: ${data.name}
Category: ${data.category}
Description: ${data.description || "(none)"}
Target audience: ${data.targetAudience || "(unspecified)"}
Design style: ${data.designStyle}
Currency: ${data.currency}

Return a JSON object with these exact keys:
{
  "tagline": string (max 8 words, evocative),
  "heroHeadline": string (5-10 words, poetic and specific),
  "heroSubheadline": string (1-2 sentences, warm and specific to the business),
  "productCategories": string[] (exactly 3 short category names, 1-2 words each),
  "products": Array<{ "name": string, "price": number, "category": string }> (exactly 4 realistic products with prices appropriate for the currency and category)
}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("AI is busy — try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits in workspace billing.");
      throw new Error(`AI request failed (${res.status})`);
    }

    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as {
      tagline?: string;
      heroHeadline?: string;
      heroSubheadline?: string;
      productCategories?: string[];
      products?: Array<{ name: string; price: number; category?: string }>;
    };

    return {
      tagline: parsed.tagline ?? "",
      heroHeadline: parsed.heroHeadline ?? "",
      heroSubheadline: parsed.heroSubheadline ?? "",
      productCategories: (parsed.productCategories ?? []).slice(0, 6),
      products: (parsed.products ?? []).slice(0, 8).map((p, i) => ({
        id: `ai-${i}-${Math.random().toString(36).slice(2, 8)}`,
        name: p.name,
        price: Number(p.price) || 0,
        category: p.category,
      })),
    };
  });
