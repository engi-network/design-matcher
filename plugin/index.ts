import fs from "fs-extra";
import path from "path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { StorybookTest } from "./types";
import { joinImages, loadImage, loadRawImage, takeScreenshot } from "./utils";
require("dotenv").config();

// If there are more than this percentage different pixels, fail the test
const DIFF_THRESHOLD = 0.1;
const TEMP_DIR = "temp";

export async function toMatchDesign(test: StorybookTest): Promise<any> {
  // ensure temp dir exists for photos
  fs.ensureDirSync(TEMP_DIR);

  const ext = path.extname(test.design);
  const filename = path.basename(test.design, ext);

  const storybookFilename = `${TEMP_DIR}/${filename}-storybook.png`;
  const designFilename = `${TEMP_DIR}/${filename}-design.png`;
  const diffFilename = `${TEMP_DIR}/${filename}-diff.png`;
  const compFilename = `${TEMP_DIR}/${filename}-comp.png`;

  // load dimensions from provided design file
  const { width, height } = await loadImage(test.design);

  const sbUrl = `http://localhost:${
    process.env.STORYBOOK_PORT ?? 6006
  }/iframe.html?id=${test.component.toLowerCase()}--${test.story.toLowerCase()}&viewMode=story`;

  // take screenshot of storybook component
  await takeScreenshot({
    url: sbUrl,
    height,
    width,
    path: storybookFilename,
  });

  // create diff image based on pixel diff
  const diff = new PNG({ width, height });
  const pixelDiff = pixelmatch(
    (await loadRawImage(storybookFilename)).buffer,
    (await loadRawImage(test.design)).buffer,
    diff.data,
    width,
    height,
    {
      threshold: 0.1,
    }
  );
  fs.writeFileSync(diffFilename, PNG.sync.write(diff));

  // calculate diff percentage and pass/fail based on threshold
  const pixelCount = width * height;
  const pass = pixelDiff / pixelCount <= DIFF_THRESHOLD;

  // join images to create a single comparison image
  const imageBuffer = await joinImages([
    storybookFilename,
    test.design,
    diffFilename,
  ]);

  // place all image files in same directory for debugging/viewing
  fs.copyFileSync(test.design, designFilename);
  fs.writeFileSync(compFilename, imageBuffer);

  return {
    pass: pass,
    message: pass
      ? () => `Expected ${test.story} not to match design. See ${compFilename}`
      : () => `Expected ${test.story} to match design. See ${compFilename}`,
  };
}
