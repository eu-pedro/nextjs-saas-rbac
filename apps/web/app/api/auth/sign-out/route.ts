import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  

  const redirectURL = request.nextUrl.clone()

  redirectURL.pathname = '/auth/sign-in'

  ;(await cookies()).delete("token")

  return NextResponse.redirect(redirectURL) 
}