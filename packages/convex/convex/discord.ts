"use node";

import { v } from "convex/values";

import { internalAction } from "./_generated/server";

const webhookUsername = "Vendorly Alerts";

async function postDiscordMessage(content: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn(
      "DISCORD_WEBHOOK_URL is not configured. Skipping Discord notification.",
    );
    return null;
  }

  const response = await fetch(`${webhookUrl}?wait=true`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      allowed_mentions: { parse: [] },
      content,
      username: webhookUsername,
    }),
  });

  if (!response.ok) {
    console.error("Discord webhook request failed", {
      body: await response.text(),
      status: response.status,
    });
  }

  return null;
}

function formatOptionalValue(value?: string) {
  return value && value.trim().length > 0 ? value.trim() : "Not provided";
}

export const notifyNewUser = internalAction({
  args: {
    authUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    await postDiscordMessage(
      [
        "New user created",
        `Name: ${formatOptionalValue(args.name)}`,
        `Email: ${args.email}`,
        `Auth ID: ${args.authUserId}`,
      ].join("\n"),
    );

    return null;
  },
});

export const notifyNewStore = internalAction({
  args: {
    ownerEmail: v.string(),
    ownerId: v.string(),
    ownerName: v.optional(v.string()),
    slug: v.string(),
    storeId: v.id("stores"),
    storeName: v.string(),
  },
  handler: async (_ctx, args) => {
    await postDiscordMessage(
      [
        "New store created",
        `Store: ${args.storeName}`,
        `Slug: ${args.slug}`,
        `Store ID: ${args.storeId}`,
        `Owner: ${formatOptionalValue(args.ownerName)}`,
        `Owner email: ${args.ownerEmail}`,
        `Owner ID: ${args.ownerId}`,
      ].join("\n"),
    );

    return null;
  },
});
