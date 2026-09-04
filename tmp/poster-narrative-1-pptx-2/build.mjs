import fs from 'node:fs/promises';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const sourcePng = '/Users/steinv/Uni-Trier/Trends-In-ML-2/output/poster-narrative-1/site/poster.png';
const outputPptx = '/Users/steinv/Uni-Trier/Trends-In-ML-2/output/poster-narrative-1/pptx-2/poster.pptx';
const previewPng = '/Users/steinv/Uni-Trier/Trends-In-ML-2/tmp/poster-narrative-1-pptx-2/artifact-preview.png';
const layoutJson = '/Users/steinv/Uni-Trier/Trends-In-ML-2/tmp/poster-narrative-1-pptx-2/layout.json';
const inspectNdjson = '/Users/steinv/Uni-Trier/Trends-In-ML-2/tmp/poster-narrative-1-pptx-2/inspect.ndjson';

const slideWidth = (841 / 25.4) * 96;
const slideHeight = (594 / 25.4) * 96;

async function writeBlob(path, blob) {
  await fs.writeFile(path, new Uint8Array(await blob.arrayBuffer()));
}

async function main() {
  const sourceBytes = await fs.readFile(sourcePng);
  const sourceArrayBuffer = sourceBytes.buffer.slice(
    sourceBytes.byteOffset,
    sourceBytes.byteOffset + sourceBytes.byteLength,
  );

  const presentation = Presentation.create({
    slideSize: { width: slideWidth, height: slideHeight },
  });

  const slide = presentation.slides.add();
  slide.background.fill = '#f3efe6';

  slide.images.add({
    blob: sourceArrayBuffer,
    contentType: 'image/png',
    alt: 'Research poster titled Correct Answers, Uneven Grounding',
    fit: 'contain',
    position: { left: 0, top: 0, width: slideWidth, height: slideHeight },
  });

  await writeBlob(
    previewPng,
    await presentation.export({ slide, format: 'png', scale: 1 }),
  );

  const layout = await slide.export({ format: 'layout' });
  await fs.writeFile(layoutJson, await layout.text());

  const inspection = await presentation.inspect({
    kind: 'slide,image',
    maxChars: 5000,
  });
  await fs.writeFile(inspectNdjson, inspection.ndjson);

  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(outputPptx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
