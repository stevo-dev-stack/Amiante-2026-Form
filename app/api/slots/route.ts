import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const submissions = await prisma.submission.findMany({
      select: {
        dropDate: true,
        dropTime: true,
        epiDate: true,
        epiTime: true,
      },
    });

    const bookedDropSlots: Record<string, string[]> = {};
    const bookedEpiSlots: Record<string, string[]> = {};

    for (const sub of submissions) {
      if (sub.dropDate && sub.dropTime) {
        if (!bookedDropSlots[sub.dropDate]) bookedDropSlots[sub.dropDate] = [];
        bookedDropSlots[sub.dropDate].push(sub.dropTime);
      }
      if (sub.epiDate && sub.epiTime) {
        if (!bookedEpiSlots[sub.epiDate]) bookedEpiSlots[sub.epiDate] = [];
        bookedEpiSlots[sub.epiDate].push(sub.epiTime);
      }
    }

    return NextResponse.json({ bookedDropSlots, bookedEpiSlots });
  } catch (err) {
    console.error("Fetch slots error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
