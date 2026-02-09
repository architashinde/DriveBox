import { NextResponse } from "next/server";
import { verifySecret } from "@/lib/actions/user.actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accountId, password } = body;

    if (!accountId || !password) {
      return NextResponse.json(
        { error: "Missing accountId or password" },
        { status: 400 }
      );
    }

    const formData = new FormData();
    formData.append("accountId", accountId);
    formData.append("password", password);

    const result = await verifySecret(formData);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}