import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();
  const type = requestUrl.searchParams.get("type");

  if (code) {
    const supabase = createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Error exchanging code for session:", exchangeError);
      return NextResponse.redirect(`${origin}/login?error=AuthenticationFailed`);
    }
  }

  // Retrieve the session directly after exchanging the code
  const supabase = createClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.error("Error retrieving session:", sessionError);
    return NextResponse.redirect(`${origin}/login?error=AuthenticationFailed`);
  }

  const userId = session.user.id;

  // Check if the user exists in the profiles table
  const { data: existingUser, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (fetchError || !existingUser) {
    console.error("User not found in profiles table or error occurred:", fetchError);
    return NextResponse.redirect(`${origin}/signup/google`);
  }

  // Redirect based on the 'type' parameter or other query parameters
  if (type === "signup") {
    return NextResponse.redirect(`${origin}/signup/google`);
  } else if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  } else {
    return NextResponse.redirect(`${origin}/docs`);
  }
}
