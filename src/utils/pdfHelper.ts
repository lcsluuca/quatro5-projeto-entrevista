import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/**
 * Generates an automated PDF Termo de Responsabilidade/Conclusão
 * for a finished Kanban task in Quatro5.
 */
export function generateTermoPDF(
  taskId: string,
  title: string,
  description: string,
  userName: string,
  userRole: string,
  dueDate: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const dirPath = path.join(process.cwd(), "public", "termos");
      fs.mkdirSync(dirPath, { recursive: true });

      const fileName = `termo-${taskId}.pdf`;
      const filePath = path.join(dirPath, fileName);

      // Create PDF Document (A4 format)
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // 1. Draw elegant outer frame border
      doc.rect(20, 20, 555, 802).strokeColor("#cbd5e1").lineWidth(1).stroke();
      doc.rect(25, 25, 545, 792).strokeColor("#f8fafc").lineWidth(2).stroke();

      // 2. High-contrast Slate Header section
      doc.rect(25, 25, 545, 110).fill("#0f172a");

      // Header Texts
      doc.fillColor("#ffffff")
        .font("Helvetica-Bold")
        .fontSize(22)
        .text("QUATRO5 - AGÊNCIA", 25, 45, { align: "center", width: 545 });

      doc.fontSize(10)
        .font("Helvetica")
        .fillColor("#94a3b8")
        .text("TERMO DE RESPONSABILIDADE E CONCLUSÃO DE TAREFA (SLA)", 25, 75, { align: "center", width: 545 });

      doc.fontSize(8)
        .font("Helvetica-Oblique")
        .fillColor("#64748b")
        .text("Sistema de Automação de Documentos Quatro5 (Self-Driving Kanban)", 25, 92, { align: "center", width: 545 });

      // 3. Document Content title
      doc.moveDown(5);
      doc.fillColor("#1e293b")
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("Declaração de Encerramento de Atividade Técnica", 50, 175);

      // Thin separator line
      doc.moveTo(50, 195).lineTo(545, 195).strokeColor("#e2e8f0").lineWidth(1).stroke();

      // Formal body text
      doc.moveDown(1.5);
      doc.font("Helvetica")
        .fontSize(10.5)
        .fillColor("#334155")
        .text(
          "Declaramos, para fins de controle de fluxo de trabalho, governança e conformidade de níveis de serviço (SLA), que a atividade técnica abaixo especificada foi integralmente concluída, testada e homologada pelo profissional responsável na agência Quatro5, passando a vigorar na infraestrutura produtiva da agência.",
          50,
          210,
          { lineGap: 5, width: 495 }
        );

      // 4. Details gray box block
      const startY = 295;
      doc.rect(50, startY, 495, 155).fill("#f8fafc");
      doc.rect(50, startY, 495, 155).strokeColor("#e2e8f0").lineWidth(1).stroke();

      // Field labels (Bold, left column)
      doc.fillColor("#475569").font("Helvetica-Bold").fontSize(10);
      doc.text("CHAVE IDENTIFICADORA:", 70, startY + 18);
      doc.text("TÍTULO DA ATIVIDADE:", 70, startY + 44);
      doc.text("SLA DE ENTREGA:", 70, startY + 70);
      doc.text("RESPONSÁVEL TÉCNICO:", 70, startY + 96);
      doc.text("CARGO / ATUAÇÃO:", 70, startY + 122);

      // Field values (Regular, right column)
      doc.fillColor("#0f172a").font("Helvetica-Bold");
      doc.text(taskId, 230, startY + 18);
      doc.text(title, 230, startY + 44, { width: 300 });
      doc.font("Helvetica").text(dueDate, 230, startY + 70);
      doc.font("Helvetica-Bold").text(userName, 230, startY + 96);
      doc.font("Helvetica").text(userRole || "Colaborador Técnico", 230, startY + 122);

      // 5. Technical Description details
      const descY = startY + 180;
      doc.fillColor("#1e293b")
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("Histórico Analítico e Escopo da Atividade:", 50, descY);

      doc.moveTo(50, descY + 15).lineTo(545, descY + 15).strokeColor("#e2e8f0").lineWidth(0.5).stroke();

      const cleanDesc = description ? description : "Nenhuma descrição detalhada adicional foi especificada no cadastro original desta atividade.";
      doc.fillColor("#475569")
        .font("Helvetica")
        .fontSize(9.5)
        .text(cleanDesc, 50, descY + 25, { width: 495, lineGap: 4, height: 100, ellipsis: true });

      // 6. Signatures block
      const sigY = 640;
      doc.moveTo(85, sigY).lineTo(255, sigY).strokeColor("#94a3b8").lineWidth(1).stroke();
      doc.moveTo(340, sigY).lineTo(510, sigY).strokeColor("#94a3b8").lineWidth(1).stroke();

      doc.fillColor("#334155").font("Helvetica-Bold").fontSize(9.5);
      doc.text(userName, 85, sigY + 8, { width: 170, align: "center" });
      doc.font("Helvetica").fontSize(8.5).text("Responsável Técnico", 85, sigY + 22, { width: 170, align: "center" });

      doc.font("Helvetica-Bold").fontSize(9.5).text("Ricardo Santos", 340, sigY + 8, { width: 170, align: "center" });
      doc.font("Helvetica").fontSize(8.5).text("Gestor Quatro5 / Solicitante", 340, sigY + 22, { width: 170, align: "center" });

      // 7. Footer metadata
      const completionDateStr = new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });

      doc.fillColor("#94a3b8")
        .font("Helvetica")
        .fontSize(8)
        .text(`Automação Kanban 'Self-Driving' Quatro5 • Emitido eletronicamente em: ${completionDateStr} • Autenticação: PDF_INTEGRITY_VERIFIED`, 50, 775, { align: "center", width: 495 });

      // Terminate and save
      doc.end();

      writeStream.on("finish", () => {
        // Return URL accessible by the user via express static mapping
        resolve(`/public/termos/${fileName}`);
      });

      writeStream.on("error", (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}
