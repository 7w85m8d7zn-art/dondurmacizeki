import { NextResponse } from "next/server"

import { getSessionCookieName } from "@/lib/auth"

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Cikis yapildi.",
    data: null,
  })

  response.cookies.set({
    name: getSessionCookieName(),
    value: "",
    path: "/",
    expires: new Date(0),
  })

  return response
}
