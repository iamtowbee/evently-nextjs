"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages = {
    OAuthAccountNotLinked:
      "There was an issue linking your GitHub account. Please try signing out of GitHub completely and signing in again.",
    OAuthSignin:
      "Error occurred while signing in with GitHub. Please try again.",
    OAuthCallback:
      "Error occurred while processing GitHub login. Please try again.",
    default: "An error occurred during sign in. Please try again.",
  };

  async function handleSignIn() {
    try {
      setIsLoading(true);
      await signIn("github", {
        callbackUrl: `${window.location.origin}`,
      });
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorMessages[error as keyof typeof errorMessages] ||
                  errorMessages.default}
              </AlertDescription>
            </Alert>
          )}
          <Button
            variant="outline"
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
            ) : (
              <FaGithub className="mr-2 h-4 w-4" />
            )}
            Continue with GitHub
          </Button>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          <p>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
