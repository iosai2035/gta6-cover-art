// Leonida Cover Studio — wires the editor page.
//
// The preview canvas IS the export canvas: it is painted at the poster's
// export resolution and shown scaled down by CSS, so what you see is
// exactly the PNG the Export button downloads. Controls edit one shared
// `coverState` object and re-render through requestAnimationFrame.

import { drawCoverArt, POSTER_SIZES, DUOTONE_GRADES } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');

/** The whole editor state: photo, layout, grade, halftone, caption, size. */
export const coverState = {
  photo: null,
  photoName: 'pier',
  panX: 0.5,
  panY: 0.32,
  zoom: 1,
  layout: 'classic',
  grade: 'vice',
  halftone: true,
  dotSpacing: 9,
  caption: 'Sunset Heist',
  captionStyle: 'block',
  captionPlace: 'banner',
  size: 'portrait',
  wanted: 5,
  footerText: 'VICE CITY • LEONIDA',
};

let renderQueued = false;
let fontsReady = false;

/** Re-renders the cover on the next animation frame, at most once a frame. */
export function renderCover() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    drawCoverArt(canvas, coverState);
    canvas.dataset.size = coverState.size;
    document.getElementById('zoomLabel').textContent = `${Math.round(coverState.zoom * 100)}%`;
  });
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Sets the working photo and resets the main panel's framing. */
export async function setPhoto(img, name) {
  coverState.photo = img;
  coverState.photoName = name;
  coverState.panX = 0.5;
  coverState.panY = 0.32;
  coverState.zoom = 1;
  document.getElementById('zoom').value = '100';
  renderCover();
}

/** Applies a whole state patch (used by screenshots and the randomiser). */
export function applyCoverState(patch) {
  Object.assign(coverState, patch);
  syncControls();
  renderCover();
}

/** Mirrors the state back into the control panel. */
function syncControls() {
  const $ = (id) => document.getElementById(id);
  $('caption').value = coverState.caption;
  $('captionStyle').value = coverState.captionStyle;
  $('captionPlace').value = coverState.captionPlace;
  $('size').value = coverState.size;
  $('wanted').value = String(coverState.wanted);
  $('footerText').value = coverState.footerText;
  $('halftone').checked = coverState.halftone;
  $('dotSize').value = String(coverState.dotSpacing);
  $('dotLabel').textContent = `${coverState.dotSpacing}px`;
  $('zoom').value = String(Math.round(coverState.zoom * 100));
  for (const el of document.querySelectorAll('[data-layout]')) {
    el.classList.toggle('active', el.dataset.layout === coverState.layout);
  }
  for (const el of document.querySelectorAll('[data-grade]')) {
    el.classList.toggle('active', el.dataset.grade === coverState.grade);
  }
}

/** Picks a random layout, grade and caption placement — a one-click remix. */
function randomiseCover() {
  const layouts = ['classic', 'hero', 'strip'];
  const grades = Object.keys(DUOTONE_GRADES);
  const places = ['banner', 'centre', 'sticker'];
  coverState.layout = layouts[Math.floor(Math.random() * layouts.length)];
  coverState.grade = grades[Math.floor(Math.random() * grades.length)];
  coverState.captionPlace = places[Math.floor(Math.random() * places.length)];
  coverState.dotSpacing = 4 + Math.floor(Math.random() * 9);
  syncControls();
  renderCover();
  status.textContent = 'Remixed — try Export when you like it.';
}

