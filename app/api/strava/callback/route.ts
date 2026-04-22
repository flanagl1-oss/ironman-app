
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Missing Strava env vars" }, { status: 500 });
  }

  // Exchange the code for an access token here in a production app.
  // Then fetch athlete activities and store them server-side.
  return NextResponse.json({ message: "OAuth callback received", code });
}
