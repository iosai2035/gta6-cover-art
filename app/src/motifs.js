// Leonida Cover Studio — drawn motif panels.
//
// Every motif here is an original flat vector drawing, painted with canvas
// paths inside one panel rectangle. No Rockstar artwork, logo or photograph
// is used anywhere: a palm is a curved trunk plus frond arcs, a skyline is
// rectangles plus lit windows, and so on. Each painter takes the panel's
// rectangle and two colours — ink for the silhouette, accent for the few
// details that need a second colour — and draws inside that rectangle only.

/** Paints a palm-tree silhouette: a leaning trunk, six drooping fronds, coconuts.
 *  The tree is drawn inside a centred square box, so it keeps its shape in
 *  wide or tall panels alike, and never reaches past the panel's edges. */
export function paintPalmPanel(ctx, x, y, w, h, ink, accent) {
  const s = Math.min(w, h);
  const ox = x + (w - s) / 2;
  const oy = y + h - s;
  const cx = ox + s * 0.5;
  const ground = oy + s * 0.92;
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineCap = 'round';
  // Trunk: a gentle S-curve leaning right, from the ground to the crown.
  ctx.lineWidth = Math.max(3, s * 0.045);
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.06, ground);
  ctx.quadraticCurveTo(cx - s * 0.08, oy + s * 0.68, cx + s * 0.04, oy + s * 0.45);
  ctx.stroke();
  // Fronds: six arcs fanning out of the crown, all inside the box.
  const crownX = cx + s * 0.04;
  const crownY = oy + s * 0.45;
  ctx.lineWidth = Math.max(2.5, s * 0.038);
  const fronds = [
    [-0.30, -0.10, -0.40, -0.22], [-0.22, -0.18, -0.28, -0.34],
    [-0.05, -0.22, -0.02, -0.38], [0.14, -0.20, 0.26, -0.34],
    [0.28, -0.12, 0.40, -0.20], [0.34, 0.00, 0.42, -0.06],
  ];
  for (const [dx1, dy1, dx2, dy2] of fronds) {
    ctx.beginPath();
    ctx.moveTo(crownX, crownY);
    ctx.quadraticCurveTo(crownX + dx1 * s, crownY + dy1 * s, crownX + dx2 * s, crownY + dy2 * s);
    ctx.stroke();
  }
  // Coconuts under the crown.
  ctx.beginPath();
  ctx.arc(crownX - s * 0.05, crownY + s * 0.03, s * 0.035, 0, Math.PI * 2);
  ctx.arc(crownX + s * 0.04, crownY + s * 0.045, s * 0.03, 0, Math.PI * 2);
  ctx.fill();
  // Ground line and a small accent sun.
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(ox + s * 0.82, oy + s * 0.20, s * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(2, s * 0.02);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.08, ground);
  ctx.lineTo(x + w * 0.92, ground);
  ctx.stroke();
}

