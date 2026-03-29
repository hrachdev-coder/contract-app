import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

import type { ContractAcceptanceEvidence, ContractData } from "@/app/types/contracts";
import { buildContractSections, formatContractDate } from "@/lib/contract/contractTerms";

export async function generateContractPdfBuffer(args: {
  employerName: string;
  contractData: ContractData;
  acceptanceEvidence?: ContractAcceptanceEvidence | null;
}) {
  const { employerName, contractData, acceptanceEvidence } = args;

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

  const representativeName = employerName || contractData.brandName || "Company Representative";
  const contractSections = buildContractSections({
    employerName: representativeName,
    clientEmail: contractData.clientEmail,
    contractData,
    createdAt: contractData.campaignStartDate,
  });

  doc.fontSize(24).text("Client Service Agreement", { align: "center", underline: true });
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

  doc.fontSize(11).fillColor("#334155").text("Company Representative:");
  doc.moveDown(0.2);
  doc.text(`${representativeName}`);
  doc.moveDown(0.2);
  doc.text("Signature: _________________________   Date: __________________");
  doc.moveDown(0.9);

  doc.text("Client:");
  doc.moveDown(0.2);
  doc.text(`${acceptanceEvidence?.signerName || contractData.clientEmail || "Client"}`);
  if (acceptanceEvidence?.signerTitle) {
    doc.moveDown(0.2);
    doc.text(`Title: ${acceptanceEvidence.signerTitle}`);
  }
  doc.moveDown(0.2);
  if (acceptanceEvidence?.acceptedAt) {
    doc.text(`Electronically signed on ${formatContractDate(acceptanceEvidence.acceptedAt.slice(0, 10))}`);
    doc.moveDown(0.2);
    doc.fontSize(10).fillColor("#64748b").text(`Evidence hash: ${acceptanceEvidence.contractHash}`);
    doc.moveDown(0.2);
    doc.text(`Signer email: ${acceptanceEvidence.signerEmail}`);
    doc.fontSize(11).fillColor("#334155");
  } else {
    doc.text("Signature: _________________________   Date: __________________");
  }

  await new Promise<void>((resolve, reject) => {
    doc.on("end", () => resolve());
    doc.on("error", (err: unknown) => reject(err));
    doc.end();
  });

  return Buffer.concat(buffers);
}

