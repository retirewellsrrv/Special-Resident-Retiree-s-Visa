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

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

function isPublicOnly(pathname: string) {
  return PUBLIC_ONLY_PATHS.some((p) => pathname.startsWith(p));
}

async function getUserRole(supabase: ReturnType<typeof createServerClient<Database>>): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const role = user.user_metadata?.role as string | undefined;
  if (role === "super_admin") return "super_admin";

  const [{ data: superAdminProfile }, { data: adminProfile }] = await Promise.all([
    supabase.from("super_admin_profiles").select("user_id").eq("user_id", user.id).maybeSingle(),
    supabase.from("admin_profiles").select("is_active").eq("user_id", user.id).maybeSingle(),
  ]);

  if (superAdminProfile) return "super_admin";
  if (adminProfile?.is_active) return "admin";
  if (role === "applicant") return "applicant";
  return null;
}

export async function proxy(request: NextRequest) {
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

  if (!user && isProtected(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isPublicOnly(pathname)) {
    const userRole = await getUserRole(supabase);

    if (userRole === "super_admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/super-admin/dashboard";
      return NextResponse.redirect(url);
    }

    if (userRole === "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }

    if (userRole === "applicant") {
      const url = request.nextUrl.clone();
      url.pathname = "/applicant/dashboard";
      return NextResponse.redirect(url);
    }

    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl);
  }

  return supabaseResponse;
}
