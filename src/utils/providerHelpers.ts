import {
  createOpenAIAdapter,
  createAnthropicAdapter,
  createGeminiAdapter,
} from "../adapters";
import type { ISendMessageParams } from "../hooks/useChatMessages";

/**
 * Pre-configured streaming handler for OpenAI GPT models.
 *
 * @param apiKey - Optional OpenAI API key (if not using a proxy)
 * @param baseUrl - Optional base URL (defaults to OpenAI API)
 * @returns A configuration object for useChatMessages streamConfig
 */
export const openAIStreamConfig = (
  options: {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
  } = {},
) => {
  const {
    apiKey,
    baseUrl = "https://api.openai.com/v1/chat/completions",
    model = "gpt-4",
  } = options;

  return {
    url: baseUrl,
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    adapter: createOpenAIAdapter(),
    transformBody: (params: ISendMessageParams) => ({
      model: model || params.modelName || "gpt-4",
      messages: [
        ...params.messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: params.userInput },
      ],
      stream: true,
    }),
  };
};

/**
 * Pre-configured streaming handler for Anthropic Claude models.
 */
export const anthropicStreamConfig = (
  options: {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
  } = {},
) => {
  const {
    apiKey,
    baseUrl = "https://api.anthropic.com/v1/messages",
    model = "claude-3-5-sonnet-20241022",
  } = options;

  return {
    url: baseUrl,
    headers: apiKey
      ? {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        }
      : {},
    adapter: createAnthropicAdapter(),
    transformBody: (params: ISendMessageParams) => ({
      model: model || params.modelName || "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        ...params.messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: params.userInput },
      ],
      stream: true,
    }),
  };
};

/**
 * Pre-configured streaming handler for Google Gemini models.
 */
export const geminiStreamConfig = (
  options: {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
  } = {},
) => {
  const { apiKey, baseUrl, model = "gemini-pro" } = options;
  const url =
    baseUrl ||
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent${apiKey ? `?key=${apiKey}` : ""}`;

  return {
    url,
    adapter: createGeminiAdapter(),
    transformBody: (params: ISendMessageParams) => ({
      contents: [
        ...params.messages.map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
        { role: "user", parts: [{ text: params.userInput }] },
      ],
    }),
  };
};
