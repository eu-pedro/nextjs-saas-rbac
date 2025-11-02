'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

import GithubIcon from "@/assets/github-icon.svg";
import { singInWithEmailAndPassword } from "./actions";

import { AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFormState } from "@/hooks/use-form-state";
import { signInWithGithub } from "../actions";


export function SignInForm() {

  // const [{ success, message, errors }, formAction, isPending] = useActionState(singInWithEmailAndPassword, {
  //   success: false,
  //   message: null,
  //   errors: null
  // })


  const [{ success, message, errors }, handleSubmit, isPending] = useFormState({
    action: singInWithEmailAndPassword
  })

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {success === false && message && (
          <Alert variant='destructive'>
            <AlertTriangle className="size-4" />
            <AlertTitle>Sign in failed!</AlertTitle>
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>
        )}
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input name="email" type="email" id="email" />

          {errors?.properties?.email && (
            <p className="text-xs font-medium text-red-500 dar:text-red-400">{errors?.properties?.email.errors[0]}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input name="password" type="password" id="password" />

          {errors?.properties?.password && (
            <p className="text-xs font-medium text-red-500 dar:text-red-400">{errors?.properties?.password.errors[0]}</p>
          )}

          <Link
            href="/auth/forgot-password"
            className="text-xs font-medium text-foreground hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <Button className="w-full" type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            'Sign in with e-mail'
          )}
        </Button>

        <Button variant="link" size="sm" className="w-full" asChild>
          <Link href="/auth/sign-up">
            Create new account
          </Link>
        </Button>

      </form>

      <Separator />

      <form action={signInWithGithub}>

        <Button variant="outline" className="w-full" type="submit">
          <GithubIcon className="size-4 dark:invert" />
          Sign in with Github
        </Button>
      </form>
    </div>
  )
}