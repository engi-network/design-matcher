# Design Test

This is a test jest plugin for comparing storybook stories with design images.

## Running

1. Start demo repo
    ```
    // Install dependencies
    npm install
    // Run storybook
    npm run storybook -p STORYBOOK_PORT
    ```

2. Set `STORYBOOK_PORT` environment variable for port that storybook is running on.

3. Create a `jest.setup.ts` file for extending the custom matchers to use `.toMatchDesign()`.
    ```typescript
    import "@testing-library/jest-dom";
    import { toMatchDesign } from "./plugin";

    expect.extend({ toMatchDesign });
    ```

4. Update your `jest.config.js` to run the setup file.
    ```javascript
    /** @type {import('ts-jest').JestConfigWithTsJest} */
    module.exports = {
      roots: ["<rootDir>"],
      preset: "ts-jest",
      testEnvironment: "node",
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    };
    ```

5. Write a test using the `toMatchDesign()` custom matcher.
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
    ```

5. Run `npm test`
    ```
    npm test
    ```
