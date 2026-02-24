import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl === "your-project-url" ||
    supabaseAnonKey === "your-anon-key"
  ) {
    console.warn(
      "Supabase environment variables are missing or using placeholders. Auth middleware will be bypassed. Please update .env.local with your project details.",
    );
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // getUser(). A simple mistake could make it very hard to debug
  // issues with users being logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // If Supabase redirected the OAuth code to the wrong path (e.g. /?code=...),
  // forward it to /auth/callback so the code exchange actually runs.
  const code = request.nextUrl.searchParams.get("code");
  if (code && !pathname.startsWith("/auth/callback")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  const isAuthCallback = pathname.startsWith("/auth/callback");
  const isAuthConfirm = pathname.startsWith("/auth/confirm");
  const isSignupPending = pathname.startsWith("/auth/signup-pending");
  const isLandingPage = pathname === "/";
  const isVerifyPage = pathname.startsWith("/verify");
  const isVerifySuccess = pathname === "/verify/success";
  const isLeaderboard = pathname === "/leaderboard";
  const isProfile = pathname.startsWith("/profile");
  const isAbout = pathname === "/about";

  // Public routes that don't need any auth check
  if (isProfile || isAuthCallback || isAuthConfirm || isSignupPending || isAbout) {
    return supabaseResponse;
  }

  // /leaderboard requires GitHub auth (but not email verification).
  // Unauthenticated visitors are sent to the landing page to sign in.
  // /verify/success is also exempt: the session may still be propagating.
  if (!user && !isLandingPage && !isVerifySuccess && !isLeaderboard) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // If logged in, check verification status
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_verified,first_name,last_name,program")
      .eq("id", user.id)
      .single();

    const isVerified = Boolean(profile?.is_verified);
    const hasSignupFields = Boolean(
      profile?.first_name?.trim() &&
      profile?.last_name?.trim() &&
      profile?.program?.trim(),
    );
    const isRegistered = hasSignupFields && isVerified;

    // If verified, redirect AWAY from /verify paths (except /verify/success)
    if (isRegistered && isVerifyPage && !isVerifySuccess) {
      const url = request.nextUrl.clone();
      url.pathname = "/leaderboard";
      return NextResponse.redirect(url);
    }

    // Users who have not completed signup+verification can only use landing/verify/leaderboard/about/auth paths.
    if (!isRegistered && !isVerifyPage && !isLandingPage && !isLeaderboard) {
      const url = request.nextUrl.clone();
      url.pathname = "/verify";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
