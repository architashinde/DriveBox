import { NextResponse } from "next/server";
import { sendEmailOTP } from "@/lib/actions/user.actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "");
    if (!email) {
      return NextResponse.json({ error: "Missing email." }, { status: 400 });
    }

    const result = await sendEmailOTP(email);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      accountId: result.accountId,
      demoCode: result.demoCode,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json({ error: "Failed to resend the code." }, { status: 500 });
  }
}