/** Paints a Vice City skyline: art-deco towers, lit windows, a Ferris wheel. */
export function paintSkylinePanel(ctx, x, y, w, h, ink, accent) {
  const ground = y + h * 0.90;
  ctx.fillStyle = ink;
  const towers = [
    [0.04, 0.52, 0.16, 0.38], [0.22, 0.38, 0.13, 0.52],
    [0.37, 0.58, 0.15, 0.32], [0.54, 0.30, 0.12, 0.60],
    [0.68, 0.46, 0.14, 0.44], [0.84, 0.56, 0.12, 0.34],
  ];
  for (const [tx, ty, tw, th] of towers) {
    ctx.fillRect(x + tx * w, y + ty * h, tw * w, th * h);
    // Stepped art-deco crown on the two tallest towers.
    if (th > 0.5) ctx.fillRect(x + (tx + tw * 0.25) * w, y + (ty - 0.07) * h, tw * 0.5 * w, 0.07 * h);
  }
  ctx.fillRect(x, ground, w, h - (ground - y));
  // Lit windows: a sparse grid of small accent rectangles on the towers.
  ctx.fillStyle = accent;
  const winW = Math.max(2, w * 0.018);
  const winH = Math.max(3, h * 0.02);
  for (const [tx, ty, tw, th] of towers) {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        if ((r * 3 + c + Math.round(tx * 100)) % 3 === 0) continue;
        ctx.fillRect(x + (tx + 0.03 + c * tw * 0.3) * w, y + (ty + 0.06 + r * th * 0.2) * h, winW, winH);
      }
    }
  }
  // Ferris wheel in the sky, right side.
  const wx = x + w * 0.80;
  const wy = y + h * 0.22;
  const wr = w * 0.11;
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(2, w * 0.02);
  ctx.beginPath();
  ctx.arc(wx, wy, wr, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx + Math.cos(a) * wr, wy + Math.sin(a) * wr);
    ctx.stroke();
  }
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(wx, wy, wr * 0.18, 0, Math.PI * 2);
  ctx.fill();
}

/** Paints a low yellow sports car in profile, with wheels and a speed line. */
export function paintSportsCarPanel(ctx, x, y, w, h, ink, accent) {
  const ground = y + h * 0.78;
  ctx.fillStyle = ink;
  // Body: a low wedge with a swept nose.
  ctx.beginPath();
  ctx.moveTo(x + w * 0.06, ground);
  ctx.lineTo(x + w * 0.10, y + h * 0.52);
  ctx.lineTo(x + w * 0.30, y + h * 0.46);
  ctx.lineTo(x + w * 0.48, y + h * 0.34);
  ctx.lineTo(x + w * 0.70, y + h * 0.36);
  ctx.lineTo(x + w * 0.92, y + h * 0.50);
  ctx.lineTo(x + w * 0.95, ground);
  ctx.closePath();
  ctx.fill();
  // Cabin window cut out in the background colour is faked with accent glass.
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.34, y + h * 0.46);
  ctx.lineTo(x + w * 0.48, y + h * 0.37);
  ctx.lineTo(x + w * 0.66, y + h * 0.39);
  ctx.lineTo(x + w * 0.62, y + h * 0.47);
  ctx.closePath();
  ctx.fill();
  // Wheels.
  ctx.fillStyle = ink;
  for (const wx of [0.26, 0.74]) {
    ctx.beginPath();
    ctx.arc(x + wx * w, ground, w * 0.085, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(x + wx * w, ground, w * 0.035, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ink;
  }
  // Headlight and a speed line.
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x + w * 0.90, y + h * 0.55, w * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(2, w * 0.018);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.04, y + h * 0.30);
  ctx.lineTo(x + w * 0.30, y + h * 0.30);
  ctx.moveTo(x + w * 0.10, y + h * 0.20);
  ctx.lineTo(x + w * 0.42, y + h * 0.20);
  ctx.stroke();
}

