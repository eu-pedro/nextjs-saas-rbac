"use server";

import { signInWithPassword } from "@/http/sign-in-with-password";
import { HTTPError } from "ky";
import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signUp } from "@/http/sign-up";

const signUpSchema = z
  .object({
    email: z.email({ error: "Please, provide a valid e-mail address." }),
    password: z.string().min(6, {
      error: "Password should have at least 6 characters",
    }),
    name: z.string().refine((value) => value.split(" ").length > 1, {
      message: "Please, enter your full name.",
    }),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    error: "Password confirmation does not match",
    path: ["password_confirmation"],
  });

export async function signUpAction(data: FormData) {
  const result = signUpSchema.safeParse(Object.fromEntries(data));

  if (!result.success) {
    const errors = z.treeifyError(result.error);
    return {
      success: false,
      message: null,
      errors,
    };
  }

  const { email, password, name } = result.data;

  try {
    await signUp({
      email: email,
      password: password,
      name,
    });
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = await err.response.json();
      console.log(err);

      return {
        success: false,
        message,
        errors: null,
      };
    }

    console.error(err);
    return {
      success: false,
      message: "Unexpected error, try again in a few minutes.",
      errors: null,
    };
  }
  console.log(result);

  redirect("/auth/sign-in");
}
