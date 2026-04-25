import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register", "/auth/callback"];
const AUTH_SETUP_ROUTE = "/setup-profile";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isSetupRoute = pathname.startsWith(AUTH_SETUP_ROUTE);
  const isRootRoute = pathname === "/";

  // Not authenticated → redirect to login (except public routes)
  if (!user && !isPublicRoute && !isRootRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  // Authenticated → check if profile exists before allowing main routes
  if (user && !isPublicRoute && !isSetupRoute && !isRootRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    // No profile yet → redirect to setup
    if (!profile) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/setup-profile";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Authenticated + has profile → redirect away from auth pages
  if (user && isPublicRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = profile ? "/feed" : "/setup-profile";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
