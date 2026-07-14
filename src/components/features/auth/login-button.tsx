"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/db/client";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type LoginButtonProps = {
  nextPath?: string;
};

export function LoginButton({ nextPath = "/app/dashboard" }: LoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);

    const supabase = createClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);

    if (nextPath) {
      callbackUrl.searchParams.set("next", nextPath);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      setIsLoading(false);
      throw error;
    }
  };

  return (
    <Button onClick={handleLogin} disabled={isLoading} size="lg">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang chuyển hướng...
        </>
      ) : (
        "Đăng nhập bằng Google"
      )}
    </Button>
  );
}
