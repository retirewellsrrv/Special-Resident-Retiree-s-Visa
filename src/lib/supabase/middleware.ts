// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/supabase";


const PROTECTED_PREFIXES = ["/applicant", "/admin", "/super-admin"];
const PUBLIC_ONLY_PATHS = [
  "/login",
  "/register",
  "/about",
  "/contact",
  "/pricing",
  "/view-services",
];
const ADMIN_ONLY_PREFIXES = ["/admin"];
const APPLICANT_ONLY_PREFIXES = ["/applicant"];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

function isPublicOnly(pathname: string) {
  return PUBLIC_ONLY_PATHS.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
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

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  console.log("🔵 middleware hit:", pathname);
  console.log("👤 user:", user?.id ?? "null");
  console.log("👤 role:", user?.user_metadata?.role ?? "null");

  let userRole = user?.user_metadata?.role as string | undefined ?? null;

  if (user && userRole !== "super_admin") {
    const { data: superAdminProfile } = await supabase
      .from("super_admin_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (superAdminProfile) {
      userRole = "super_admin";
    }
  }

  if (!user && isProtected(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isPublicOnly(pathname)) {
    const homeUrl = request.nextUrl.clone();

    if (userRole === "super_admin") {
      const superAdminUrl = request.nextUrl.clone();
      superAdminUrl.pathname = "/super-admin/dashboard";
      return NextResponse.redirect(superAdminUrl);
    } else if (userRole === "admin") {
      const adminUrl = request.nextUrl.clone();
      adminUrl.pathname = "/admin/dashboard";
      return NextResponse.redirect(adminUrl);
    } else if (userRole === "applicant") {
      const applicantUrl = request.nextUrl.clone();
      applicantUrl.pathname = "/applicant/dashboard";
      return NextResponse.redirect(applicantUrl);
    }

    return NextResponse.redirect(homeUrl);
  }

  // ── Role-based access enforcement ──
  if (user) {
    if (pathname.startsWith("/applicant") && userRole !== "applicant") {
      const dest = userRole === "super_admin" ? "/super-admin/dashboard" : "/admin/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }

    if (pathname.startsWith("/admin") && userRole !== "admin" && userRole !== "super_admin") {
      return NextResponse.redirect(new URL("/applicant/dashboard", request.url));
    }

    if (pathname.startsWith("/super-admin") && userRole !== "super_admin") {
      const dest = userRole === "admin" ? "/admin/dashboard" : "/applicant/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  return supabaseResponse;
}