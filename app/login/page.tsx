"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "An account already exists with this email address. Please sign in with the original provider."
      : searchParams.get("error")
  );

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSignIn = async (provider: string) => {
    try {
      setIsLoading(true);
      await signIn(provider, {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      setError("Something went wrong. Please try again.");
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Choose your preferred sign in method
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-6">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => handleSignIn("github")}
            >
              <FaGithub className="mr-2 h-4 w-4" />
              Continue with GitHub
            </Button>
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => handleSignIn("google")}
            >
              <FcGoogle className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
