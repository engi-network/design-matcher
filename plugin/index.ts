import fs from "fs-extra";
import path from "path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { imageHash } from "image-hash";
import { DesignMatcherOptions, StorybookTest } from "./types";
import {
  hammingDistance,
  joinImages,
  loadImage,
  loadRawImage,
  takeScreenshot,
} from "./utils";

require("dotenv").config();

const TEMP_DIR = process.env.DESIGN_TEMP_DIR ?? "temp";

export async function getImageHash(img: Buffer): Promise<string> {
  return new Promise((resolve, reject) =>
    imageHash({ data: img }, 16, true, (err: any, data: string) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    })
  );
}

export async function toMatchDesign(
  test: StorybookTest,
  options?: DesignMatcherOptions
): Promise<any> {
  // ensure temp dir exists for photos
  fs.ensureDirSync(TEMP_DIR);

  const ext = path.extname(test.design);
  const filename = path.basename(test.design, ext);

  const storybookFilename = `${TEMP_DIR}/${filename}-storybook.png`;
  const designFilename = `${TEMP_DIR}/${filename}-design.png`;
  const diffFilename = `${TEMP_DIR}/${filename}-diff.png`;
  const compFilename = `${TEMP_DIR}/${filename}-comp.png`;

  // copy the original design (we'll read from the copy)
  fs.copyFileSync(test.design, designFilename);

  // load dimensions from provided design file
  const { width, height } = await loadImage(designFilename);

  const sbUrl = `http://localhost:${
    process.env.STORYBOOK_PORT ?? 6006
  }/iframe.html?id=${test.component
    .toLowerCase()
    .replace(" ", "-")}--${test.story
    .toLowerCase()
    .replace(" ", "-")}&viewMode=story`;

  // take screenshot of storybook component
  await takeScreenshot({
    url: sbUrl,
    height,
    width,
    path: storybookFilename,
  });

  // create diff image based on pixel diff
  const diff = new PNG({ width, height });
  pixelmatch(
    (await loadRawImage(storybookFilename)).buffer,
    (await loadRawImage(designFilename, options?.background)).buffer,
    diff.data,
    width,
    height,
    {
      threshold: 0.1,
    }
  );
  fs.writeFileSync(diffFilename, PNG.sync.write(diff));

  // get 16-bit image perceptual hash
  const hash1 = await getImageHash((await loadImage(storybookFilename)).buffer);
  const hash2 = await getImageHash((await loadImage(designFilename)).buffer);

  // calculate diff percentage and pass/fail based on threshold
  // distance is calculated it base 2, meaning 16 bit hex is 256 bits in binary
  const distance = hammingDistance(hash1, hash2);
  const diffPercentage = distance / 256;
  const pass =
    diffPercentage <= parseFloat(process.env.DESIGN_DIFF_THRESHOLD ?? "0.05");

  // join images to create a single comparison image
  const imageBuffer = await joinImages([
    storybookFilename,
    designFilename,
    diffFilename,
  ]);
  fs.writeFileSync(compFilename, imageBuffer);

  return {
    pass: pass,
    message: pass
      ? () =>
          `Expected ${
            test.story
          } not to match design. See ${compFilename}. There is a ${(
            diffPercentage * 100
          ).toFixed(2)}% difference.\n${sbUrl}`
      : () =>
          `Expected ${
            test.story
          } to match design. See ${compFilename}. There is a ${(
            diffPercentage * 100
          ).toFixed(2)}% difference.\n${sbUrl}`,
  };
}
