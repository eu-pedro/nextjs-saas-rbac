"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

import GithubIcon from "@/assets/github-icon.svg";
import { useFormState } from "@/hooks/use-form-state";
import { signUpAction } from "./actions";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { signInWithGithub } from "../actions";

export function SignUpForm() {
  const [{ success, message, errors }, handleSubmit, isPending] = useFormState({
    action: signUpAction,
  });

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {success === false && message && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Sign in failed!</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input name="name" id="name" />
          {errors?.properties?.name && (
            <p className="text-xs font-medium text-red-500 dar:text-red-400">
              {errors?.properties?.name.errors[0]}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input name="email" type="email" id="email" />
          {errors?.properties?.email && (
            <p className="text-xs font-medium text-red-500 dar:text-red-400">
              {errors?.properties?.email.errors[0]}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input name="password" type="password" id="password" />
          {errors?.properties?.password && (
            <p className="text-xs font-medium text-red-500 dar:text-red-400">
              {errors?.properties?.password.errors[0]}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Confirme your password</Label>
          <Input
            name="password_confirmation"
            type="password"
            id="password_confirmation"
          />
          {errors?.properties?.password_confirmation && (
            <p className="text-xs font-medium text-red-500 dar:text-red-400">
              {errors?.properties?.password_confirmation.errors[0]}
            </p>
          )}
        </div>

        <Button className="w-full" type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Create new accountl"
          )}
        </Button>

        <Button variant="link" size="sm" className="w-full" asChild>
          <Link href="/auth/sign-in">Already registered? Sign in</Link>
        </Button>
      </form>
      <Separator />

      <form action={signInWithGithub}>
        <Button variant="outline" className="w-full" type="submit">
          <GithubIcon className="size-4 dark:invert" />
          Sign up with Github
        </Button>
      </form>
    </div>
  );
}
