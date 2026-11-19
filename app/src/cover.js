// Leonida Cover Studio — the poster renderer.
//
// drawCoverArt paints one whole cover onto a canvas at export resolution:
// a sunset background, a 3x3 comic grid with the user's photo at its
// centre, duotone side crops, drawn motif panels, a big "VI" monogram drawn
// as artwork (sunset gradient, palm fronds across it — never a font file
// from the game), a bold caption stack and a footer strip. Everything is
// drawn with the canvas 2D API; no network, no library, no Rockstar asset.

import {
  paintPalmPanel, paintSkylinePanel, paintSportsCarPanel, paintFlamingoPanel,
  paintAlligatorPanel, paintHelicopterPanel, paintSpeedboatPanel,
  paintSunsetPanel, paintNeonPanel, drawStar, roundRectPath,
} from './motifs.js';

/** The three post sizes the app exports, in pixels. */
export const POSTER_SIZES = {
  portrait: [1080, 1350],
  square: [1080, 1080],
  wide: [1920, 1080],
};

/** Duotone grades: shadow colour -> highlight colour, with an accent. */
export const DUOTONE_GRADES = {
  vice: { shadow: '#3B0A2E', highlight: '#FC94AF', accent: '#FF2E88', label: 'Vice Pink' },
  lagoon: { shadow: '#062A33', highlight: '#12C2C4', accent: '#E8FBFF', label: 'Lagoon Teal' },
  sunset: { shadow: '#5A1E00', highlight: '#FF8A3D', accent: '#FFE9B0', label: 'Sunset Orange' },
  midnight: { shadow: '#12082A', highlight: '#B645FF', accent: '#FF6EC7', label: 'Midnight Purple' },
};

const INK = '#1A0B2E';
const SUNSET_STOPS = ['#3B1C6E', '#FC94AF', '#FF8A3D'];

/** Where each panel of the 3x3 grid gets its picture, per layout preset. */
export const LAYOUT_PLANS = {
  classic: [
    { c: 0, r: 0, cs: 1, rs: 1, kind: 'motif', detail: 'skyline' },
    { c: 1, r: 0, cs: 1, rs: 1, kind: 'crop', detail: 'face' },
    { c: 2, r: 0, cs: 1, rs: 1, kind: 'motif', detail: 'flamingo' },
    { c: 0, r: 1, cs: 1, rs: 1, kind: 'crop', detail: 'left' },
    { c: 1, r: 1, cs: 1, rs: 1, kind: 'photo', detail: 'main' },
    { c: 2, r: 1, cs: 1, rs: 1, kind: 'motif', detail: 'car' },
    { c: 0, r: 2, cs: 1, rs: 1, kind: 'motif', detail: 'palm' },
    { c: 1, r: 2, cs: 1, rs: 1, kind: 'crop', detail: 'bottom' },
    { c: 2, r: 2, cs: 1, rs: 1, kind: 'motif', detail: 'gator' },
  ],
  hero: [
    { c: 0, r: 0, cs: 1, rs: 1, kind: 'motif', detail: 'skyline' },
    { c: 1, r: 0, cs: 1, rs: 1, kind: 'motif', detail: 'helicopter' },
    { c: 2, r: 0, cs: 1, rs: 1, kind: 'motif', detail: 'flamingo' },
    { c: 0, r: 1, cs: 3, rs: 1, kind: 'photo', detail: 'main' },
    { c: 0, r: 2, cs: 1, rs: 1, kind: 'crop', detail: 'face' },
    { c: 1, r: 2, cs: 1, rs: 1, kind: 'motif', detail: 'palm' },
    { c: 2, r: 2, cs: 1, rs: 1, kind: 'crop', detail: 'bottom' },
  ],
  strip: [
    { c: 0, r: 0, cs: 1, rs: 1, kind: 'crop', detail: 'face' },
    { c: 1, r: 0, cs: 1, rs: 1, kind: 'crop', detail: 'left' },
    { c: 2, r: 0, cs: 1, rs: 1, kind: 'crop', detail: 'bottom' },
    { c: 0, r: 1, cs: 1, rs: 1, kind: 'motif', detail: 'boat' },
    { c: 1, r: 1, cs: 1, rs: 1, kind: 'photo', detail: 'main' },
    { c: 2, r: 1, cs: 1, rs: 1, kind: 'motif', detail: 'car' },
    { c: 0, r: 2, cs: 1, rs: 1, kind: 'motif', detail: 'sunset' },
    { c: 1, r: 2, cs: 1, rs: 1, kind: 'motif', detail: 'palm' },
    { c: 2, r: 2, cs: 1, rs: 1, kind: 'motif', detail: 'gator' },
  ],
};

