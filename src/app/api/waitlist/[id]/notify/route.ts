import { NextRequest, NextResponse } from "next/server";
import { getWaitlistEntries } from "@/lib/db";
import { sendNotifyEmail } from "@/lib/email";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
    }

    const entries = await getWaitlistEntries();
    const entry = entries.find((e) => e.id === numericId);
    if (!entry) {
      return NextResponse.json({ message: "Entry not found." }, { status: 404 });
    }

    await sendNotifyEmail(entry.name, entry.email);

    return NextResponse.json({ message: "Notification sent." });
  } catch (error) {
    console.error("Notify error:", error);
    return NextResponse.json(
      { message: "Failed to send notification." },
      { status: 500 }
    );
  }
}
