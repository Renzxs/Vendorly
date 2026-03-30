"use node";

import { v } from "convex/values";

import { internalAction } from "./_generated/server";

const webhookUsername = "Vendorly Alerts";
const successGreen = 0x00ff00;

type DiscordField = {
  inline?: boolean;
  name: string;
  value: string;
};

type DiscordEmbed = {
  color: number;
  description: string;
  fields?: DiscordField[];
  title: string;
};

async function postDiscordMessage(args: {
  content: string;
  embeds?: DiscordEmbed[];
}) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn(
      "DISCORD_WEBHOOK_URL is not configured. Skipping Discord notification.",
    );
    return null;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      allowed_mentions: { parse: [] },
      content: args.content,
      embeds: args.embeds,
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
    const userName = formatOptionalValue(args.name);
    const content = `New user ${userName} with email ${args.email} has signed up!`;

    await postDiscordMessage(
      {
        content,
        embeds: [
          {
            title: "New User Sign Up",
            description: content,
            color: successGreen,
            fields: [
              {
                name: "User Name",
                value: userName,
              },
              {
                name: "Email",
                value: args.email,
              },
              {
                name: "Auth ID",
                value: args.authUserId,
              },
            ],
          },
        ],
      },
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
    const ownerName = formatOptionalValue(args.ownerName);
    const content = `New store ${args.storeName} with slug ${args.slug} was created by ${ownerName}!`;

    await postDiscordMessage(
      {
        content,
        embeds: [
          {
            title: "New Store Created",
            description: content,
            color: successGreen,
            fields: [
              {
                name: "Store Name",
                value: args.storeName,
              },
              {
                name: "Slug",
                value: args.slug,
              },
              {
                name: "Store ID",
                value: args.storeId,
              },
              {
                name: "Owner",
                value: ownerName,
              },
              {
                name: "Owner Email",
                value: args.ownerEmail,
              },
              {
                name: "Owner ID",
                value: args.ownerId,
              },
            ],
          },
        ],
      },
    );

    return null;
  },
});
