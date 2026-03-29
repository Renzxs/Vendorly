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

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
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

