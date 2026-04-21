import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Capture a DOM element as PNG. Returns a Blob.
export async function captureElement(element) {
  // Wait for fonts to be ready
  await document.fonts.ready;

  const canvas = await html2canvas(element, {
    scale: 3,           // 300px preview × 3 = 900px output (close to 1080)
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false
  });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
  });
}

// Export a single slide as PNG download
export async function exportSlide(element, filename) {
  const blob = await captureElement(element);
  saveAs(blob, filename);
}

// Export all slides as a ZIP archive
export async function exportAllSlides(elements, carouselTitle = 'carousel') {
  const slug = carouselTitle.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
  const zip = new JSZip();
  const folder = zip.folder(slug);

  for (let i = 0; i < elements.length; i++) {
    if (!elements[i]) continue;
    const blob = await captureElement(elements[i]);
    folder.file(`slide_${String(i + 1).padStart(2, '0')}.png`, blob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `${slug}_carousel.zip`);
}
