import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().default(""),
  targetAudience: z.string().default(""),
  designStyle: z.string().default("minimal"),
  brandPersonality: z.string().default("minimalist"),
  currency: z.string().default("USD"),
});

function extractJsonObject(raw: string): string {
  const match = raw.match(/\{[\s\S]*\}/);

  if (match) {
    return match[0];
  }

  throw new SyntaxError("No JSON object found in Gemini response");
}

export const generateStoreContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => Input.parse(raw))
  .handler(async ({ data }) => {
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const personalityGuidelines: Record<string, string> = {
      elegant: "refined, luxurious, timeless wording.",
      premium: "high-end, exclusive branding language.",
      professional: "clear, trustworthy, business-oriented wording.",
      creative: "imaginative, expressive marketing copy.",
      playful: "friendly, energetic and fun tone.",
      minimalist: "short, clean and concise copy.",
    };

    const toneInstruction = personalityGuidelines[data.brandPersonality] || "balanced copy.";

    const prompt = `
Generate storefront content.

Business name: ${data.name}
Category: ${data.category}
Description: ${data.description || "(none)"}
Target audience: ${data.targetAudience || "(none)"}
Brand Personality: ${data.brandPersonality} (${toneInstruction})
Currency: ${data.currency}

Please write all copy (tagline, headlines, subheadlines, products) using a tone that is strictly ${data.brandPersonality}. Follow these tone guidelines: ${toneInstruction}

Return ONLY JSON with this structure:

{
  "tagline": "string",
  "heroHeadline": "string",
  "heroSubheadline": "string",
  "productCategories": ["string"],
  "products": [
    {
      "name": "string",
      "price": number,
      "category": "string"
    }
  ]
}
`;

    const models = [
      "gemini-flash-latest",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash-lite",
    ];

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],

      generationConfig: {
        temperature: 0,

        responseMimeType: "application/json",

        responseSchema: {
          type: "OBJECT",

          required: [
            "tagline",
            "heroHeadline",
            "heroSubheadline",
            "productCategories",
            "products",
          ],

          properties: {
            tagline: {
              type: "STRING",
            },

            heroHeadline: {
              type: "STRING",
            },

            heroSubheadline: {
              type: "STRING",
            },

            productCategories: {
              type: "ARRAY",
              items: {
                type: "STRING",
              },
            },

            products: {
              type: "ARRAY",

              items: {
                type: "OBJECT",

                required: [
                  "name",
                  "price",
                  "category",
                ],

                properties: {
                  name: {
                    type: "STRING",
                  },

                  price: {
                    type: "NUMBER",
                  },

                  category: {
                    type: "STRING",
                  },
                },
              },
            },
          },
        },
      },
    };

    let response: Response | null = null;
    let lastErrorText = "";

    for (let i = 0; i < models.length; i++) {
      if (i > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, 300)
        );
      }

      const model = models[i];

      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": key,
            },

            body: JSON.stringify(requestBody),
          }
        );

        if (response.ok) {
          break;
        }

        lastErrorText = await response.text();

        console.error(
          "[Gemini Error]",
          model,
          response.status,
          lastErrorText
        );

        response = null;

      } catch (error) {
        lastErrorText = String(error);

        console.error(
          "[Gemini Fetch Error]",
          model,
          error
        );

        response = null;
      }
    }


    if (!response) {
      throw new Error(
        `Gemini unavailable: ${lastErrorText}`
      );
    }


    const result = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    };


    const text =
      result.candidates?.[0]
        ?.content
        ?.parts?.[0]
        ?.text;


    if (!text) {
      throw new Error(
        "Empty Gemini response"
      );
    }


    let parsed: unknown;


    try {
      parsed = JSON.parse(text);

    } catch {

      try {
        parsed = JSON.parse(
          extractJsonObject(text)
        );

      } catch {

        console.error(
          "[Gemini Invalid JSON]",
          text
        );

        throw new Error(
          "Gemini returned invalid JSON"
        );
      }
    }


    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      throw new Error(
        "Gemini returned unexpected response shape"
      );
    }


    const content =
      parsed as Record<string, unknown>;


    return {
      tagline:
        typeof content.tagline === "string"
          ? content.tagline
          : "",


      heroHeadline:
        typeof content.heroHeadline === "string"
          ? content.heroHeadline
          : "",


      heroSubheadline:
        typeof content.heroSubheadline === "string"
          ? content.heroSubheadline
          : "",


      productCategories:
        Array.isArray(content.productCategories)
          ? content.productCategories as string[]
          : [],


      products:
        Array.isArray(content.products)

          ? content.products.map((item, index) => {

            const product =
              item as {
                name?: string;
                price?: number;
                category?: string;
              };


            return {
              id: `ai-${index}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,

              name: product.name ?? "",

              price:
                Number(product.price) || 0,

              category:
                product.category ?? "",
            };
          })

          : [],
    };
  });