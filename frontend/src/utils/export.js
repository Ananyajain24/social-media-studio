import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Capture a DOM element as PNG blob.
 * scale=6 on a 180×320 reel card → 1080×1920  (exact Instagram resolution)
 * scale=3 on a 300×300 carousel card → 900×900  (near 1080×1080)
 */
async function captureElement(element) {
  await document.fonts.ready;

  // Detect aspect ratio to pick scale
  const { offsetWidth: w, offsetHeight: h } = element;
  const isVertical = h > w;
  const scale = isVertical ? 6 : 3;

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false
  });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
  });
}

export async function exportSlide(element, filename) {
  const blob = await captureElement(element);
  saveAs(blob, filename);
}

export async function exportAllSlides(elements, title = 'output', format = 'carousel') {
  const slug = title.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
  const zip = new JSZip();
  const folder = zip.folder(slug);
  const label = format === 'carousel' ? 'slide' : format === 'reel' ? 'scene' : 'story';

  for (let i = 0; i < elements.length; i++) {
    if (!elements[i]) continue;
    const blob = await captureElement(elements[i]);
    folder.file(`${label}_${String(i + 1).padStart(2, '0')}.png`, blob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `${slug}_${format}.zip`);
}
