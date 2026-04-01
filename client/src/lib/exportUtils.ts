import { type BusinessIdea } from "./api";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

/**
 * Export ideas to CSV format
 * Includes all key metrics and gap analysis
 */
export function exportToCSV(ideas: BusinessIdea[], filename = "business-ideas.csv") {
  const headers = [
    "Rank",
    "Title",
    "Category",
    "Description",
    "Gap Analysis",
    "Earning Potential",
    "Rollout Speed",
    "Profit Margin %",
    "Startup Cost",
    "Market Size ($B)",
    "Growth Trend",
    "Markets",
    "Tags",
  ];

  const rows = ideas.map(idea => [
    idea.rank,
    idea.title,
    idea.category,
    idea.description,
    idea.gap,
    idea.earning_label,
    idea.rollout_label,
    idea.profit_margin,
    idea.startup_cost,
    idea.market_size_bn,
    idea.trend,
    idea.markets.join("; "),
    idea.tags.join("; "),
  ]);

  const csvContent = [
    headers.map(h => `"${h}"`).join(","),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export ideas to PDF with formatted tables and charts
 */
export function exportToPDF(ideas: BusinessIdea[], filename = "business-ideas.pdf") {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  let yPosition = margin;

  // Title
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(15, 23, 42); // Dark background
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 15, "F");
  doc.text("Top 100 High-Earning Business Ideas 2025", pageWidth / 2, yPosition + 10, { align: "center" });
  yPosition += 20;

  // Summary stats
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
  doc.text(`Total Ideas: ${ideas.length}`, margin + 80, yPosition);
  yPosition += 8;

  // Table data
  const tableData = ideas.map(idea => [
    `#${idea.rank}`,
    idea.title.substring(0, 30),
    idea.category,
    idea.earning_label,
    idea.rollout_label,
    `${idea.profit_margin}%`,
    idea.trend,
  ]);

  // Add table
  (doc as any).autoTable({
    head: [["Rank", "Title", "Category", "Earning Potential", "Rollout Speed", "Margin", "Trend"]],
    body: tableData,
    startY: yPosition,
    margin: margin,
    headStyles: {
      fillColor: [59, 130, 246], // Blue
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      textColor: 50,
      fontSize: 8,
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 50 },
      2: { cellWidth: 30 },
      3: { cellWidth: 35 },
      4: { cellWidth: 25 },
      5: { cellWidth: 15 },
      6: { cellWidth: 20 },
    },
  });

  // Add page numbers
  const pageCount = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, pageHeight - margin);
  }

  doc.save(filename);
}

/**
 * Export shortlist to PDF with detailed analysis
 */
export function exportShortlistToPDF(ideas: BusinessIdea[], filename = "shortlist-analysis.pdf") {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Title
  doc.setFontSize(18);
  doc.setTextColor(59, 130, 246);
  doc.text("My Shortlisted Business Ideas", margin, yPosition);
  yPosition += 12;

  // Summary
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Total Ideas: ${ideas.length}`, margin, yPosition);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition + 6);
  yPosition += 15;

  // Detailed breakdown for each idea
  ideas.forEach((idea, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }

    // Idea header
    doc.setFontSize(12);
    doc.setTextColor(59, 130, 246);
    doc.text(`${index + 1}. ${idea.title}`, margin, yPosition);
    yPosition += 8;

    // Category and rank
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Rank #${idea.rank} | ${idea.category}`, margin, yPosition);
    yPosition += 6;

    // Description
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    const descLines = doc.splitTextToSize(idea.description, pageWidth - 2 * margin);
    doc.text(descLines, margin, yPosition);
    yPosition += descLines.length * 4 + 4;

    // Gap Analysis
    doc.setFontSize(9);
    doc.setTextColor(200, 50, 50);
    doc.text("Gap Analysis:", margin, yPosition);
    yPosition += 4;
    doc.setTextColor(100, 100, 100);
    const gapLines = doc.splitTextToSize(idea.gap, pageWidth - 2 * margin - 5);
    doc.text(gapLines, margin + 5, yPosition);
    yPosition += gapLines.length * 3 + 4;

    // Key metrics
    doc.setFontSize(8);
    doc.setTextColor(50, 50, 50);
    const metrics = [
      `Earning Potential: ${idea.earning_label}`,
      `Rollout Speed: ${idea.rollout_label}`,
      `Profit Margin: ${idea.profit_margin}%`,
      `Market Size: $${idea.market_size_bn}B`,
      `Startup Cost: ${idea.startup_cost}`,
      `Growth Trend: ${idea.trend}`,
      `Markets: ${idea.markets.join(", ")}`,
    ];
    metrics.forEach(metric => {
      doc.text(metric, margin, yPosition);
      yPosition += 4;
    });

    yPosition += 6;
  });

  doc.save(filename);
}
