"use server"

import { redirect } from "next/navigation"

export async function signInWithGithub() {
  const githubSingInURL = new URL('login/oauth/authorize', 'https://github.com')

  githubSingInURL.searchParams.set('client_id', 'Ov23lidyEzjYVuwsyTH1')
  githubSingInURL.searchParams.set('redirect_uri', 'http://localhost:3000/api/auth/callback')
  githubSingInURL.searchParams.set('scope', 'user')

  redirect(githubSingInURL.toString())
}