/** Paints a pink flamingo standing in shallow water. */
export function paintFlamingoPanel(ctx, x, y, w, h, ink, accent) {
  const waterY = y + h * 0.82;
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineCap = 'round';
  // Water lines.
  ctx.lineWidth = Math.max(2, w * 0.018);
  for (const [wy, ww] of [[0.86, 0.5], [0.92, 0.7]]) {
    ctx.beginPath();
    ctx.moveTo(x + w * (0.5 - ww / 2), y + h * wy);
    ctx.lineTo(x + w * (0.5 + ww / 2), y + h * wy);
    ctx.stroke();
  }
  // Legs: one straight, one bent.
  ctx.lineWidth = Math.max(2.5, w * 0.025);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.48, y + h * 0.68);
  ctx.lineTo(x + w * 0.48, waterY);
  ctx.moveTo(x + w * 0.52, y + h * 0.68);
  ctx.lineTo(x + w * 0.60, y + h * 0.76);
  ctx.lineTo(x + w * 0.60, waterY);
  ctx.stroke();
  // Body: a fat ellipse, tilted.
  ctx.save();
  ctx.translate(x + w * 0.50, y + h * 0.58);
  ctx.rotate(-0.18);
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.20, h * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // S-neck and head: the neck rises in a gentle S, the head faces forward.
  ctx.lineWidth = Math.max(3, w * 0.035);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.62, y + h * 0.52);
  ctx.bezierCurveTo(x + w * 0.70, y + h * 0.40, x + w * 0.66, y + h * 0.28, x + w * 0.62, y + h * 0.20);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + w * 0.62, y + h * 0.18, w * 0.055, 0, Math.PI * 2);
  ctx.fill();
  // Beak, pointing forward, tipped in accent.
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.66, y + h * 0.17);
  ctx.lineTo(x + w * 0.78, y + h * 0.21);
  ctx.lineTo(x + w * 0.66, y + h * 0.25);
  ctx.closePath();
  ctx.fill();
  // Wing hint.
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(2, w * 0.02);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.36, y + h * 0.56);
  ctx.quadraticCurveTo(x + w * 0.52, y + h * 0.50, x + w * 0.64, y + h * 0.58);
  ctx.stroke();
}

/** Paints an alligator in profile: long snout, bumpy back, tail curling away. */
export function paintAlligatorPanel(ctx, x, y, w, h, ink, accent) {
  const midY = y + h * 0.58;
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  // Body: a long low shape from snout (left) to tail (right), kept flat.
  ctx.beginPath();
  ctx.moveTo(x + w * 0.04, midY - h * 0.03);
  ctx.lineTo(x + w * 0.55, midY - h * 0.06);
  ctx.quadraticCurveTo(x + w * 0.85, midY - h * 0.05, x + w * 0.95, midY - h * 0.01);
  ctx.quadraticCurveTo(x + w * 0.88, midY + h * 0.04, x + w * 0.60, midY + h * 0.05);
  ctx.lineTo(x + w * 0.10, midY + h * 0.04);
  ctx.closePath();
  ctx.fill();
  // Snout taper and jaw line.
  ctx.beginPath();
  ctx.moveTo(x + w * 0.04, midY - h * 0.03);
  ctx.lineTo(x + w * 0.16, midY + h * 0.01);
  ctx.stroke();
  // Back bumps.
  ctx.lineWidth = Math.max(2, w * 0.02);
  for (let i = 0; i < 5; i++) {
    const bx = x + w * (0.30 + i * 0.11);
    ctx.beginPath();
    ctx.arc(bx, midY - h * 0.06, w * 0.024, Math.PI, 0);
    ctx.stroke();
  }
  // Eye and teeth.
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x + w * 0.22, midY - h * 0.05, w * 0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ink;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x + w * (0.07 + i * 0.035), midY + h * 0.03);
    ctx.lineTo(x + w * (0.085 + i * 0.035), midY + h * 0.06);
    ctx.lineTo(x + w * (0.10 + i * 0.035), midY + h * 0.03);
    ctx.closePath();
    ctx.fill();
  }
  // Legs.
  ctx.lineWidth = Math.max(3, w * 0.03);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.30, midY + h * 0.04);
  ctx.lineTo(x + w * 0.30, midY + h * 0.16);
  ctx.moveTo(x + w * 0.62, midY + h * 0.04);
  ctx.lineTo(x + w * 0.62, midY + h * 0.16);
  ctx.stroke();
  // Water line under it.
  ctx.lineWidth = Math.max(2, w * 0.018);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.06, y + h * 0.86);
  ctx.lineTo(x + w * 0.94, y + h * 0.86);
  ctx.stroke();
}

