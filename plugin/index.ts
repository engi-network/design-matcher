import fs from "fs";
import path from "path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { StorybookTest } from "./types";
import { joinImages, loadImage, loadRawImage, takeScreenshot } from "./utils";

// const test: StorybookTest = {
//   component: "Button",
//   story: "Primary",
//   args: {
//     variant: "Primary",
//   },
//   design: "plugin/designs/primary-button.png",
// };

export async function toMatchDesign(test: StorybookTest): Promise<any> {
  const ext = path.extname(test.design);
  const filename = path.basename(test.design, ext);

  const storybookFilename = `temp/${filename}-storybook.png`;
  const designFilename = `temp/${filename}-design.png`;
  const diffFilename = `temp/${filename}-diff.png`;
  const designImage = await loadImage(designFilename);
  const { width, height } = designImage;

  await takeScreenshot({
    url: "http://localhost:6006/iframe.html?args=&globals=backgrounds.value:!hex(333333)&id=button--primary&viewMode=story",
    height,
    width,
    path: storybookFilename,
  });

  const diff = new PNG({ width, height });

  pixelmatch(
    (await loadRawImage(storybookFilename)).buffer,
    (await loadRawImage(designFilename)).buffer,
    diff.data,
    width,
    height,
    {
      threshold: 0.1,
    }
  );

  fs.writeFileSync(diffFilename, PNG.sync.write(diff));

  const imageBuffer = await joinImages([
    storybookFilename,
    designFilename,
    diffFilename,
  ]);

  fs.copyFileSync(test.design, designFilename);
  fs.writeFileSync(`temp/${filename}-comp.png`, imageBuffer);

  // TODO: implement pass/fail based on threshold
  const pass = true;

  return {
    pass: pass,
    message: pass
      ? "Expected test not to match design"
      : "Expected test to match design",
  };
}
