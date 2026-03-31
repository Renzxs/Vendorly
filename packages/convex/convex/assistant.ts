"use node";

import ModelClient, {
  type ChatRequestAssistantMessage,
  type ChatRequestMessage,
  type ChatRequestUserMessage,
  isUnexpected,
} from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action } from "./_generated/server";

const assistantContextRef = (internal as any).assistantContext
  .getStoreAssistantContext;

const DEFAULT_GITHUB_MODELS_ENDPOINT = "https://models.github.ai/inference";
const DEFAULT_GITHUB_MODELS_MODEL = "deepseek/DeepSeek-V3-0324";
const MAX_COMPLETION_TOKENS = 500;
const MAX_HISTORY_MESSAGES = 8;
const MAX_QUESTION_LENGTH = 600;

type AssistantContext = {
  catalogPreview: Array<{
    description: string;
    isSoldOut: boolean;
    price: number;
    title: string;
  }>;
  catalogPreviewLimit: number;
  highlightedProduct: {
    description: string;
    isSoldOut: boolean;
    price: number;
    title: string;
  } | null;
  store: {
    bio?: string;
    description: string;
    instagramUrl?: string;
    layoutType: "grid" | "list";
    name: string;
    slug: string;
    themeColor: string;
    tiktokUrl?: string;
    websiteUrl?: string;
    xUrl?: string;
  };
};

function normalizeText(value: string | undefined, fallback = "Not provided.") {
  if (!value) {
    return fallback;
  }

  const normalized = value.replace(/\s+/g, " ").trim();

  return normalized.length > 0 ? normalized : fallback;
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}...`;
}

function formatPhpPrice(value: number) {
  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    style: "currency",
  }).format(value);
}

function buildCatalogPreviewLines(context: AssistantContext) {
  if (context.catalogPreview.length === 0) {
    return ["- No products are currently listed in the catalog preview."];
  }

  return context.catalogPreview.map(
    (product) =>
      `- ${product.title} | ${formatPhpPrice(product.price)} | ${
        product.isSoldOut ? "Sold out" : "Available"
      } | ${truncateText(normalizeText(product.description), 220)}`,
  );
}

function buildSocialLinksLine(context: AssistantContext) {
  const links = [
    context.store.websiteUrl
      ? `Website: ${normalizeText(context.store.websiteUrl)}`
      : null,
    context.store.instagramUrl
      ? `Instagram: ${normalizeText(context.store.instagramUrl)}`
      : null,
    context.store.tiktokUrl
      ? `TikTok: ${normalizeText(context.store.tiktokUrl)}`
      : null,
    context.store.xUrl ? `X: ${normalizeText(context.store.xUrl)}` : null,
  ].filter(Boolean);

  return links.length > 0 ? links.join(" | ") : "Social links: Not provided.";
}

function buildSystemPrompt(context: AssistantContext) {
  const promptLines = [
    "You are Vendorly AI, a shopping assistant for a storefront.",
    "Answer only with information grounded in the provided storefront data and the conversation history.",
    "If the user asks about something not present in the storefront data, say you do not see that detail yet instead of guessing.",
    "Do not invent shipping policies, dimensions, materials, discount codes, contact emails, or stock counts beyond the explicit context.",
    "Keep answers concise, friendly, and shopper-focused.",
    "",
    "Store context:",
    `- Store name: ${context.store.name}`,
    `- Store slug: ${context.store.slug}`,
    `- Store description: ${normalizeText(context.store.description)}`,
    `- Store bio: ${normalizeText(context.store.bio)}`,
    `- Store layout: ${context.store.layoutType}`,
    `- Theme color: ${context.store.themeColor}`,
    `- Links: ${buildSocialLinksLine(context)}`,
    "",
    `Catalog preview note: You only have up to ${context.catalogPreviewLimit} recent products from this store. Do not claim this is the complete catalog unless the user only asks about the listed preview items.`,
  ];

  if (context.highlightedProduct) {
    promptLines.push(
      "",
      "Highlighted product:",
      `- Title: ${context.highlightedProduct.title}`,
      `- Price: ${formatPhpPrice(context.highlightedProduct.price)}`,
      `- Status: ${
        context.highlightedProduct.isSoldOut ? "Sold out" : "Available"
      }`,
      `- Description: ${normalizeText(context.highlightedProduct.description)}`,
    );
  }

  promptLines.push("", "Catalog preview:", ...buildCatalogPreviewLines(context));

  return promptLines.join("\n");
}

function buildConversationHistory(
  messages: Array<{ content: string; role: "assistant" | "user" }>,
) {
  return messages
    .slice(-MAX_HISTORY_MESSAGES)
    .flatMap((message): ChatRequestMessage[] => {
      const content = message.content.trim();

      if (!content) {
        return [];
      }

      if (message.role === "assistant") {
        const assistantMessage: ChatRequestAssistantMessage = {
          content,
          role: "assistant",
        };

        return [assistantMessage];
      }

      const userMessage: ChatRequestUserMessage = {
        content,
        role: "user",
      };

      return [userMessage];
    });
}

function resolveAnswerText(content: string | null | undefined) {
  const answer = content?.trim();

  if (answer) {
    return answer;
  }

  return "I couldn't find a grounded answer in the current storefront data.";
}

function resolveUnexpectedErrorMessage(response: {
  body?: { error?: { message?: string } };
}) {
  return (
    response.body?.error?.message ??
    "GitHub Models returned an unexpected response."
  );
}

export const askStoreAssistant = action({
  args: {
    messages: v.array(
      v.object({
        content: v.string(),
        role: v.union(v.literal("assistant"), v.literal("user")),
      }),
    ),
    productId: v.optional(v.id("products")),
    question: v.string(),
    storeId: v.id("stores"),
  },
  handler: async (ctx, args) => {
    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      throw new Error(
        "GitHub Models is not configured yet. Add GITHUB_TOKEN to your Convex environment.",
      );
    }

    const question = args.question.trim();

    if (!question) {
      throw new Error("Question cannot be empty.");
    }

    if (question.length > MAX_QUESTION_LENGTH) {
      throw new Error(
        `Please keep questions under ${MAX_QUESTION_LENGTH} characters so the assistant can stay focused.`,
      );
    }

    const context = (await ctx.runQuery(assistantContextRef, {
      productId: args.productId,
      storeId: args.storeId,
    })) as AssistantContext | null;

    if (!context) {
      throw new Error("Store not found.");
    }

    const endpoint =
      process.env.GITHUB_MODELS_ENDPOINT ?? DEFAULT_GITHUB_MODELS_ENDPOINT;
    const model =
      process.env.GITHUB_MODELS_MODEL ?? DEFAULT_GITHUB_MODELS_MODEL;

    const client = ModelClient(
      endpoint,
      new AzureKeyCredential(githubToken),
    );

    const response = await client.path("/chat/completions").post({
      body: {
        max_tokens: MAX_COMPLETION_TOKENS,
        messages: [
          {
            content: buildSystemPrompt(context),
            role: "system",
          },
          ...buildConversationHistory(args.messages),
          {
            content: question,
            role: "user",
          },
        ],
        model,
        temperature: 0.7,
        top_p: 1,
      },
    });

    if (isUnexpected(response)) {
      throw new Error(resolveUnexpectedErrorMessage(response));
    }

    return {
      answer: resolveAnswerText(response.body.choices[0]?.message?.content),
      model,
    };
  },
});