/** Paints a helicopter in the sky, rotor spinning, over a tiny skyline strip. */
export function paintHelicopterPanel(ctx, x, y, w, h, ink, accent) {
  const cx = x + w * 0.46;
  const cy = y + h * 0.46;
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  ctx.lineCap = 'round';
  // Main rotor.
  ctx.lineWidth = Math.max(3, w * 0.03);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.06, cy - h * 0.22);
  ctx.lineTo(x + w * 0.94, cy - h * 0.22);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - h * 0.22);
  ctx.lineTo(cx, cy - h * 0.10);
  ctx.stroke();
  // Body: rounded cabin.
  ctx.beginPath();
  ctx.ellipse(cx, cy, w * 0.24, h * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  // Tail boom and fin.
  ctx.lineWidth = Math.max(3, w * 0.035);
  ctx.beginPath();
  ctx.moveTo(cx + w * 0.22, cy - h * 0.02);
  ctx.lineTo(x + w * 0.92, cy - h * 0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + w * 0.88, cy - h * 0.12);
  ctx.lineTo(x + w * 0.92, cy - h * 0.26);
  ctx.lineTo(x + w * 0.96, cy - h * 0.12);
  ctx.closePath();
  ctx.fill();
  // Tail rotor.
  ctx.lineWidth = Math.max(2, w * 0.02);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.90, cy - h * 0.24);
  ctx.lineTo(x + w * 0.90, cy - h * 0.06);
  ctx.stroke();
  // Window in accent, skids below.
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.ellipse(cx - w * 0.08, cy - h * 0.02, w * 0.09, h * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(2.5, w * 0.025);
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.20, cy + h * 0.13);
  ctx.lineTo(cx - w * 0.16, cy + h * 0.26);
  ctx.moveTo(cx + w * 0.14, cy + h * 0.13);
  ctx.lineTo(cx + w * 0.10, cy + h * 0.26);
  ctx.moveTo(cx - w * 0.26, cy + h * 0.26);
  ctx.lineTo(cx + w * 0.22, cy + h * 0.26);
  ctx.stroke();
  // Tiny skyline strip at the foot.
  ctx.fillStyle = ink;
  const ground = y + h * 0.88;
  for (let i = 0; i < 6; i++) {
    const bw = w * 0.10;
    const bh = h * (0.06 + ((i * 37) % 10) * 0.008);
    ctx.fillRect(x + w * 0.06 + i * w * 0.15, ground - bh, bw, bh);
  }
  ctx.fillRect(x, ground, w, y + h - ground);
}

/** Paints a speedboat cutting across the water, sun behind it. */
export function paintSpeedboatPanel(ctx, x, y, w, h, ink, accent) {
  // Sun.
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x + w * 0.72, y + h * 0.26, w * 0.14, 0, Math.PI * 2);
  ctx.fill();
  // Water.
  const waterY = y + h * 0.62;
  ctx.fillStyle = ink;
  ctx.fillRect(x, waterY, w, y + h - waterY);
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(2, w * 0.018);
  for (const [wy, x0, x1] of [[0.70, 0.08, 0.5], [0.78, 0.55, 0.95], [0.86, 0.1, 0.42]]) {
    ctx.beginPath();
    ctx.moveTo(x + x0 * w, y + h * wy);
    ctx.lineTo(x + x1 * w, y + h * wy);
    ctx.stroke();
  }
  // Hull: a wedge with a raised bow.
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.08, waterY - h * 0.06);
  ctx.lineTo(x + w * 0.22, waterY - h * 0.16);
  ctx.lineTo(x + w * 0.78, waterY - h * 0.16);
  ctx.lineTo(x + w * 0.92, waterY - h * 0.05);
  ctx.lineTo(x + w * 0.86, waterY + h * 0.02);
  ctx.lineTo(x + w * 0.14, waterY + h * 0.02);
  ctx.closePath();
  ctx.fill();
  // Windshield and wake.
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.30, waterY - h * 0.15);
  ctx.lineTo(x + w * 0.42, waterY - h * 0.24);
  ctx.lineTo(x + w * 0.58, waterY - h * 0.24);
  ctx.lineTo(x + w * 0.52, waterY - h * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(2, w * 0.02);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.06, waterY + h * 0.06);
  ctx.quadraticCurveTo(x + w * 0.30, waterY + h * 0.12, x + w * 0.55, waterY + h * 0.06);
  ctx.stroke();
}

