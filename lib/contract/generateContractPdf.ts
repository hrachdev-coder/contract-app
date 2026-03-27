import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

import type { ContractData } from "@/app/types/contracts";
import { buildContractSections, formatContractDate } from "@/lib/contract/contractTerms";

export async function generateContractPdfBuffer(args: {
  employerName: string;
  contractData: ContractData;
}) {
  const { employerName, contractData } = args;

  const fontPath = path.join(process.cwd(), "public/fonts/Helvetica.ttf");
  if (!fs.existsSync(fontPath)) {
    throw new Error(`Font file not found at: ${fontPath}`);
  }

  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    font: fontPath,
  });

  const buffers: Uint8Array[] = [];
  doc.on("data", (chunk: unknown) => {
    buffers.push(chunk as Buffer);
  });

  const representativeName = employerName || contractData.brandName || "Brand Representative";
  const contractSections = buildContractSections({
    employerName: representativeName,
    creatorEmail: contractData.clientEmail,
    contractData,
    createdAt: contractData.campaignStartDate,
  });

  doc.fontSize(24).text("Influencer Campaign Agreement", { align: "center", underline: true });
  doc.moveDown();
  doc
    .fontSize(10)
    .fillColor("#475569")
    .text(`Generated on ${formatContractDate(new Date().toISOString().slice(0, 10))}`, {
      align: "center",
    });
  doc.moveDown(1.2);

  doc.fillColor("#0f172a").fontSize(11);

  contractSections.forEach((section) => {
    doc.fontSize(12).fillColor("#0f172a").text(section.title, {
      underline: false,
    });
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor("#334155").text(section.body, {
      align: "justify",
      lineGap: 2,
    });
    doc.moveDown(0.9);
  });

  doc.moveDown(0.8);
  doc.fontSize(12).fillColor("#0f172a").text("Signatures", { underline: false });
  doc.moveDown(0.6);

  doc.fontSize(11).fillColor("#334155").text("Brand Representative:");
  doc.moveDown(0.2);
  doc.text(`${representativeName}`);
  doc.moveDown(0.2);
  doc.text("Signature: _________________________   Date: __________________");
  doc.moveDown(0.9);

  doc.text("Creator:");
  doc.moveDown(0.2);
  doc.text(`${contractData.clientEmail || "Creator"}`);
  doc.moveDown(0.2);
  doc.text("Signature: _________________________   Date: __________________");

  await new Promise<void>((resolve, reject) => {
    doc.on("end", () => resolve());
    doc.on("error", (err: unknown) => reject(err));
    doc.end();
  });

  return Buffer.concat(buffers);
}

