import { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/",
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      let isLoggedIn = !!auth?.user;
      let isOnChat = nextUrl.pathname.startsWith("/");
      let isOnRegister = nextUrl.pathname.startsWith("/register");
      let isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        return Response.redirect(new URL("/", nextUrl));
      }

      if (isOnRegister || isOnLogin) {
        return true; // Always allow access to register and login pages
      }

      let isOnHandsOn = nextUrl.pathname.startsWith("/handson");
      if (isOnHandsOn && !isLoggedIn) {
        return false;
      }

      if (isOnChat) {
        if (isLoggedIn) {
          // We need to check if we should redirect based on role/homePage
        } else {
          return true; // Allow access to root (PaaS Login) for unauthenticated users
        }
      }

      if (isLoggedIn) {
        const isPaaS = (auth?.user as any)?.isPaaS;
        const homePage = (auth?.user as any)?.homePage;

        if (isPaaS) {
          // PaaS User Redirection

          // If they are on the root page, redirect them to their dashboard/admin
          if (nextUrl.pathname === "/") {
            // If backend provided a homePage, use it.
            if (homePage && homePage !== "/") {
              return Response.redirect(new URL(homePage, nextUrl));
            }

            // Fallback Role-based redirection
            const userRole = (auth?.user as any)?.roles?.[0]; // Assuming first role is primary
            if (['admin', 'System Manager', 'Administrator'].includes(userRole)) {
              return Response.redirect(new URL("/paas/admin", nextUrl));
            } else if (['seller', 'manager', 'Seller'].includes(userRole)) {
              return Response.redirect(new URL("/paas/dashboard", nextUrl));
            }
          }
          // Otherwise let them go where they want (within PaaS usually)
          return true;
        } else {
          // Tenant User Redirection (Non-PaaS)

          // Prevent them from going to /paas/*
          if (nextUrl.pathname.startsWith("/paas")) {
            // Redirect to their homePage (likely /) or root
            return Response.redirect(new URL(homePage || "/", nextUrl));
          }

          // If they are on root, let them stay there (Chat)

          return true;
        }
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
