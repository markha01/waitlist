import { NextRequest, NextResponse } from "next/server";
import { removeFromWaitlist } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
    }

    const removed = await removeFromWaitlist(numericId);
    if (!removed) {
      return NextResponse.json({ message: "Entry not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Removed." });
  } catch (error) {
    console.error("Waitlist DELETE error:", error);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
