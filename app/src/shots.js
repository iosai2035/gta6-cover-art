// Fixed scenes for screenshots: ?shot=cover shows the cover alone at full
// viewport, ?shot=editor shows the editor with a photo loaded. The query
// names the sample photo, caption, layout, grade, size and caption
// placement, so every screenshot is reproducible. window.__shotReady is
// set once the fonts are in and the cover has painted.
export async function runShot(shot, query, app) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const photo = query.get('photo') ?? 'pier';
  const patch = {
    caption: query.get('caption') ?? 'Sunset Heist',
    layout: query.get('layout') ?? 'classic',
    grade: query.get('grade') ?? 'vice',
    size: query.get('size') ?? 'portrait',
    captionStyle: query.get('style') ?? 'block',
    captionPlace: query.get('place') ?? 'banner',
    halftone: query.get('halftone') !== 'off',
    dotSpacing: Number(query.get('dots') ?? 9),
    wanted: Number(query.get('wanted') ?? 5),
    footerText: query.get('footer') ?? 'VICE CITY • LEONIDA',
  };
  app.applyCoverState(patch);
  await app.setPhoto(await app.loadImage(`samples/${photo}.jpg`), photo);
  // Re-apply the framing after setPhoto resets it, for a fixed composition.
  if (query.get('pan')) {
    const [px, py] = query.get('pan').split(',').map(Number);
    app.applyCoverState({ panX: px, panY: py, zoom: Number(query.get('zoom') ?? 1) });
  }
  await document.fonts.ready;
  app.renderCover();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
