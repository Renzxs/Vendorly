import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

const githubConfigured = Boolean(
  process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET,
);
const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

export const authProviderAvailability = {
  github: githubConfigured,
  google: googleConfigured,
};

const providers = [];
const marketplaceUrl =
  process.env.NEXT_PUBLIC_MARKETPLACE_URL ?? "http://localhost:3000";
const allowedRedirectOrigins = new Set<string>();

for (const candidate of [
  marketplaceUrl,
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001/dashboard",
]) {
  try {
    allowedRedirectOrigins.add(new URL(candidate).origin);
  } catch {
    // Ignore malformed environment values and fall back to baseUrl.
  }
}

if (githubConfigured) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  );
}

if (googleConfigured) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  );
}

export const { handlers, auth } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      try {
        const redirectUrl = new URL(url);

        if (
          redirectUrl.origin === new URL(baseUrl).origin ||
          allowedRedirectOrigins.has(redirectUrl.origin)
        ) {
          return redirectUrl.toString();
        }
      } catch {
        // Ignore malformed URLs and fall through to baseUrl.
      }

      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.vendorlyUserId = user.email || user.id || token.sub;
        token.vendorlyEmail = user.email || token.email || token.sub || "";
      }

      if (!token.vendorlyUserId) {
        token.vendorlyUserId = token.email || token.sub || "";
      }

      if (!token.vendorlyEmail) {
        token.vendorlyEmail = token.email || token.sub || "";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.vendorlyUserId || token.sub || "");
        session.user.email = String(
          token.vendorlyEmail || token.email || token.sub || "",
        );
        session.user.name = session.user.name || undefined;
        session.user.image = session.user.image || undefined;
      }

      return session;
    },
  },
});