/** Downloads the preview canvas as a PNG at its export resolution. */
function exportCoverPNG() {
  const [w, h] = POSTER_SIZES[coverState.size];
  canvas.toBlob((blob) => {
    if (!blob) {
      status.textContent = 'Export failed — try again.';
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `leonida-cover-${w}x${h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 60_000);
    status.textContent = `Saved leonida-cover-${w}x${h}.png`;
  }, 'image/png');
}

// --- Control wiring -------------------------------------------------------

document.getElementById('photo').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    await setPhoto(await loadImage(URL.createObjectURL(file)), 'upload');
    status.textContent = `Loaded ${file.name} — drag the cover to reframe it.`;
  } catch {
    status.textContent = 'That file did not load as a photo.';
  }
});

for (const btn of document.querySelectorAll('[data-sample]')) {
  btn.addEventListener('click', async () => {
    const name = btn.dataset.sample;
    try {
      await setPhoto(await loadImage(`samples/${name}.jpg`), name);
      status.textContent = `Sample ${name} loaded.`;
    } catch {
      status.textContent = `Sample ${name} failed to load.`;
    }
  });
}

for (const btn of document.querySelectorAll('[data-layout]')) {
  btn.addEventListener('click', () => {
    coverState.layout = btn.dataset.layout;
    syncControls();
    renderCover();
  });
}

for (const btn of document.querySelectorAll('[data-grade]')) {
  btn.addEventListener('click', () => {
    coverState.grade = btn.dataset.grade;
    syncControls();
    renderCover();
  });
}

document.getElementById('caption').addEventListener('input', (e) => {
  coverState.caption = e.target.value;
  renderCover();
});
document.getElementById('captionStyle').addEventListener('change', (e) => {
  coverState.captionStyle = e.target.value;
  renderCover();
});
document.getElementById('captionPlace').addEventListener('change', (e) => {
  coverState.captionPlace = e.target.value;
  renderCover();
});
document.getElementById('size').addEventListener('change', (e) => {
  coverState.size = e.target.value;
  renderCover();
});
document.getElementById('wanted').addEventListener('change', (e) => {
  coverState.wanted = Number(e.target.value);
  renderCover();
});
document.getElementById('footerText').addEventListener('input', (e) => {
  coverState.footerText = e.target.value.toUpperCase();
  renderCover();
});
document.getElementById('halftone').addEventListener('change', (e) => {
  coverState.halftone = e.target.checked;
  renderCover();
});
document.getElementById('dotSize').addEventListener('input', (e) => {
  coverState.dotSpacing = Number(e.target.value);
  document.getElementById('dotLabel').textContent = `${coverState.dotSpacing}px`;
  renderCover();
});
document.getElementById('zoom').addEventListener('input', (e) => {
  coverState.zoom = Number(e.target.value) / 100;
  renderCover();
});
document.getElementById('randomise').addEventListener('click', randomiseCover);
document.getElementById('export').addEventListener('click', exportCoverPNG);

// --- Drag to reframe the main photo ---------------------------------------

let dragging = false;
function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
}
canvas.addEventListener('pointerdown', (e) => {
  if (!coverState.photo) return;
  dragging = true;
  canvas.setPointerCapture(e.pointerId);
  canvas.dataset.dragX = String(e.clientX);
  canvas.dataset.dragY = String(e.clientY);
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const dx = (e.clientX - Number(canvas.dataset.dragX)) / canvas.getBoundingClientRect().width;
  const dy = (e.clientY - Number(canvas.dataset.dragY)) / canvas.getBoundingClientRect().height;
  canvas.dataset.dragX = String(e.clientX);
  canvas.dataset.dragY = String(e.clientY);
  // Dragging right moves the photo's focus left, like panning a camera.
  coverState.panX = Math.max(0.05, Math.min(0.95, coverState.panX - dx));
  coverState.panY = Math.max(0.05, Math.min(0.95, coverState.panY - dy));
  renderCover();
});
canvas.addEventListener('pointerup', () => {
  dragging = false;
});
canvas.addEventListener('wheel', (e) => {
  if (!coverState.photo) return;
  e.preventDefault();
  coverState.zoom = Math.max(1, Math.min(3, coverState.zoom * (e.deltaY < 0 ? 1.1 : 0.9)));
  document.getElementById('zoom').value = String(Math.round(coverState.zoom * 100));
  renderCover();
}, { passive: false });

// --- Start-up: fonts, then the sample photo, then the first render --------

async function startCoverStudio() {
  try {
    await Promise.all([
      document.fonts.load('100px Anton'),
      document.fonts.load('100px Bungee'),
    ]);
    fontsReady = true;
  } catch {
    fontsReady = false;
  }
  const shot = new URLSearchParams(location.search).get('shot');
  if (shot) {
    await runShot(shot, new URLSearchParams(location.search), {
      loadImage, setPhoto, applyCoverState, renderCover,
    });
    return;
  }
  // No shot: open with the pier sample so the poster is alive at once.
  try {
    await setPhoto(await loadImage('samples/pier.jpg'), 'pier');
  } catch {
    renderCover();
  }
  status.textContent = 'Tip: upload your own photo, or drag the cover to reframe it.';
}

window.__coverApp = { coverState, renderCover, applyCoverState, exportCoverPNG, setPhoto, loadImage };
startCoverStudio();
