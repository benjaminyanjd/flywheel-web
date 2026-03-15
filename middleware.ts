import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/expired",
  "/privacy",
  "/og-image",
  "/api/webhooks/(.*)",
  "/api/waitlist",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Public routes: allow through
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Not logged in: redirect to sign-in
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
