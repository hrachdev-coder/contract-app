export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Resend } from "resend";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import * as fontkit from "fontkit"; // fontkit ճիշտ ներմուծում

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, employerName, contractData } = body;

    // Վերահսկում պարտադիր դաշտերը
    if (!email || !employerName || !contractData) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Font path
    const fontPath = path.join(process.cwd(), "public/fonts/Helvetica.ttf");
    if (!fs.existsSync(fontPath)) {
      console.error("Font file not found at:", fontPath);
      return NextResponse.json(
        { success: false, message: "Font file not found" },
        { status: 500 }
      );
    }

    // 1️⃣ Generate PDF
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      font: fontPath, // TTF ֆոնտը անմիջապես կոնստրուկտորում
    });
    doc.fontkit = fontkit; // կապում ենք fontkit

    const buffers: Uint8Array[] = [];
    // doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("data", (chunk: Buffer) => buffers.push(chunk));

    // PDF content
    doc.fontSize(24).text("Contract Agreement", { align: "center", underline: true });
    doc.moveDown();

    doc.fontSize(12).text(`Employer: ${employerName}`);
    doc.text(`Client Email: ${contractData.clientEmail}`);
    doc.text(`Brand Name: ${contractData.brandName}`);
    doc.text(`Platform: ${contractData.platform}`);
    doc.text(`Deliverables: ${contractData.deliverables}`);
    doc.text(`Campaign Start: ${contractData.campaignStartDate}`);
    doc.text(`Campaign End: ${contractData.campaignEndDate}`);
    doc.text(`Payment: ${contractData.paymentAmount} ${contractData.currency}`);
    doc.text(`Payment Deadline (days): ${contractData.paymentDeadlineDays}`);
    doc.text(`Usage Rights: ${contractData.usageRights}`);
    doc.text(`Revisions: ${contractData.revisions}`);
    if (contractData.exclusivity) {
      doc.text(`Exclusivity: Yes`);
      doc.text(`Exclusivity Duration: ${contractData.exclusivityDuration}`);
    } else {
      doc.text(`Exclusivity: No`);
    }

    doc.moveDown();
    doc.text("Thank you for your cooperation.", { align: "center" });

    // PDF ավարտ
    await new Promise<void>((resolve, reject) => {
      doc.on("end", () => resolve());
      // doc.on("error", (err) => reject(err));
      doc.on("error", (err: unknown) => reject(err));
      doc.end();
    });

    const pdfBuffer = Buffer.concat(buffers);

    // 2️⃣ Send email via Resend
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Your Contract PDF",
      html: `<p>Hello, please find your contract attached.</p>`,
      attachments: [
        // {
        //   content: pdfBuffer.toString("base64"),
        //   filename: "contract.pdf",
        //   type: "application/pdf",
        //   disposition: "attachment",
        // },
        {
  content: pdfBuffer.toString("base64"),
  filename: "contract.pdf",
  contentType: "application/pdf", // ✅ այստեղ է հիմնական փոփոխությունը
}
      ],
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("EMAIL ERROR:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Email failed",
      },
      { status: 500 }
    );
  }
}