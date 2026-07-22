import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function buildOrigin(req: NextRequest): string {
  const host = req.headers.get("host") || `localhost:${process.env.PORT || "3096"}`;
  const protocol = req.nextUrl.protocol || "http:";
  return `${protocol}//${host}`;
}

export async function POST(req: NextRequest) {
  const origin = buildOrigin(req);
  try {
    const formData = await req.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const callbackUrl = formData.get("callbackUrl") as string || "/dashboard";

    if (!email || !password) {
      return NextResponse.redirect(new URL(`/auth/signin?error=missing&callbackUrl=${encodeURIComponent(callbackUrl)}`, origin));
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.redirect(new URL(`/auth/signin?error=invalid&callbackUrl=${encodeURIComponent(callbackUrl)}`, origin));
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.redirect(new URL(`/auth/signin?error=invalid&callbackUrl=${encodeURIComponent(callbackUrl)}`, origin));
    }

    // Manual CSRF: get token + cookie, then pass both
    const port = process.env.PORT || "3000";
    const baseUrl = `http://localhost:${port}`;

    // Step 1: Get CSRF token and capture cookie
    const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`, {
      cache: "no-store",
    });
    const { csrfToken } = await csrfRes.json();
    
    // Extract the CSRF cookie from the response (Node 18+ supports getSetCookie)
    const csrfCookies = csrfRes.headers.getSetCookie();
    const csrfCookieHeader = csrfCookies?.join("; ") || "";

    // Step 2: POST to credentials callback, manually passing the CSRF cookie
    const loginRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": csrfCookieHeader,
      },
      body: new URLSearchParams({ email, password, csrfToken }),
      redirect: "manual",
    });

    // Log what we got back
    console.log("Login proxy status:", loginRes.status);
    const allCookies = loginRes.headers.getSetCookie();
    console.log("Cookies from login:", JSON.stringify(allCookies));

    // Build response with redirect to callbackUrl on the correct host
    const response = NextResponse.redirect(new URL(callbackUrl.startsWith("/") ? callbackUrl : "/dashboard", origin));

    // Forward session-token cookie from NextAuth's response
    if (allCookies && allCookies.length > 0) {
      for (const cookie of allCookies) {
        if (cookie.includes("next-auth.session-token")) {
          response.headers.append("Set-Cookie", cookie);
          console.log("Forwarded session cookie!");
        }
      }
    }

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.redirect(new URL("/auth/signin?error=server", origin));
  }
}
