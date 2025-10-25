import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "./env.js";

const client = new GoogleGenerativeAI(config.geminiKey);

const mapMessagesToContents = (messages = []) => {
  const contents = [];
  let systemInstruction;

  for (const message of messages) {
    if (!message || !message.content) continue;

    if (message.role === "system") {
      systemInstruction = systemInstruction
        ? `${systemInstruction}\n\n${message.content}`
        : message.content;
      continue;
    }

    const role = message.role === "assistant" ? "model" : "user";
    contents.push({
      role,
      parts: [{ text: message.content }]
    });
  }

  return { systemInstruction, contents };
};

const buildModel = ({ model, systemInstruction }) => {
  const options = { model };
  if (systemInstruction) {
    options.systemInstruction = systemInstruction;
  }
  return client.getGenerativeModel(options);
};

export const chat = async ({ messages, model = config.geminiModel, responseFormat = "json" }) => {
  const { systemInstruction, contents } = mapMessagesToContents(messages);
  if (!contents.length) {
    throw new Error("Gemini chat requires at least one non-system message.");
  }

  const generationConfig = {
    temperature: 0.7,
    maxOutputTokens: 2048
  };

  if (responseFormat === "json") {
    generationConfig.responseMimeType = "application/json";
  }

  const generativeModel = buildModel({ model, systemInstruction });
  const result = await generativeModel.generateContent({
    contents,
    generationConfig
  });
  const response = await result.response;
  const text = response.text();
  if (!text) {
    throw new Error("Gemini response returned no text content.");
  }
  return text.trim();
};

export const generateImage = async ({ prompt, model = config.geminiImageModel }) => {
  if (!prompt) {
    throw new Error("Gemini image generation requires a prompt.");
  }
  const generativeModel = buildModel({ model });
  const result = await generativeModel.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ]
  });
  const response = await result.response;
  const parts = response.candidates?.flatMap((candidate) => candidate.content?.parts || []) || [];
  const imagePart = parts.find((part) => part.inlineData?.data);

  if (!imagePart) {
    throw new Error("Gemini response did not include image data.");
  }

  return {
    b64_json: imagePart.inlineData.data,
    mime_type: imagePart.inlineData.mimeType
  };
};
