import { NextRequest, NextResponse } from "next/server";
import { addToWaitlist } from "@/lib/db";
import { sendConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email } = body;

    // Input validation
    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return NextResponse.json(
        { message: "Please enter your name." },
        { status: 400 }
      );
    }

    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Save to database
    await addToWaitlist(cleanName, cleanEmail);

    // Send confirmation email — runs in background, doesn't block the response
    sendConfirmationEmail(cleanName, cleanEmail).catch((err) => {
      console.error("Confirmation email failed:", err);
    });

    return NextResponse.json(
      { message: "Successfully added to waitlist." },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "DUPLICATE_EMAIL") {
      return NextResponse.json(
        { message: "This email is already on our waitlist." },
        { status: 409 }
      );
    }

    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
