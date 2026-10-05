import { jsPDF } from "jspdf";
import { money, formatDate } from "./utils.js";

export function generatePdf({ vehicle, events, title, periodLabel, summary }) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  const green = [31, 104, 77];
  let y = 17;
  pdf.setFillColor(...green);
  pdf.rect(0, 0, pageWidth, 44, "F");
  pdf.setTextColor(225, 242, 223);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("ROTA · GESTÃO VEICULAR", margin, y);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.text(title || "Relatório do veículo", margin, y + 13);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`${vehicle.name || "Veículo"}  ·  ${periodLabel || "Todo o período"}`, margin, y + 22);
  y = 56;
  pdf.setTextColor(38, 55, 46);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("Resumo", margin, y);
  y += 7;
  const summaryItems = [["Gasto no relatório", money(events.reduce((total, event) => total + Number(event.amount || 0), 0))], ["Registros", String(events.length)], ["Consumo médio", summary?.fuelData?.averageKmPerLiter ? `${summary.fuelData.averageKmPerLiter.toFixed(1).replace(".", ",")} km/L` : "Dados insuficientes"]];
  const cellW = (pageWidth - margin * 2 - 8) / 3;
  summaryItems.forEach(([label, value], index) => {
    const x = margin + index * (cellW + 4);
    pdf.setFillColor(243, 247, 243);
    pdf.roundedRect(x, y, cellW, 20, 2, 2, "F");
    pdf.setTextColor(119, 132, 123);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(label, x + 4, y + 7);
    pdf.setTextColor(35, 55, 43);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text(value, x + 4, y + 15);
  });
  y += 31;
  const columns = [{ label: "DATA", x: margin, w: 23 }, { label: "CATEGORIA", x: 41, w: 32 }, { label: "DESCRIÇÃO", x: 75, w: 77 }, { label: "KM", x: 154, w: 18 }, { label: "VALOR", x: 174, w: 21 }];
  const drawHeader = () => {
    pdf.setFillColor(239, 244, 239);
    pdf.rect(margin, y - 5, pageWidth - margin * 2, 9, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(105, 122, 110);
    columns.forEach((col) => pdf.text(col.label, col.x, y));
    y += 7;
  };
  pdf.setTextColor(38, 55, 46);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("Lançamentos", margin, y);
  y += 8;
  drawHeader();
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  for (const event of events) {
    if (y > 276) { pdf.addPage(); y = 17; drawHeader(); }
    const description = pdf.splitTextToSize(String(event.detail || "—"), columns[2].w - 2)[0] || "—";
    const values = [formatDate(event.date), String(event.category || "—").slice(0, 17), description.slice(0, 42), event.odometer ? Number(event.odometer).toLocaleString("pt-BR") : "—", money(event.amount)];
    pdf.setTextColor(64, 79, 68);
    values.forEach((value, index) => pdf.text(value, columns[index].x, y));
    pdf.setDrawColor(235, 239, 235);
    pdf.line(margin, y + 3, pageWidth - margin, y + 3);
    y += 9;
  }
  if (!events.length) {
    pdf.setTextColor(125, 137, 128);
    pdf.text("Nenhum lançamento para este período.", margin, y + 2);
    y += 10;
  }
  const pages = pdf.getNumberOfPages();
  for (let index = 1; index <= pages; index++) {
    pdf.setPage(index);
    const height = pdf.internal.pageSize.getHeight();
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(140, 151, 143);
    pdf.text(`Gerado no navegador em ${new Intl.DateTimeFormat("pt-BR").format(new Date())}`, margin, height - 8);
    pdf.text(`${index} / ${pages}`, pageWidth - margin, height - 8, { align: "right" });
  }
  pdf.save(`rota-relatorio-${(vehicle.name || "veiculo").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`);
}
