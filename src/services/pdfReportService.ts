import { jsPDF } from 'jspdf';
import { FoodAnalysisResponse } from '../types/food';
import { FoodLabExperimentResult } from '../types/foodlab';
import {
  resolveIngredientImage,
  resolveRelatedDishImage,
} from '../data/categoryMedia';
import fallbackMealImg from '../assets/images/cat_rice_biryanis_1794835955488.jpg';
import {
  buildFoodLabReferencePapers,
  buildScientificPapersForFood,
  normalizeEvidenceReferenceUrl,
} from './evidenceLinks';

const PAGE_MARGIN = 14;
const BRAND_FOOTER = 'NutriScientia · Food Insight AI Virtual Lab · Powered by 6 Monkeys Inc.';
const PAGE_CONTENT_BOTTOM_Y = 276;

function sanitizeFilenamePart(value: string): string {
  return (
    value
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 48) || 'Report'
  );
}

function truncateText(value: string, maxChars: number): string {
  const clean = (value || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxChars) return clean;
  return `${clean.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

function drawCroppedCoverImage(
  img: HTMLImageElement,
  targetAspectW: number,
  targetAspectH: number,
  targetPixelWidth: number
): { dataUrl: string; width: number; height: number } | null {
  try {
    const srcW = img.naturalWidth || 800;
    const srcH = img.naturalHeight || 600;
    const outW = Math.max(240, Math.round(targetPixelWidth));
    const outH = Math.max(160, Math.round(outW * (targetAspectH / targetAspectW)));

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outW, outH);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const srcRatio = srcW / srcH;
    const dstRatio = outW / outH;
    let sx = 0;
    let sy = 0;
    let sWidth = srcW;
    let sHeight = srcH;

    // Centered object-cover crop so report images look as crisp as app UI cards
    if (srcRatio > dstRatio) {
      sWidth = srcH * dstRatio;
      sx = (srcW - sWidth) / 2;
    } else if (srcRatio < dstRatio) {
      sHeight = srcW / dstRatio;
      sy = (srcH - sHeight) / 2;
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, outW, outH);

    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.94),
      width: outW,
      height: outH,
    };
  } catch {
    return null;
  }
}

function loadSingleCoverImage(
  imageUrl: string,
  targetAspectW: number,
  targetAspectH: number,
  targetPixelWidth: number
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  if (!imageUrl || typeof window === 'undefined') return Promise.resolve(null);

  return new Promise((resolve) => {
    const img = new Image();
    if (!imageUrl.startsWith('data:') && !imageUrl.startsWith('/')) {
      img.crossOrigin = 'anonymous';
    }
    const timer = window.setTimeout(() => resolve(null), 4500);

    img.onload = () => {
      window.clearTimeout(timer);
      resolve(drawCroppedCoverImage(img, targetAspectW, targetAspectH, targetPixelWidth));
    };

    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };

    img.src = imageUrl;
  });
}

/**
 * Loads a high-resolution, aspect-matched (object-cover cropped) JPEG suitable for crisp
 * PDF rendering matching the app UI, with automatic bundled fallback if remote image fails.
 */
export async function loadCrispCoverJpeg(
  imageUrl: string | undefined,
  targetWidthMm: number,
  targetHeightMm: number,
  fallbackUrl?: string,
  targetPixelWidth = 1120
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  if (imageUrl) {
    const primary = await loadSingleCoverImage(
      imageUrl,
      targetWidthMm,
      targetHeightMm,
      targetPixelWidth
    );
    if (primary) return primary;
  }

  if (fallbackUrl && fallbackUrl !== imageUrl) {
    const fallback = await loadSingleCoverImage(
      fallbackUrl,
      targetWidthMm,
      targetHeightMm,
      targetPixelWidth
    );
    if (fallback) return fallback;
  }

  return null;
}

export async function loadImageAsJpegDataUrl(
  imageUrl?: string
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  return loadCrispCoverJpeg(imageUrl, 16, 10, fallbackMealImg, 1120);
}

export function deriveHealthBenefits(analysis: FoodAnalysisResponse): string[] {
  if (Array.isArray(analysis.healthBenefits) && analysis.healthBenefits.length > 0) {
    return analysis.healthBenefits;
  }

  const benefits: string[] = [];
  const { calories, macronutrients, micronutrients } = analysis.nutrition;

  if (macronutrients.proteinGrams >= 12) {
    benefits.push(
      `Supports muscle maintenance and satiety with ${macronutrients.proteinGrams}g of ${macronutrients.proteinTag.toLowerCase()} dietary protein per serving.`
    );
  } else {
    benefits.push(
      `Delivers ${calories} kcal of accessible dietary energy balanced with ${macronutrients.carbsGrams}g carbohydrates.`
    );
  }

  if ((macronutrients.fiberGrams ?? 0) >= 3) {
    benefits.push(
      `Provides ${macronutrients.fiberGrams}g dietary fiber that promotes digestive regularity and steady glycemic response.`
    );
  }

  if (micronutrients.length > 0) {
    const topMicros = micronutrients
      .slice(0, 2)
      .map((m) => `${m.name} (${m.dailyValuePercentage}% DV)`)
      .join(' and ');
    benefits.push(`Supplies essential micronutrients including ${topMicros} for metabolic support.`);
  }

  if (analysis.safety.overallRisk === 'Low Risk') {
    benefits.push(
      `Low overall food-safety risk profile tailored for ${analysis.profileMatch.dietaryFit.toLowerCase()}.`
    );
  }

  return benefits.slice(0, 4);
}

function addFootersToAllPages(doc: jsPDF): void {
  const totalPages = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(PAGE_MARGIN, pageHeight - 13, pageWidth - PAGE_MARGIN, pageHeight - 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(BRAND_FOOTER, PAGE_MARGIN, pageHeight - 8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 95, 70);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - PAGE_MARGIN, pageHeight - 8, {
      align: 'right',
    });
  }
}

function drawPage2Header(doc: jsPDF, pageWidth: number, subtitle: string, rightLabel: string): number {
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 16, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text('NutriScientia · Food Insight AI Virtual Lab', PAGE_MARGIN, 7.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(167, 243, 208);
  doc.text(subtitle, PAGE_MARGIN, 12.6);
  doc.setTextColor(226, 232, 240);
  doc.text(rightLabel, pageWidth - PAGE_MARGIN, 10, { align: 'right' });
  return 22;
}

function drawSectionHeading(
  doc: jsPDF,
  y: number,
  contentWidth: number,
  title: string,
  accent: 'emerald' | 'teal' = 'emerald'
): number {
  if (accent === 'emerald') {
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(167, 243, 208);
    doc.setTextColor(6, 95, 70);
  } else {
    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(153, 246, 228);
    doc.setTextColor(15, 118, 110);
  }
  doc.roundedRect(PAGE_MARGIN, y, contentWidth, 7.2, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.2);
  doc.text(title.toUpperCase(), PAGE_MARGIN + 3, y + 4.9);
  return y + 10;
}

function drawBoundedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxY: number,
  opts?: {
    fontSize?: number;
    color?: [number, number, number];
    bold?: boolean;
    maxLines?: number;
    lineHeightMultiplier?: number;
  }
): number {
  const fontSize = opts?.fontSize ?? 8.8;
  const color = opts?.color ?? [51, 65, 85];
  const bold = opts?.bold ?? false;
  const lineHeight = fontSize * (opts?.lineHeightMultiplier ?? 0.43);

  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.setFontSize(fontSize);
  doc.setTextColor(color[0], color[1], color[2]);

  const rawLines = doc.splitTextToSize(text, maxWidth) as string[];
  const lines = opts?.maxLines ? rawLines.slice(0, opts.maxLines) : rawLines;

  let curY = y;
  for (const line of lines) {
    if (curY + lineHeight > maxY) break;
    doc.text(line, x, curY);
    curY += lineHeight;
  }
  return curY;
}

function drawClickableUrlLine(
  doc: jsPDF,
  url: string,
  x: number,
  y: number,
  maxWidth: number,
  maxY: number
): number {
  const cleanUrl = (url || '').trim();
  if (!cleanUrl || y + 3.8 > maxY) return y;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(3, 105, 161);

  const label = `Source URL: ${cleanUrl}`;
  const fitted = doc.splitTextToSize(label, maxWidth) as string[];
  const displayLine = fitted[0] || label;
  doc.textWithLink(displayLine, x, y, { url: cleanUrl });

  // Subtle link underline for clear visual cue
  const widthMm = Math.min(maxWidth, doc.getTextWidth(displayLine));
  doc.setDrawColor(125, 211, 252);
  doc.line(x, y + 0.6, x + widthMm, y + 0.6);

  return y + 4.1;
}

/**
 * Generates an exact 2-page, print-ready A4 Meal Analysis PDF report with crisp
 * app-matched dish & ingredient photos and clickable public scientific paper URLs.
 */
export async function generateMealAnalysisPdf(
  analysis: FoodAnalysisResponse,
  options?: { download?: boolean }
): Promise<{ filename: string; doc: jsPDF }> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;

  // ==================== PAGE 1: BRANDING, HERO DISH PHOTO, NUTRITION & INGREDIENTS ====================
  doc.setFillColor(6, 78, 59);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('NutriScientia', PAGE_MARGIN, 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(209, 250, 229);
  doc.text('Food Insight AI Virtual Lab · Meal Intelligence Report', PAGE_MARGIN, 16.5);
  doc.setFontSize(7.8);
  doc.text('Powered by 6 Monkeys Inc.', PAGE_MARGIN, 21.5);

  doc.setFontSize(8.2);
  doc.setTextColor(236, 253, 245);
  doc.text(`Report ID: ${analysis.analysisId || 'NS-REPORT'}`, pageWidth - PAGE_MARGIN, 10.5, {
    align: 'right',
  });
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - PAGE_MARGIN, 16.5, {
    align: 'right',
  });

  let y = 30;

  // Hero Meal Summary + Large Crisp Dish Image matching OverviewScreen
  const imgBoxW = 74;
  const imgBoxH = 44;
  const loadedHero = await loadCrispCoverJpeg(
    analysis.imageUrl,
    imgBoxW,
    imgBoxH,
    fallbackMealImg,
    1200
  );
  const summaryWidth = loadedHero ? contentWidth - imgBoxW - 6 : contentWidth;
  const heroStartY = y;

  if (loadedHero) {
    const imgX = pageWidth - PAGE_MARGIN - imgBoxW;
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(imgX - 0.5, heroStartY - 0.5, imgBoxW + 1, imgBoxH + 1, 2.5, 2.5, 'FD');
    doc.addImage(loadedHero.dataUrl, 'JPEG', imgX, heroStartY, imgBoxW, imgBoxH);

    // Subtle match badge overlay mirroring OverviewScreen hero badge
    doc.setFillColor(5, 150, 105);
    doc.roundedRect(imgX + imgBoxW - 24, heroStartY + 2.2, 21.8, 5.2, 2.5, 2.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(`${analysis.confidence}% Match`, imgX + imgBoxW - 13.1, heroStartY + 5.7, {
      align: 'center',
    });
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  const titleLines = (doc.splitTextToSize(analysis.foodName, summaryWidth) as string[]).slice(0, 2);
  doc.text(titleLines, PAGE_MARGIN, y + 4.5);
  y += 4.5 + titleLines.length * 5.6;

  y = drawBoundedText(
    doc,
    `${analysis.cuisine} · ${analysis.category} · ${analysis.servingSize}`,
    PAGE_MARGIN,
    y,
    summaryWidth,
    heroStartY + imgBoxH,
    { fontSize: 8.5, color: [5, 150, 105], bold: true, maxLines: 2 }
  );
  y += 1.2;

  y = drawBoundedText(
    doc,
    `Overall Assessment: ${analysis.overallAssessment.scorePercentage}% (${analysis.overallAssessment.matchStatus})`,
    PAGE_MARGIN,
    y,
    summaryWidth,
    heroStartY + imgBoxH,
    { fontSize: 8.8, color: [15, 23, 42], bold: true, maxLines: 1 }
  );
  y += 0.8;

  y = drawBoundedText(
    doc,
    truncateText(analysis.overallAssessment.summary, 210),
    PAGE_MARGIN,
    y,
    summaryWidth,
    heroStartY + imgBoxH + 2,
    { fontSize: 8.4, color: [71, 85, 105], maxLines: 4 }
  );

  y = Math.max(y + 3, heroStartY + imgBoxH + 5);

  // Section 1: Nutritional Information (Per Serving)
  y = drawSectionHeading(doc, y, contentWidth, '1. Nutritional Information (Per Serving)', 'emerald');

  const macroItems = [
    { label: 'Calories', value: `${analysis.nutrition.calories} kcal`, sub: truncateText(analysis.servingSize, 16) },
    {
      label: 'Protein',
      value: `${analysis.nutrition.macronutrients.proteinGrams}g`,
      sub: analysis.nutrition.macronutrients.proteinTag,
    },
    {
      label: 'Carbs',
      value: `${analysis.nutrition.macronutrients.carbsGrams}g`,
      sub: analysis.nutrition.macronutrients.carbsTag,
    },
    {
      label: 'Total Fat',
      value: `${analysis.nutrition.macronutrients.fatGrams}g`,
      sub: analysis.nutrition.macronutrients.fatTag,
    },
    {
      label: 'Fiber',
      value: `${analysis.nutrition.macronutrients.fiberGrams ?? 3}g`,
      sub: 'Dietary Fiber',
    },
  ];

  const cardW = (contentWidth - 8) / 5;
  macroItems.forEach((m, idx) => {
    const cx = PAGE_MARGIN + idx * (cardW + 2);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cx, y, cardW, 15.5, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.setTextColor(15, 23, 42);
    doc.text(m.value, cx + cardW / 2, y + 5.8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.3);
    doc.setTextColor(71, 85, 105);
    doc.text(m.label, cx + cardW / 2, y + 10.1, { align: 'center' });
    doc.setTextColor(5, 150, 105);
    doc.text(m.sub, cx + cardW / 2, y + 13.7, { align: 'center' });
  });
  y += 19;

  if (analysis.nutrition.micronutrients.length > 0) {
    y = drawBoundedText(
      doc,
      `Key Micronutrients: ${analysis.nutrition.micronutrients
        .slice(0, 5)
        .map((m) => `${m.name} (${m.amount}, ${m.dailyValuePercentage}% DV)`)
        .join('  ·  ')}`,
      PAGE_MARGIN,
      y,
      contentWidth,
      142,
      { fontSize: 8.3, color: [51, 65, 85], maxLines: 2 }
    );
    y += 2;
  }

  // Section 2: Key Ingredients & App-Matched Component Imagery
  y = drawSectionHeading(doc, y, contentWidth, '2. Key Ingredients & Composition (App Visuals)', 'emerald');

  const ingredientsToShow = analysis.ingredients.slice(0, 6);
  const ingThumbImages = await Promise.all(
    ingredientsToShow.map((ing) => {
      const resolvedUrl = resolveIngredientImage(
        ing.name,
        ing.imageUrl || analysis.imageUrl || fallbackMealImg
      );
      return loadCrispCoverJpeg(resolvedUrl, 12, 12, fallbackMealImg, 360);
    })
  );

  for (let idx = 0; idx < ingredientsToShow.length; idx++) {
    if (y + 15 > PAGE_CONTENT_BOTTOM_Y) break;
    const ing = ingredientsToShow[idx];
    const thumb = ingThumbImages[idx];

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(PAGE_MARGIN, y, contentWidth, 13.5, 1.8, 1.8, 'FD');

    const textStartX = thumb ? PAGE_MARGIN + 15.5 : PAGE_MARGIN + 3.5;
    if (thumb) {
      doc.addImage(thumb.dataUrl, 'JPEG', PAGE_MARGIN + 2, y + 1.5, 10.5, 10.5);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(15, 23, 42);
    const ingHeader = `${ing.name}${ing.subname ? ` (${ing.subname})` : ''}`;
    doc.text(truncateText(ingHeader, 62), textStartX, y + 5.2);

    doc.setTextColor(5, 150, 105);
    doc.text(`${ing.percentage}%`, pageWidth - PAGE_MARGIN - 3.5, y + 5.2, { align: 'right' });

    const descText =
      ing.description ||
      `${ing.name} contributes primary nutrition and culinary balance in ${analysis.foodName}.`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.9);
    doc.setTextColor(71, 85, 105);
    doc.text(truncateText(descText, 105), textStartX, y + 10.2);

    y += 15.2;
  }

  // ==================== PAGE 2: HEALTH BENEFITS, SAFETY, COMBINATIONS & PUBLIC EVIDENCE URLS ====================
  doc.addPage();
  y = drawPage2Header(
    doc,
    pageWidth,
    `Clinical Audit & Public Paper References · ${truncateText(analysis.foodName, 44)}`,
    `ID: ${analysis.analysisId || 'NS-REPORT'}`
  );

  // Section 3: Health Benefits & Profile Match
  y = drawSectionHeading(doc, y, contentWidth, '3. Health Benefits & Profile Match', 'emerald');
  const benefits = deriveHealthBenefits(analysis).slice(0, 3);
  for (const benefit of benefits) {
    y = drawBoundedText(
      doc,
      `• ${truncateText(benefit, 150)}`,
      PAGE_MARGIN,
      y,
      contentWidth,
      92,
      { fontSize: 8.5, color: [6, 95, 70], maxLines: 2 }
    );
    y += 0.6;
  }
  y = drawBoundedText(
    doc,
    `Profile Match: ${analysis.profileMatch.dietaryFit} | ${analysis.profileMatch.calorieFit}`,
    PAGE_MARGIN,
    y,
    contentWidth,
    98,
    { fontSize: 8.4, color: [15, 23, 42], bold: true, maxLines: 1 }
  );
  y += 2.5;

  // Section 4: Food Safety & Risk Assessment
  y = drawSectionHeading(doc, y, contentWidth, '4. Food Safety, Allergens & Risk Audit', 'emerald');
  y = drawBoundedText(
    doc,
    `Overall Safety Risk: ${analysis.safety.overallRisk} — ${truncateText(analysis.safety.riskSummary, 175)}`,
    PAGE_MARGIN,
    y,
    contentWidth,
    138,
    {
      fontSize: 8.6,
      color: analysis.safety.overallRisk === 'High Risk' ? [185, 28, 28] : [15, 23, 42],
      bold: true,
      maxLines: 2,
    }
  );
  y += 0.8;

  if (analysis.safety.allergens.length > 0) {
    y = drawBoundedText(
      doc,
      `Allergens: ${analysis.safety.allergens
        .slice(0, 4)
        .map((a) => `${a.allergenName} (${a.warningLevel})`)
        .join('  |  ')}`,
      PAGE_MARGIN,
      y,
      contentWidth,
      146,
      { fontSize: 8.3, color: [51, 65, 85], maxLines: 1 }
    );
    y += 0.6;
  }

  for (const rf of analysis.safety.riskFactors.slice(0, 2)) {
    y = drawBoundedText(
      doc,
      `! Risk Factor [${rf.severity}]: ${truncateText(rf.factor, 115)}`,
      PAGE_MARGIN,
      y,
      contentWidth,
      154,
      { fontSize: 8.2, color: [180, 83, 9], maxLines: 1 }
    );
  }
  for (const qc of analysis.safety.qualityChecks.slice(0, 2)) {
    y = drawBoundedText(
      doc,
      `${qc.isSafe ? '✓ Verified:' : '✕ Warning:'} ${truncateText(qc.title, 115)}`,
      PAGE_MARGIN,
      y,
      contentWidth,
      160,
      { fontSize: 8.2, color: qc.isSafe ? [21, 128, 61] : [185, 28, 28], maxLines: 1 }
    );
  }
  y += 2.5;

  // Section 5: Safe & Unsafe Food Combinations
  const safePairs = (analysis.combinations?.safeCombinations || []).slice(0, 2);
  const unsafePairs = (analysis.combinations?.unsafeCombinations || []).slice(0, 2);
  if (safePairs.length > 0 || unsafePairs.length > 0) {
    y = drawSectionHeading(doc, y, contentWidth, '5. Safe & Unsafe Food Combinations', 'emerald');
    for (const pair of safePairs) {
      y = drawBoundedText(
        doc,
        `✓ SAFE WITH ${pair.foodName}: ${truncateText(pair.scientificReason, 130)}`,
        PAGE_MARGIN,
        y,
        contentWidth,
        192,
        { fontSize: 8.2, color: [6, 95, 70], maxLines: 2 }
      );
      y += 0.5;
    }
    for (const pair of unsafePairs) {
      y = drawBoundedText(
        doc,
        `✕ AVOID WITH ${pair.foodName} [${pair.status}]: ${truncateText(pair.scientificReason, 130)}`,
        PAGE_MARGIN,
        y,
        contentWidth,
        204,
        { fontSize: 8.2, color: [185, 28, 28], maxLines: 2 }
      );
      y += 0.5;
    }
    y += 2;
  }

  // Section 6: Scientific Evidence & Public Research Paper URLs (Clickable Links)
  y = drawSectionHeading(
    doc,
    y,
    contentWidth,
    '6. Scientific Evidence & Public Research Paper URLs',
    'teal'
  );

  for (const ev of analysis.evidence.slice(0, 3)) {
    if (y + 11 > PAGE_CONTENT_BOTTOM_Y) break;
    const publicUrl = normalizeEvidenceReferenceUrl(ev.sourceName, ev.category, ev.referenceUrl);
    y = drawBoundedText(
      doc,
      `• [${ev.category}] ${ev.sourceName}: ${truncateText(ev.snippet, 120)}`,
      PAGE_MARGIN,
      y,
      contentWidth,
      PAGE_CONTENT_BOTTOM_Y - 5,
      { fontSize: 8.1, color: [51, 65, 85], maxLines: 2 }
    );
    y = drawClickableUrlLine(doc, publicUrl, PAGE_MARGIN + 3, y, contentWidth - 3, PAGE_CONTENT_BOTTOM_Y);
    y += 0.8;
  }

  const papers = buildScientificPapersForFood(analysis).slice(0, 2);
  for (const paper of papers) {
    if (y + 10 > PAGE_CONTENT_BOTTOM_Y) break;
    y = drawBoundedText(
      doc,
      `• Paper: "${truncateText(paper.title, 82)}" (${paper.journal}, ${paper.year})`,
      PAGE_MARGIN,
      y,
      contentWidth,
      PAGE_CONTENT_BOTTOM_Y - 4.5,
      { fontSize: 8, color: [15, 23, 42], bold: true, maxLines: 2 }
    );
    y = drawClickableUrlLine(
      doc,
      paper.publicUrl,
      PAGE_MARGIN + 3,
      y,
      contentWidth - 3,
      PAGE_CONTENT_BOTTOM_Y
    );
    y += 0.6;
  }

  addFootersToAllPages(doc);

  const filename = `NutriScientia_Report_${sanitizeFilenamePart(analysis.foodName)}.pdf`;
  if (options?.download !== false) {
    doc.save(filename);
  }
  return { filename, doc };
}

/**
 * Generates an exact 2-page FoodLab™ Scientific Formulation PDF report featuring
 * crisp selected food images matching the app catalogue and clickable public paper URLs.
 */
export async function generateFoodLabPdf(
  result: FoodLabExperimentResult,
  options?: { download?: boolean }
): Promise<{ filename: string; doc: jsPDF }> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;

  // ==================== PAGE 1: BRANDING, EXPERIMENT VERDICT, SELECTED FOOD IMAGERY & NUTRITION ====================
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('NutriScientia · FoodLab™', PAGE_MARGIN, 10.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(167, 243, 208);
  doc.text('Food Insight AI Virtual Lab · Scientific Formulation Report', PAGE_MARGIN, 16.5);
  doc.setFontSize(7.8);
  doc.text('Powered by 6 Monkeys Inc.', PAGE_MARGIN, 21.5);

  doc.setFontSize(8.2);
  doc.setTextColor(226, 232, 240);
  doc.text(`Experiment ID: ${result.experimentId}`, pageWidth - PAGE_MARGIN, 10.5, { align: 'right' });
  doc.text(`Date: ${result.createdAt}`, pageWidth - PAGE_MARGIN, 16.5, { align: 'right' });

  let y = 31;

  y = drawBoundedText(doc, result.experimentName, PAGE_MARGIN, y, contentWidth, 55, {
    fontSize: 13.5,
    color: [15, 23, 42],
    bold: true,
    maxLines: 2,
  });
  y += 1;
  y = drawBoundedText(
    doc,
    `Objective: ${result.researchObjective} · Total Weight: ${result.totalWeightGrams}g · Type: ${result.combinationType}`,
    PAGE_MARGIN,
    y,
    contentWidth,
    66,
    { fontSize: 8.6, color: [71, 85, 105], maxLines: 2 }
  );
  y += 3;

  // Verdict Summary Box
  const isHazard = result.verdict === 'UNEATABLE';
  doc.setFillColor(isHazard ? 254 : 236, isHazard ? 242 : 253, isHazard ? 242 : 245);
  doc.setDrawColor(isHazard ? 252 : 167, isHazard ? 165 : 243, isHazard ? 165 : 208);
  doc.roundedRect(PAGE_MARGIN, y, contentWidth, 21, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(isHazard ? 185 : 6, isHazard ? 28 : 95, isHazard ? 28 : 70);
  doc.text(`VERDICT: ${result.verdictTitle.toUpperCase()} (${result.verdict})`, PAGE_MARGIN + 4, y + 6.8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.6);
  doc.text(
    `Overall Risk Weight: ${result.riskWeight}/100  |  Safety Risk: ${result.safetyRiskWeight}/100  |  Health Risk: ${result.healthRiskWeight}/100`,
    PAGE_MARGIN + 4,
    y + 12.6
  );
  doc.text(truncateText(result.verdictSubtitle, 98), PAGE_MARGIN + 4, y + 17.8);
  y += 26;

  // Section 1: Selected Food Imagery & Weights (App-Matched Photos)
  y = drawSectionHeading(doc, y, contentWidth, '1. Formulation Components & Food Imagery', 'teal');

  const displayFoods = result.selectedFoods.slice(0, 6);
  const foodPhotos = await Promise.all(
    displayFoods.map((item) => {
      const imgUrl =
        item.food.imageUrl ||
        item.food.primaryImage ||
        resolveRelatedDishImage(item.food.name, item.food.foodType);
      return loadCrispCoverJpeg(imgUrl, 40, 26, fallbackMealImg, 640);
    })
  );

  // Render crisp 2-column visual cards matching app photography
  const cardColW = (contentWidth - 4) / 2;
  const cardH = 22;
  for (let i = 0; i < displayFoods.length; i += 2) {
    if (y + cardH > 205) break;
    for (let col = 0; col < 2; col++) {
      const itemIdx = i + col;
      if (itemIdx >= displayFoods.length) break;
      const item = displayFoods[itemIdx];
      const photo = foodPhotos[itemIdx];
      const cx = PAGE_MARGIN + col * (cardColW + 4);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(cx, y, cardColW, cardH, 2, 2, 'FD');

      if (photo) {
        doc.addImage(photo.dataUrl, 'JPEG', cx + 1.8, y + 1.8, 24, 18.4);
      }

      const tx = photo ? cx + 28 : cx + 3.5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.8);
      doc.setTextColor(15, 23, 42);
      doc.text(truncateText(item.food.name, 26), tx, y + 6.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.6);
      doc.setTextColor(100, 116, 139);
      doc.text(truncateText(item.food.category, 28), tx, y + 11.4);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 118, 110);
      doc.text(`${item.quantityGrams}${item.food.unit || 'g'}`, tx, y + 16.8);
    }
    y += cardH + 2.5;
  }
  y += 2;

  // Section 2: Combined Nutritional Totals (KPI Strip + Micro Summary)
  y = drawSectionHeading(doc, y, contentWidth, '2. Combined Nutritional Totals', 'teal');
  const labMacros = [
    { label: 'Calories', value: `${result.nutrition.calories} kcal` },
    { label: 'Protein', value: `${result.nutrition.proteinGrams}g` },
    { label: 'Carbs', value: `${result.nutrition.carbsGrams}g` },
    { label: 'Total Fat', value: `${result.nutrition.fatGrams}g` },
    { label: 'Sugar / Fiber', value: `${result.nutrition.sugarGrams}g / ${result.nutrition.fiberGrams}g` },
  ];
  const kpiW = (contentWidth - 8) / 5;
  labMacros.forEach((m, idx) => {
    const cx = PAGE_MARGIN + idx * (kpiW + 2);
    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(153, 246, 228);
    doc.roundedRect(cx, y, kpiW, 14.5, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(15, 23, 42);
    doc.text(m.value, cx + kpiW / 2, y + 6.2, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.3);
    doc.setTextColor(15, 118, 110);
    doc.text(m.label, cx + kpiW / 2, y + 11.4, { align: 'center' });
  });
  y += 18;

  y = drawBoundedText(
    doc,
    `Calcium: ${result.nutrition.calciumMg}mg  |  Vitamin C: ${result.nutrition.vitaminCMg}mg${
      result.nutrition.nutritionNote ? `  ·  ${truncateText(result.nutrition.nutritionNote, 130)}` : ''
    }`,
    PAGE_MARGIN,
    y,
    contentWidth,
    PAGE_CONTENT_BOTTOM_Y,
    { fontSize: 8.5, color: [51, 65, 85], maxLines: 3 }
  );

  // ==================== PAGE 2: BIOCHEMICAL RISKS, HEALTH IMPACTS, CONCLUSION & PUBLIC PAPER URLS ====================
  doc.addPage();
  y = drawPage2Header(
    doc,
    pageWidth,
    `Biochemical Safety, Conclusion & Public Paper References · ${truncateText(result.experimentName, 36)}`,
    `Exp ID: ${result.experimentId}`
  );

  // Section 3: Food Safety & Chemical Interactions
  y = drawSectionHeading(doc, y, contentWidth, '3. Food Safety & Chemical Interactions', 'teal');
  y = drawBoundedText(
    doc,
    `Key Biochemical Finding: ${truncateText(result.keyReason, 220)}`,
    PAGE_MARGIN,
    y,
    contentWidth,
    64,
    { fontSize: 8.6, color: [15, 23, 42], bold: true, maxLines: 3 }
  );
  y += 1.5;

  for (const risk of result.safetyRisks.slice(0, 3)) {
    y = drawBoundedText(
      doc,
      `• [${risk.severity}] ${risk.title} (${risk.type}): ${truncateText(risk.description, 150)}`,
      PAGE_MARGIN,
      y,
      contentWidth,
      115,
      {
        fontSize: 8.4,
        color: risk.severity === 'High' ? [185, 28, 28] : [51, 65, 85],
        maxLines: 2,
      }
    );
    y += 1;
  }
  y += 2;

  // Section 4: Health Suitability Impacts
  y = drawSectionHeading(doc, y, contentWidth, '4. Health Suitability Impacts', 'teal');
  for (const impact of result.healthImpacts.slice(0, 3)) {
    y = drawBoundedText(
      doc,
      `• [${impact.status.toUpperCase()}] ${truncateText(impact.text, 150)}`,
      PAGE_MARGIN,
      y,
      contentWidth,
      158,
      { fontSize: 8.5, color: [51, 65, 85], maxLines: 2 }
    );
    y += 0.8;
  }
  y += 2;

  // Section 5: Final Scientific Conclusion
  y = drawSectionHeading(doc, y, contentWidth, '5. Final Scientific Conclusion', 'emerald');
  y = drawBoundedText(
    doc,
    truncateText(result.finalConclusion, 290),
    PAGE_MARGIN,
    y,
    contentWidth,
    198,
    { fontSize: 8.7, color: [15, 23, 42], maxLines: 4 }
  );
  y += 3;

  // Section 6: Public Scientific Evidence & Research Paper URLs
  y = drawSectionHeading(
    doc,
    y,
    contentWidth,
    '6. Scientific Evidence & Public Paper URLs',
    'teal'
  );
  const labRefs = buildFoodLabReferencePapers(result);
  for (const ref of labRefs) {
    if (y + 11 > PAGE_CONTENT_BOTTOM_Y) break;
    y = drawBoundedText(
      doc,
      `• ${ref.title} (${ref.source}) — ${truncateText(ref.relevance, 100)}`,
      PAGE_MARGIN,
      y,
      contentWidth,
      PAGE_CONTENT_BOTTOM_Y - 4.5,
      { fontSize: 8.1, color: [51, 65, 85], maxLines: 2 }
    );
    y = drawClickableUrlLine(
      doc,
      ref.publicUrl,
      PAGE_MARGIN + 3,
      y,
      contentWidth - 3,
      PAGE_CONTENT_BOTTOM_Y
    );
    y += 0.8;
  }

  addFootersToAllPages(doc);

  const filename = `NutriScientia_FoodLab_${sanitizeFilenamePart(result.experimentName)}_${result.experimentId}.pdf`;
  if (options?.download !== false) {
    doc.save(filename);
  }
  return { filename, doc };
}
