# Design Matcher

This is a jest plugin for comparing storybook stories with design images.

## Setup

1. Install `design-matcher` and `jest` dependencies.

   ```
   npm install @engi.network/design-matcher jest ts-jest @types/jest
   ```

2. Add `test` script to your `package.json`.

   ```json
   "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "next lint",
      "test": "jest"
   },
   ```

3. Add the type declarations file to `files` in `tsconfig.json`.

   ```json
   {
     "compilerOptions": {
       // ...
     },
     "exclude": ["node_modules"],
     "files": [
       "node_modules/@engi.network/design-matcher/src/index.d.ts"
     ]
   }
   ```

4. Create a `jest.setup.ts` file for extending the custom matchers to use `.toMatchDesign()`. Also use `dotenv` to load environment variables.

   ```typescript
   import { toMatchDesign } from "@engi.network/design-matcher";
   import dotenv from "dotenv";

   dotenv.config();
   // optionally specify a file other than .env
   // dotenv.config({ path: "./.env.development.local" });

   expect.extend({ toMatchDesign });
   ```

5. Update your `jest.config.js` to run the setup file.

   ```javascript
   module.exports = {
     roots: ["<rootDir>"],
     preset: "ts-jest",
     testEnvironment: "node",
     setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
   };
   ```

6. Install [Storybook](https://storybook.js.org/docs/react/get-started/install/).

7. Modify your `./storybook/preview.ts` file to remove padding around the component. This is needed as `puppeteer` will launch an instance of `chromium` and take a screenshot with the exact dimensions of the design image.

   ```typescript
   const preview: Preview = {
     parameters: {
       ...
       // remove default padding around components
       layout: "fullscreen",
     },
   };
   ```

8. Set `STORYBOOK_PORT` environment variable for port that storybook is running on.

   ```
   STORYBOOK_PORT=6006

   // optionally specify the diff threshold and the temp dir
   DESIGN_DIFF_THRESHOLD=0.05
   DESIGN_TEMP_DIR=temp
   ```

## Writing tests

Write a test using the `toMatchDesign()` custom matcher.

```typescript
import { StorybookTest } from "@engi.network/design-matcher/plugin/types";

const mockTest: StorybookTest = {
  component: "Button",
  story: "Primary",
  args: {
    variant: "Primary",
  },
  design: "plugin/designs/primary-button.png",
};

test("should match design", async () => {
  await expect(mockTest).toMatchDesign();
});

// Optionally, specify a background color for the design image if it is transparent
test("should match design", async () => {
  await expect(mockTest).toMatchDesign({ backgroud: "#000000" });
});
```

## Running

1. Start Storybook in your repository.

   ```
   npm run storybook
   ```

2. Run `npm test`.

   ```
   npm test
   ```
