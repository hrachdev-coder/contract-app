import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import * as fontkit from "fontkit";

import type { ContractData } from "@/app/types/contracts";

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
  doc.fontkit = fontkit;

  const buffers: Uint8Array[] = [];
  doc.on("data", (chunk: unknown) => {
    buffers.push(chunk as Buffer);
  });

  doc.fontSize(24).text("Contract Agreement", { align: "center", underline: true });
  doc.moveDown();

  doc.fontSize(12).text(`Employer: ${employerName}`);
  doc.text(`Client Email: ${contractData.clientEmail}`);
  doc.text(`Brand Name: ${contractData.brandName}`);
  doc.text(`Platform: ${contractData.platform}`);
  doc.text(`Deliverables: ${contractData.deliverables}`);
  doc.text(`Campaign Start: ${contractData.campaignStartDate}`);
  doc.text(`Campaign End: ${contractData.campaignEndDate}`);
  doc.text(
    `Payment: ${contractData.paymentAmount} ${contractData.currency}`
  );
  doc.text(
    `Payment Deadline (days): ${contractData.paymentDeadlineDays}`
  );
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

  await new Promise<void>((resolve, reject) => {
    doc.on("end", () => resolve());
    doc.on("error", (err: unknown) => reject(err));
    doc.end();
  });

  return Buffer.concat(buffers);
}

