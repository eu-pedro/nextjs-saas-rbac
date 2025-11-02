import { getProfile } from "@/http/get-profile";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function isAuthenticated() {
  return !!(await cookies()).get("token")?.value
}

export async function auth() {
  const token = (await cookies()).get("token")?.value

  console.log(token)

  if (!token) {
    redirect('/api/auth/sign-out')
  }

  try {
    const { user } = await getProfile()

    return { user }
  } catch(err) {
    console.log(err)
   }


  redirect('/api/auth/sign-out')
}