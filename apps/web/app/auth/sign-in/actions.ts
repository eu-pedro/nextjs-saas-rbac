"use server"

import { signInWithPassword } from "@/http/sign-in-with-password"
import { HTTPError } from "ky"
import { z } from "zod"
import { cookies } from 'next/headers'
import { redirect } from "next/navigation"

const signInSchema = z.object({
  email: z.email({ error: "Please, provide a valid e-mail address. " }),
  password: z.string().min(1, {
    error: "Please, provide your password."
  })
})

export async function singInWithEmailAndPassword(data: FormData) {

  const result = signInSchema.safeParse(Object.fromEntries(data))

  console.log(result)

  if (!result.success) {
    const errors = z.treeifyError(result.error)
    return {
      success: false,
      message: null,
      errors,
    }
  }

  const { email, password } = result.data

  try {
    const { token } = await signInWithPassword({
      email: email,
      password: password
    })

      ; (await cookies()).set("token", token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = await err.response.json()

      return {
        success: false,
        message,
        errors: null
      }
    }

    console.error(err)
    return {
      success: false,
      message: "Unexpected error, try again in a few minutes.",
      errors: null
    }
  }
  console.log(result)

  redirect("/")
}