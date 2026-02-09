import { NextResponse } from "next/server";
import { sendEmailOTP } from "@/lib/actions/user.actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Missing email" },
        { status: 400 }
      );
    }

    await sendEmailOTP({ email });

    return NextResponse.json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: "Failed to resend OTP" },
      { status: 500 }
    );
  }
}