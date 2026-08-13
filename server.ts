import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser limits for base64 image data payload
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Lazy-initialized Gemini client with required User-Agent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Healthcheck API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Neural Net Painter API" });
});

// Endpoint: Vision & CNN Layer Deep Analysis
app.post("/api/cnn-analyze", async (req, res) => {
  try {
    const { contentImageBase64, styleName, stylePrompt, contentWeight, styleWeight } = req.body;

    const ai = getGeminiClient();

    const parts: any[] = [];

    if (contentImageBase64) {
      // Strip data url prefix if present
      const cleanBase64 = contentImageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: "image/png",
          data: cleanBase64,
        },
      });
    }

    const promptText = `
You are a Convolutional Neural Network (CNN) VGG-19 Style Transfer & Computer Vision Expert.
Analyze the provided artwork image and the requested artistic style ("${styleName || 'Custom Style'}": ${stylePrompt || 'Expressive neural style'}).
Content Loss Weight (Alpha): ${contentWeight || 10}
Style Loss Weight (Beta): ${styleWeight || 1000}

Respond STRICTLY in JSON with the following structure:
{
  "contentFidelityScore": number (0-100),
  "styleAdherenceScore": number (0-100),
  "aiAnalysis": {
    "composition": "string describing spatial geometry and edge preservation",
    "dominantPalette": ["array of 4 hex color strings"],
    "textureEnergy": "high | medium | low description of Gram Matrix correlation",
    "collaborationTip": "specific action tip for Human + Robot co-painting"
  },
  "cNNMetrics": {
    "contentLoss": number (float, e.g. 12.4),
    "styleLoss": number (float, e.g. 145.8),
    "totalLoss": number (float, e.g. 158.2)
  },
  "layerActivations": [
    {
      "name": "Conv1_1 (Low-Level Edges & Color)",
      "activationPercentage": number (0-100),
      "contribution": "Primary color and edge detection"
    },
    {
      "name": "Conv2_1 (Textures & Gradients)",
      "activationPercentage": number (0-100),
      "contribution": "Local texture patterns and Gram correlation"
    },
    {
      "name": "Conv3_1 (Complex Motifs)",
      "activationPercentage": number (0-100),
      "contribution": "Artistic brushstroke shapes"
    },
    {
      "name": "Conv4_1 (High Semantic Features)",
      "activationPercentage": number (0-100),
      "contribution": "Deep object geometry & content representation"
    },
    {
      "name": "Conv5_1 (Global Abstraction)",
      "activationPercentage": number (0-100),
      "contribution": "Overall stylistic mood & atmosphere"
    }
  ]
}
`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            contentFidelityScore: { type: Type.NUMBER },
            styleAdherenceScore: { type: Type.NUMBER },
            aiAnalysis: {
              type: Type.OBJECT,
              properties: {
                composition: { type: Type.STRING },
                dominantPalette: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                textureEnergy: { type: Type.STRING },
                collaborationTip: { type: Type.STRING },
              },
            },
            cNNMetrics: {
              type: Type.OBJECT,
              properties: {
                contentLoss: { type: Type.NUMBER },
                styleLoss: { type: Type.NUMBER },
                totalLoss: { type: Type.NUMBER },
              },
            },
            layerActivations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  activationPercentage: { type: Type.NUMBER },
                  contribution: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json({ success: true, data });
  } catch (err: any) {
    console.error("CNN Analysis error:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Failed to analyze CNN feature maps",
    });
  }
});

// Endpoint: AI Style Transfer Image Generation & Robot Stroke Synthesis
app.post("/api/style-transfer", async (req, res) => {
  try {
    const { contentImageBase64, stylePrompt, styleName, robotBrushAssist } = req.body;

    const ai = getGeminiClient();

    const parts: any[] = [];

    if (contentImageBase64) {
      const cleanBase64 = contentImageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: "image/png",
          data: cleanBase64,
        },
      });
    }

    const fullPrompt = `Transform this image with high fidelity neural style transfer in the style of "${styleName || 'Artistic Masterpiece'}".
Style Characteristics: ${stylePrompt || 'Vibrant oil painting textures, expressive brush strokes, rich color palette and dynamic Gram Matrix features'}.
${robotBrushAssist ? 'Incorporate smooth robotic precision strokes and high-frequency edge enhancements.' : ''}
Keep the main subject structure visible while applying artistic texture throughout.`;

    parts.push({ text: fullPrompt });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    let generatedImageUrl = null;
    let textFeedback = "";

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
        } else if (part.text) {
          textFeedback += part.text + " ";
        }
      }
    }

    res.json({
      success: true,
      imageUrl: generatedImageUrl,
      feedback: textFeedback.trim() || "Style transfer synthesis complete.",
    });
  } catch (err: any) {
    console.error("Style transfer error:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Style transfer synthesis failed",
    });
  }
});

async function startServer() {
  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Neural Net Painter server running at http://localhost:${PORT}`);
  });
}

startServer();
