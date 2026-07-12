import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

/**
 * Next.js 16 proxy (replaces the deprecated middleware.ts convention).
 * Runs before every non-static request to refresh the Supabase session cookie.
 */
export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and known assets.
     * This lets Supabase refresh the session cookie on every navigation.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
