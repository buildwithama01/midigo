import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";
import { isSupabaseConfigured } from "./config";
import { getRoleLevel } from "./roles";
import { getRequiredRoleForRoute } from "@/lib/adminConfig";

/**
 * Refreshes the Supabase auth session on every request so tokens
 * stay valid. Called from the project-root `middleware.ts`.
 */
export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    const pathname = request.nextUrl.pathname;
    const url = request.nextUrl.clone();

    if (pathname.startsWith("/dashboard") || pathname.startsWith("/chatter")) {
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh the session — do NOT remove this line.
  // It's required to keep the user logged in across page navigations.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      url.pathname = "/admin/login";
      url.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(url);
    }

    // Check profile role against route-specific requirements
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const requiredRole = getRequiredRoleForRoute(pathname);
    if (!requiredRole) {
      // Not an admin route — allow through
    } else if (!profile) {
      // No profile found — deny access
      url.pathname = "/admin/login";
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    } else if (getRoleLevel(profile.role) < getRoleLevel(requiredRole)) {
      // Role below the minimum required for this route
      url.pathname = "/admin/login";
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
  }

  // If authenticated admin visits /admin/login, redirect to /admin
  if (pathname === "/admin/login" && user) {
    url.pathname = "/admin";
    url.searchParams.delete("redirectedFrom");
    return NextResponse.redirect(url);
  }

  // Protect /dashboard routes — any authenticated user
  if (pathname.startsWith("/dashboard") && !user) {
    url.pathname = "/sign-in";
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  // Protect /chatter routes — requires role chatter or higher
  if (pathname.startsWith("/chatter") && !user) {
    url.pathname = "/sign-in";
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/chatter") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || getRoleLevel(profile.role) < getRoleLevel("chatter")) {
      url.pathname = "/sign-in";
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
