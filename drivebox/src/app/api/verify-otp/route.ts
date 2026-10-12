import { NextResponse } from "next/server";
import { verifySecret } from "@/lib/actions/user.actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const accountId = String(body.accountId || "");
    const password = String(body.password || "");

    if (!accountId || !password) {
      return NextResponse.json({ error: "Missing account or code." }, { status: 400 });
    }

    const result = await verifySecret(accountId, password);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json({ error: "Failed to verify the code." }, { status: 500 });
  }
}