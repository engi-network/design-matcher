# Design Test

This is a test jest plugin for comparing storybook stories with design images.

## Running

1. Install `design-matcher`

   ```
   npm install @engi.network/design-matcher
   ```

2. Modify your `./storybook/preview.ts` file to remove padding around the component.

   ```typescript
   const preview: Preview = {
     parameters: {
       ...
       // remove default padding around components
       layout: "fullscreen",
     },
   };
   ```

3. Start Storybook in your repository

   ```
   npm run storybook
   ```

4. Set `STORYBOOK_PORT` environment variable for port that storybook is running on.

   ```
   STORYBOOK_PORT=6006

   // optionally specify the diff threshold and the temp dir
   DESIGN_DIFF_THRESHOLD=0.05
   DESIGN_TEMP_DIR=temp
   ```

5. Create a `jest.setup.ts` file for extending the custom matchers to use `.toMatchDesign()`. If using `create-react-app`, you can optionally use the `setupTests.ts` file instead. Also use `dotenv` to load environment variables.

   ```typescript
   import "@testing-library/jest-dom";
   import { toMatchDesign } from "./plugin";
   import { toMatchDesign } from "@engi.network/design-matcher";
   import dotenv from "dotenv";
   dotenv.config();
   // optionally specify a file other than .env
   // dotenv.config({ path: "./.env.development.local" });

   expect.extend({ toMatchDesign });
   ```

6. Update your `jest.config.js` to run the setup file.

   ```javascript
   /** @type {import('ts-jest').JestConfigWithTsJest} */
   module.exports = {
     roots: ["<rootDir>"],
     preset: "ts-jest",
     testEnvironment: "node",
     setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
   };
   ```

7. If using TypeScript, include `files` in your `tsconfig.json`.

   ```json
      {
      "compilerOptions": {
         ...
      },
      "exclude": ["node_modules"],
      "files": ["node_modules/@engi.network/design-matcher/plugin/types/jest.d.ts"]
      }
   ```

8. Write a test using the `toMatchDesign()` custom matcher.

   ```typescript
   import { StorybookTest } from "../plugin/types";

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
     await expect(mockTest).toMatchDesign({ backgroud: '#000000' });
   });
   ```

9. Run `npm test`.

   ```
   npm test
   ```
