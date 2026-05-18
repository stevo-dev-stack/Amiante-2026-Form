import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { sendInitialConfirmationEmail } from "@/lib/email";

function generateCode() {
  return "AM-" + Math.random().toString(36).toUpperCase().slice(2, 8);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const site = formData.get("site") as string;
    const nom = formData.get("nom") as string;
    const prenom = formData.get("prenom") as string;
    const adresse = formData.get("adresse") as string;
    const email = formData.get("email") as string;
    const dropDate = formData.get("dropDate") as string;
    const dropTime = formData.get("dropTime") as string;
    const epiDate = formData.get("epiDate") as string;
    const epiTime = formData.get("epiTime") as string;
    const file = formData.get("document") as File | null;

    if (!site || !nom || !prenom || !adresse || !email || !dropDate || !dropTime || !epiDate || !epiTime) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    let documentName = "";
    let documentPath: string | undefined;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = path.extname(file.name);
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);
      documentName = file.name;
      documentPath = `/uploads/${filename}`;
    }

    const code = generateCode();

    const submission = await prisma.submission.create({
      data: {
        code,
        site,
        nom,
        prenom,
        adresse,
        email,
        documentName,
        documentPath,
        dropDate,
        dropTime,
        epiDate,
        epiTime,
        status: "pending",
      },
    });

    await sendInitialConfirmationEmail(submission);

    return NextResponse.json({ success: true, code: submission.code });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