/** Focus points (fractions of the photo) for the side-panel crops. */
const CROP_FOCUS = {
  face: [0.5, 0.30],
  left: [0.22, 0.5],
  bottom: [0.5, 0.78],
  right: [0.8, 0.45],
};

const MOTIF_PAINTERS = {
  palm: paintPalmPanel,
  skyline: paintSkylinePanel,
  car: paintSportsCarPanel,
  flamingo: paintFlamingoPanel,
  gator: paintAlligatorPanel,
  helicopter: paintHelicopterPanel,
  boat: paintSpeedboatPanel,
  sunset: paintSunsetPanel,
  neon: paintNeonPanel,
};

/** Draws `photo` cover-fitting `dw` x `dh` on `octx`, centred on `focus`. */
function drawCoverFit(octx, photo, focus, zoom, dw, dh) {
  const iw = photo.naturalWidth;
  const ih = photo.naturalHeight;
  const scale = Math.max(dw / iw, dh / ih) * zoom;
  const sw = dw / scale;
  const sh = dh / scale;
  let sx = focus[0] * iw - sw / 2;
  let sy = focus[1] * ih - sh / 2;
  sx = Math.max(0, Math.min(iw - sw, sx));
  sy = Math.max(0, Math.min(ih - sh, sy));
  octx.drawImage(photo, sx, sy, sw, sh, 0, 0, dw, dh);
}

/** Maps 0..1 onto a posterised step of `levels` levels. */
function posterStep(t, levels) {
  return Math.round(t * (levels - 1)) / (levels - 1);
}

