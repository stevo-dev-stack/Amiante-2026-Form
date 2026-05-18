import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendValidationEmail } from "@/lib/email";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, notes } = body;

  try {
    const current = await prisma.submission.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
        validatedBy: session.displayName,
      },
    });

    // Send email only if status changed TO "validated"
    if (current.status !== "validated" && status === "validated") {
      await sendValidationEmail(updated);
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH submission]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.submission.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