/** Paints a big setting sun over the sea, with reflection stripes. */
export function paintSunsetPanel(ctx, x, y, w, h, ink, accent) {
  const horizon = y + h * 0.62;
  const sunX = x + w * 0.5;
  const sunY = y + h * 0.44;
  const sunR = w * 0.22;
  // Sun disc with horizontal slits, comic style.
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ink;
  for (const sy of [0.40, 0.48, 0.56]) {
    ctx.fillRect(x + w * 0.22, y + h * sy, w * 0.56, Math.max(2, h * 0.012));
  }
  // Sea.
  ctx.fillStyle = ink;
  ctx.fillRect(x, horizon, w, y + h - horizon);
  // Reflection stripes.
  ctx.fillStyle = accent;
  for (let i = 0; i < 4; i++) {
    const ry = horizon + h * (0.06 + i * 0.08);
    const rw = w * (0.34 - i * 0.05);
    ctx.fillRect(sunX - rw / 2, ry, rw, Math.max(2, h * 0.014));
  }
  // Two small palms framing the sun, kept inside the panel.
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(2.5, w * 0.03);
  ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    const px = sunX + side * w * 0.36;
    ctx.beginPath();
    ctx.moveTo(px, horizon);
    ctx.quadraticCurveTo(px + side * w * 0.02, y + h * 0.42, px - side * w * 0.03, y + h * 0.34);
    ctx.stroke();
    for (const [dx, dy] of [[-0.08, -0.08], [0.01, -0.11], [0.09, -0.06]]) {
      ctx.beginPath();
      ctx.moveTo(px - side * w * 0.03, y + h * 0.34);
      ctx.quadraticCurveTo(px + side * dx * w * 0.6, y + h * (0.34 + dy * 0.5), px + side * dx * w, y + h * (0.34 + dy));
      ctx.stroke();
    }
  }
}

/** Paints a neon sign panel: a glowing frame with a short word in it. */
export function paintNeonPanel(ctx, x, y, w, h, ink, accent, word) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  // Glowing frame.
  ctx.save();
  ctx.strokeStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = w * 0.06;
  ctx.lineWidth = Math.max(3, w * 0.03);
  roundRectPath(ctx, x + w * 0.10, y + h * 0.18, w * 0.80, h * 0.64, w * 0.06);
  ctx.stroke();
  ctx.restore();
  // The word, in the accent colour with a white core.
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let size = h * 0.22;
  ctx.font = `${size}px Bungee, "Arial Black", sans-serif`;
  while (ctx.measureText(word).width > w * 0.68 && size > 10) {
    size -= 2;
    ctx.font = `${size}px Bungee, "Arial Black", sans-serif`;
  }
  ctx.save();
  ctx.shadowColor = accent;
  ctx.shadowBlur = size * 0.35;
  ctx.fillStyle = accent;
  ctx.fillText(word, cx, cy);
  ctx.restore();
  ctx.fillStyle = '#ffffff';
  ctx.fillText(word, cx, cy);
  // Small stars around it.
  ctx.fillStyle = accent;
  for (const [sx, sy, sr] of [[0.16, 0.22, 0.03], [0.84, 0.78, 0.035], [0.86, 0.20, 0.025]]) {
    drawStar(ctx, x + sx * w, y + sy * h, sr * w);
  }
}

/** A four-point star, used as a sparkle. */
export function drawStar(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx, cy, cx + r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + r);
  ctx.quadraticCurveTo(cx, cy, cx - r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - r);
  ctx.fill();
}

/** Rounded-rectangle path helper (no fill or stroke here). */
export function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
