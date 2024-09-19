import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AuthButton() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signOut = async () => {
    "use server";

    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect("/login");
  };

  return user ? (
    <div className="flex items-center gap-4">
      {user.email}!
      <form action={signOut}>
        <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
          Logout
        </button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Link
        href="/login"
        className="h-8 flex items-center justify-center rounded-md no-underline text-sm font-medium px-4"
      >
        로그인
      </Link>
      <Link
        href="/signup"
        className="h-8 flex items-center justify-center rounded-md no-underline bg-black text-white text-sm font-medium px-4"
      >
        회원가입
      </Link>
    </div>
  );
}