function hexToRgb(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

/**
 * Draws a rotated halftone dot screen over `rect`: dot radius grows with
 * darkness, sampled from `lum` (a lw x lh luminance array, 0..1).
 */
function halftoneDots(ctx, rect, lum, lw, lh, spacing, ink, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = ink;
  ctx.globalAlpha = alpha;
  const diag = Math.hypot(rect.w, rect.h);
  const half = diag / 2 + spacing;
  const cos = Math.cos(-Math.PI / 4);
  const sin = Math.sin(-Math.PI / 4);
  for (let gy = -half; gy <= half; gy += spacing) {
    for (let gx = -half; gx <= half; gx += spacing) {
      const rx = gx * cos - gy * sin;
      const ry = gx * sin + gy * cos;
      const px = rx + rect.w / 2;
      const py = ry + rect.h / 2;
      if (px < 0 || px >= rect.w || py < 0 || py >= rect.h) continue;
      const lx = Math.min(lw - 1, Math.max(0, Math.floor((px / rect.w) * lw)));
      const ly = Math.min(lh - 1, Math.max(0, Math.floor((py / rect.h) * lh)));
      const radius = (1 - lum[ly * lw + lx]) * spacing * 0.42;
      if (radius < 0.4) continue;
      ctx.beginPath();
      ctx.arc(gx, gy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * Paints one photo panel as a duotone: luminance mapped onto the grade's
 * shadow -> highlight gradient, posterised to 4 levels, with a halftone
 * dot screen on top. Works on a small copy, then draws it up to size.
 */
function duotonePhotoPanel(ctx, rect, photo, focus, zoom, grade, dotSpacing) {
  const workW = 300;
  const workH = Math.max(2, Math.round((workW * rect.h) / rect.w));
  const off = document.createElement('canvas');
  off.width = workW;
  off.height = workH;
  const octx = off.getContext('2d');
  drawCoverFit(octx, photo, focus, zoom, workW, workH);
  const img = octx.getImageData(0, 0, workW, workH);
  const data = img.data;
  const lum = new Float32Array(workW * workH);
  const shadow = hexToRgb(grade.shadow);
  const highlight = hexToRgb(grade.highlight);
  for (let i = 0; i < workW * workH; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    lum[i] = l;
    // A gamma lift keeps mid-tones readable instead of sinking to the ink.
    const t = posterStep(Math.pow(l, 0.8), 4);
    data[i * 4] = Math.round(shadow[0] + (highlight[0] - shadow[0]) * t);
    data[i * 4 + 1] = Math.round(shadow[1] + (highlight[1] - shadow[1]) * t);
    data[i * 4 + 2] = Math.round(shadow[2] + (highlight[2] - shadow[2]) * t);
  }
  octx.putImageData(img, 0, 0);
  ctx.drawImage(off, rect.x, rect.y, rect.w, rect.h);
  if (dotSpacing > 0) halftoneDots(ctx, rect, lum, workW, workH, dotSpacing, INK, 0.42);
}

/**
 * Paints the hero photo panel in colour: boosted saturation and contrast,
 * channels posterised to 5 levels, and a light halftone screen, so the
 * person stays the cover's brightest, most photographic moment.
 */
function colourPhotoPanel(ctx, rect, photo, focus, zoom, dotSpacing) {
  const workW = 320;
  const workH = Math.max(2, Math.round((workW * rect.h) / rect.w));
  const off = document.createElement('canvas');
  off.width = workW;
  off.height = workH;
  const octx = off.getContext('2d');
  octx.filter = 'saturate(1.4) contrast(1.18) brightness(1.03)';
  drawCoverFit(octx, photo, focus, zoom, workW, workH);
  octx.filter = 'none';
  const img = octx.getImageData(0, 0, workW, workH);
  const data = img.data;
  const lum = new Float32Array(workW * workH);
  for (let i = 0; i < workW * workH; i++) {
    for (let c = 0; c < 3; c++) {
      data[i * 4 + c] = Math.round(Math.round((data[i * 4 + c] / 255) * 5) * 51);
    }
    lum[i] = (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) / 255;
  }
  octx.putImageData(img, 0, 0);
  ctx.drawImage(off, rect.x, rect.y, rect.w, rect.h);
  if (dotSpacing > 0) halftoneDots(ctx, rect, lum, workW, workH, dotSpacing, INK, 0.32);
}

/** Paints one drawn-motif panel: grade gradient, the motif, halftone dots. */
function motifPanel(ctx, rect, name, grade, dotSpacing, word) {
  const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  grad.addColorStop(0, grade.shadow);
  grad.addColorStop(1, grade.highlight);
  ctx.fillStyle = grad;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  const painter = MOTIF_PAINTERS[name] ?? paintPalmPanel;
  if (name === 'neon') painter(ctx, rect.x, rect.y, rect.w, rect.h, INK, grade.accent, word ?? 'VICE');
  else painter(ctx, rect.x, rect.y, rect.w, rect.h, INK, '#FFFFFF');
  if (dotSpacing > 0) {
    // A flat luminance field (mid-grey) gives an even dot screen on motifs.
    const lw = 24;
    const lh = Math.max(2, Math.round((lw * rect.h) / rect.w));
    const lum = new Float32Array(lw * lh).fill(0.5);
    halftoneDots(ctx, rect, lum, lw, lh, dotSpacing, INK, 0.18);
  }
}

/** Placeholder centre when no photo is loaded yet: sunset, palms, silhouette. */
function emptyPhotoPanel(ctx, rect, grade) {
  const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  grad.addColorStop(0, '#3B1C6E');
  grad.addColorStop(0.55, '#FC94AF');
  grad.addColorStop(1, '#FF8A3D');
  ctx.fillStyle = grad;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(rect.x + rect.w * 0.5, rect.y + rect.h * 0.38, rect.w * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(rect.x + rect.w * 0.5, rect.y + rect.h * 0.50);
  ctx.quadraticCurveTo(rect.x + rect.w * 0.5, rect.y + rect.h * 0.62, rect.x + rect.w * 0.24, rect.y + rect.h * 0.92);
  ctx.lineTo(rect.x + rect.w * 0.76, rect.y + rect.h * 0.92);
  ctx.quadraticCurveTo(rect.x + rect.w * 0.5, rect.y + rect.h * 0.62, rect.x + rect.w * 0.5, rect.y + rect.h * 0.50);
  ctx.fill();
  paintPalmPanel(ctx, rect.x + rect.w * 0.04, rect.y + rect.h * 0.55, rect.w * 0.30, rect.h * 0.40, INK, '#FF8A3D');
  paintPalmPanel(ctx, rect.x + rect.w * 0.66, rect.y + rect.h * 0.55, rect.w * 0.30, rect.h * 0.40, INK, '#FF8A3D');
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.max(14, rect.w * 0.055)}px Anton, "Arial Narrow", sans-serif`;
  ctx.fillText('ADD YOUR PHOTO', rect.x + rect.w / 2, rect.y + rect.h * 0.97 - rect.h * 0.06);
}

/** Splits a caption into at most 3 balanced lines. */
function splitCaptionLines(text) {
  const manual = text.split('\n').map((s) => s.trim()).filter(Boolean);
  if (manual.length > 1) return manual.slice(0, 3);
  const words = (manual[0] ?? '').split(/\s+/).filter(Boolean);
  if (words.length <= 2) return [words.join(' ')];
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(' '), words.slice(half).join(' ')];
}

/**
 * Draws the caption as a bold stack: white fill, thick dark outline under
 * it, hard offset shadow — the comic lettering that makes it read as GTA.
 */
function drawCaptionStack(ctx, text, cx, cy, maxW, size, style) {
  const lines = splitCaptionLines(text);
  if (!lines.length || !lines[0]) return;
  const fontFor = (s, st) =>
    st === 'neon' ? `${s}px Bungee, "Arial Black", sans-serif` : `${s}px Anton, "Arial Narrow", sans-serif`;
  let fit = size;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  while (fit > 12) {
    ctx.font = fontFor(fit, style);
    if (lines.every((ln) => ctx.measureText(ln).width <= maxW)) break;
    fit -= 2;
  }
  const lineH = fit * 1.02;
  const startY = cy - ((lines.length - 1) * lineH) / 2;
  ctx.lineJoin = 'round';
  lines.forEach((line, i) => {
    const y = startY + i * lineH;
    const x = cx + (i % 2 === 1 ? fit * 0.08 : -fit * 0.04);
    if (style === 'neon') {
      ctx.save();
      ctx.shadowColor = '#FF2E88';
      ctx.shadowBlur = fit * 0.30;
      ctx.fillStyle = '#FF6EC7';
      ctx.font = fontFor(fit, style);
      ctx.fillText(line, x, y);
      ctx.restore();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(line, x, y);
      return;
    }
    ctx.font = fontFor(fit, style);
    // Hard shadow, then outline, then fill.
    ctx.fillStyle = INK;
    ctx.fillText(line, x + fit * 0.05, y + fit * 0.05);
    ctx.lineWidth = Math.max(3, fit * 0.16);
    ctx.strokeStyle = INK;
    ctx.strokeText(line, x, y);
    if (style === 'sunset') {
      const grad = ctx.createLinearGradient(0, y - fit / 2, 0, y + fit / 2);
      grad.addColorStop(0, SUNSET_STOPS[0]);
      grad.addColorStop(0.5, SUNSET_STOPS[1]);
      grad.addColorStop(1, SUNSET_STOPS[2]);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = '#FFFFFF';
    }
    ctx.fillText(line, x, y);
  });
}

/**
 * Draws the big "VI" monogram over the centre cell: Anton letters filled
 * with the sunset gradient, outlined dark, with palm fronds crossing them.
 * The letters are drawn artwork, not a font file from the game.
 */
function drawBigVIMonogram(ctx, rect) {
  const size = Math.min(rect.h * 0.88, rect.w * 0.60);
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h * 0.44;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${size}px Anton, "Arial Narrow", sans-serif`;
  ctx.lineJoin = 'round';
  const grad = ctx.createLinearGradient(0, cy - size / 2, 0, cy + size / 2);
  grad.addColorStop(0, SUNSET_STOPS[0]);
  grad.addColorStop(0.5, SUNSET_STOPS[1]);
  grad.addColorStop(1, SUNSET_STOPS[2]);
  ctx.lineWidth = Math.max(4, size * 0.07);
  ctx.strokeStyle = INK;
  ctx.strokeText('VI', cx, cy);
  ctx.fillStyle = grad;
  ctx.fillText('VI', cx, cy);
  // Palm fronds crossing the letters, clipped to the letters' own box so
  // they never spray across the neighbouring panels.
  ctx.save();
  ctx.beginPath();
  ctx.rect(cx - size * 0.62, cy - size * 0.55, size * 1.24, size * 1.1);
  ctx.clip();
  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(3, size * 0.03);
  ctx.lineCap = 'round';
  for (const [x0, y0, x1, y1, x2, y2] of [
    [cx - size * 0.55, cy - size * 0.10, cx - size * 0.20, cy - size * 0.30, cx + size * 0.10, cy - size * 0.42],
    [cx + size * 0.55, cy + size * 0.05, cx + size * 0.25, cy - size * 0.18, cx - size * 0.05, cy - size * 0.34],
  ]) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(x1, y1, x2, y2);
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}

/** Draws the footer strip: footer text left, wanted stars right. */
function drawFooterStrip(ctx, x, y, w, h, state) {
  ctx.fillStyle = INK;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.max(12, h * 0.52)}px Anton, "Arial Narrow", sans-serif`;
  ctx.fillText(state.footerText, x + w * 0.02, y + h / 2);
  // Wanted stars.
  ctx.textAlign = 'right';
  const starSize = h * 0.62;
  ctx.font = `${starSize}px sans-serif`;
  let stars = '';
  for (let i = 0; i < 5; i++) stars += i < state.wanted ? '★' : '☆';
  ctx.fillStyle = '#FFD23F';
  ctx.fillText(stars, x + w * 0.98, y + h / 2 + starSize * 0.04);
  // Small sparkles between text and stars.
  ctx.fillStyle = '#FF6EC7';
  drawStar(ctx, x + w * 0.62, y + h * 0.5, h * 0.16);
}

/**
 * Paints one whole cover onto `canvas` at the poster's export resolution.
 * `state` holds the photo, layout, grade, halftone, caption and size.
 * The canvas itself is the live preview: what you see is what exports.
 */
export function drawCoverArt(canvas, state) {
  const [W, H] = POSTER_SIZES[state.size] ?? POSTER_SIZES.portrait;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const grade = DUOTONE_GRADES[state.grade] ?? DUOTONE_GRADES.vice;
  const dotSpacing = state.halftone ? state.dotSpacing : 0;

  // Sunset background: the frame the grid, banner and footer sit on.
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, SUNSET_STOPS[0]);
  bg.addColorStop(0.55, SUNSET_STOPS[1]);
  bg.addColorStop(1, SUNSET_STOPS[2]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Geometry: grid, caption banner, footer strip.
  const M = Math.round(W * 0.03);
  const footerH = Math.round(H * 0.05);
  const bannerH = state.captionPlace === 'banner' ? Math.round(H * 0.115) : Math.round(H * 0.028);
  const gx = M;
  const gy = M;
  const gw = W - 2 * M;
  const gh = H - 2 * M - bannerH - footerH;
  const gutter = Math.max(6, Math.round(W * 0.008));
  const cw = (gw - 2 * gutter) / 3;
  const ch = (gh - 2 * gutter) / 3;
  const borderW = Math.max(2, Math.round(W * 0.003));

  const cells = LAYOUT_PLANS[state.layout] ?? LAYOUT_PLANS.classic;
  let centreRect = null;
  for (const cell of cells) {
    const rect = {
      x: gx + cell.c * (cw + gutter),
      y: gy + cell.r * (ch + gutter),
      w: cell.cs * cw + (cell.cs - 1) * gutter,
      h: cell.rs * ch + (cell.rs - 1) * gutter,
    };
    if (cell.kind === 'photo') centreRect = rect;
    if (cell.kind === 'photo') {
      if (state.photo) colourPhotoPanel(ctx, rect, state.photo, [state.panX, state.panY], state.zoom, dotSpacing);
      else emptyPhotoPanel(ctx, rect, grade);
    } else if (cell.kind === 'crop') {
      if (state.photo) {
        duotonePhotoPanel(ctx, rect, state.photo, CROP_FOCUS[cell.detail] ?? [0.5, 0.5], 1.35, grade, dotSpacing);
      } else {
        motifPanel(ctx, rect, cell.detail === 'face' ? 'sunset' : 'palm', grade, dotSpacing);
      }
    } else {
      motifPanel(ctx, rect, cell.detail, grade, dotSpacing, state.caption);
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = borderW;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  }

  // Outer frame around the grid.
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(3, Math.round(W * 0.004));
  ctx.strokeRect(gx - borderW / 2, gy - borderW / 2, gw + borderW, gh + borderW);

  // The "VI" monogram over the centre cell.
  if (centreRect) drawBigVIMonogram(ctx, centreRect);

  // Caption, by placement.
  const caption = state.caption.trim();
  if (caption) {
    if (state.captionPlace === 'banner') {
      const by = gy + gh + bannerH / 2;
      drawCaptionStack(ctx, caption, W / 2, by, W * 0.92, bannerH * 0.62, state.captionStyle);
    } else if (state.captionPlace === 'centre' && centreRect) {
      const stripH = Math.min(centreRect.h * 0.34, H * 0.11);
      ctx.fillStyle = 'rgba(26, 11, 46, 0.55)';
      ctx.fillRect(centreRect.x, centreRect.y + centreRect.h - stripH, centreRect.w, stripH);
      drawCaptionStack(
        ctx, caption, centreRect.x + centreRect.w / 2,
        centreRect.y + centreRect.h - stripH / 2, centreRect.w * 0.94,
        stripH * 0.52, state.captionStyle,
      );
    } else if (state.captionPlace === 'sticker') {
      ctx.save();
      ctx.translate(gx + gw * 0.30, gy + gh * 0.10);
      ctx.rotate(-0.06);
      // Size the ribbon from the caption itself, measured at ribbon size.
      const sh = Math.round(H * 0.055);
      ctx.font = `${sh * 0.55}px ${state.captionStyle === 'neon' ? 'Bungee, "Arial Black", sans-serif' : 'Anton, "Arial Narrow", sans-serif'}`;
      const textW = ctx.measureText(caption).width;
      const sw = Math.min(gw * 0.66, textW + sh * 1.4);
      const grad = ctx.createLinearGradient(-sw / 2, 0, sw / 2, 0);
      grad.addColorStop(0, '#FF8A3D');
      grad.addColorStop(1, '#FF2E88');
      ctx.fillStyle = grad;
      roundRectPath(ctx, -sw / 2, -sh / 2, sw, sh, sh * 0.3);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = borderW;
      ctx.stroke();
      drawCaptionStack(ctx, caption, 0, 0, sw * 0.92, sh * 0.55, state.captionStyle);
      ctx.restore();
    }
  }

  // Footer strip.
  drawFooterStrip(ctx, M, H - M - footerH, W - 2 * M, footerH, state);
}
