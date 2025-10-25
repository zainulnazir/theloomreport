import { chat } from "./gemini.js";

const categories = [
  "harassment/threatening",
  "hate/threatening",
  "self-harm/intent",
  "sexual/minors"
];

const systemPrompt = `You are a content safety classifier for TheLoomReport. Review text and determine if it violates policy in any of these categories: ${categories.join(", ")}.
Always respond with strict JSON using the shape {"flagged": boolean, "categories": string[], "rationale": string}.
Only include categories that truly apply.`;

const parseModeration = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`Gemini moderation returned invalid JSON: ${error.message}`);
  }
};

export const moderateText = async (text) => {
  const resultText = await chat({
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Analyze the following text for safety concerns. Do not classify formatting artifacts.

"""${text}"""`
      }
    ],
    responseFormat: "json"
  });

  const parsed = parseModeration(resultText);
  const flaggedCategories = categories.filter((category) => parsed.categories?.includes(category));

  return {
    flagged: Boolean(parsed.flagged),
    categories: flaggedCategories,
    raw: parsed
  };
};

export const assertSafe = async (text, context = "content") => {
  const moderation = await moderateText(text);
  if (moderation.flagged) {
    const reason = moderation.categories.join(", ");
    throw new Error(`Moderation failed for ${context}: ${reason || "unknown issue"}`);
  }
  return moderation;
};
