import puppeteer from "puppeteer";
import sharp, { OverlayOptions } from "sharp";

type ImageData = {
  width: number;
  height: number;
  buffer: Buffer;
};

const HORIZONTAL_GAP = 20;
const PADDING_X = 20;
const PADDING_Y = 20;
const LABEL_MARGIN_BOTTOM = 10;

export async function joinImages(filenames: string[]): Promise<Buffer> {
  const storybookLabelImage = await loadImage(
    "plugin/assets/label-storybook.png"
  );
  const designLabelImage = await loadImage("plugin/assets/label-design.png");
  const diffLabelImage = await loadImage("plugin/assets/label-diff.png");
  const images = await Promise.all(filenames.map(loadImage));
  let totalWidth = PADDING_X * 2 + (images.length - 1) * HORIZONTAL_GAP;
  let totalHeight =
    PADDING_Y * 2 + storybookLabelImage.height + LABEL_MARGIN_BOTTOM;

  // horizontal join
  for (let i = 0; i < images.length; i++) {
    totalWidth += images[i].width;
    totalHeight = Math.max(totalHeight, images[i].height);
    totalHeight += storybookLabelImage.height;
  }

  const comparisonImage = sharp({
    create: {
      width: totalWidth,
      height: totalHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0.0 },
    },
  });

  const backgroundImage = await sharp("plugin/assets/bg.png")
    .resize({
      width: totalWidth,
      height: totalHeight,
      fit: sharp.fit.cover,
    })
    .toBuffer();

  comparisonImage.composite([
    {
      input: backgroundImage,
      left: 0,
      top: 0,
    },
    ...getCompositeImages(
      images,
      storybookLabelImage,
      designLabelImage,
      diffLabelImage
    ),
  ]);
  return comparisonImage.png().toBuffer();
}

export async function loadImage(filename: string): Promise<ImageData> {
  const image = await sharp(filename);
  const { width = 200, height = 200 } = await image.metadata();

  return {
    width,
    height,
    buffer: await image.toBuffer(),
  };
}

export async function loadRawImage(filename: string): Promise<ImageData> {
  const image = await sharp(filename);
  const { width = 200, height = 200 } = await image.metadata();

  return {
    width,
    height,
    buffer: await image.ensureAlpha().raw().toBuffer(),
  };
}

function getCompositeImages(
  images: ImageData[],
  storybookLabelImage: ImageData,
  designLabelImage: ImageData,
  diffLabelImage: ImageData
) {
  const compositeImages: OverlayOptions[] = [];

  let offsetX = PADDING_X;
  let offsetY = PADDING_Y + storybookLabelImage.height + LABEL_MARGIN_BOTTOM;

  for (let i = 0; i < images.length; i++) {
    compositeImages.push({
      input: images[i].buffer,
      left: offsetX,
      top: offsetY,
    });

    // storybook image
    if (i === 0) {
      compositeImages.push({
        input: storybookLabelImage.buffer,
        left:
          offsetX +
          Math.floor(images[i].width / 2 - storybookLabelImage.width / 2),
        top: PADDING_Y,
      });
    } else if (i === 1) {
      compositeImages.push({
        input: designLabelImage.buffer,
        left:
          offsetX +
          Math.floor(images[i].width / 2 - designLabelImage.width / 2),
        top: PADDING_Y,
      });
    } else if (i === 2) {
      compositeImages.push({
        input: diffLabelImage.buffer,
        left:
          offsetX + Math.floor(images[i].width / 2 - diffLabelImage.width / 2),
        top: PADDING_Y,
      });
    }

    offsetX += images[i].width + HORIZONTAL_GAP;
  }

  return compositeImages;
}

export async function takeScreenshot({
  url,
  width,
  height,
  path,
}: {
  url: string;
  width: number;
  height: number;
  path: string;
}) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  await page.goto(url, { waitUntil: "networkidle2" });
  await page.screenshot({
    path,
    omitBackground: true,
  });
  await browser.close();
}