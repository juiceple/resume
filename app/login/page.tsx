import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SubmitButton } from "../../components/forms/submit-button";
import { Label } from "@/components/forms/label";
import { Input } from "@/components/forms/input";
import { FormMessage, Message } from "@/components/forms/form-message";
import { encodedRedirect } from "@/utils/utils";

// New import for Google Sign-In button
import GoogleSignInButton from "@/components/login/GoogleSingIn";

export default function Login({ searchParams }: { searchParams: Message }) {
  const signIn = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return encodedRedirect("error", "/login", "Could not authenticate user");
    }

    return redirect("/docs");
  };

  return (
    <div className="flex flex-col flex-1 p-4 w-full items-center justify-center min-h-screen">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{" "}
        Back
      </Link>
      
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-medium mb-2">Log in</h1>
        <p className="text-sm text-foreground/60 mb-8">
          Don't have an account?{" "}
          <Link className="text-blue-600 font-medium underline" href="/signup">
            Sign up
          </Link>
        </p>
        
        <form className="flex flex-col w-full justify-center gap-2 text-foreground [&>input]:mb-6">
          <div className="flex flex-col gap-2 [&>input]:mb-3">
            <Label htmlFor="email">Email</Label>
            <Input name="email" placeholder="you@example.com" required />
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                className="text-sm text-blue-600 underline"
                href="/forgot-password"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
            <SubmitButton formAction={signIn} pendingText="Signing In...">
              Log in
            </SubmitButton>
          </div>
          <FormMessage message={searchParams} />
        </form>
        
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or log in with</span>
            </div>
          </div>
          
          <div className="mt-6">
            <GoogleSignInButton />
          </div>
        </div>
      </div>
    </div>
  );
}