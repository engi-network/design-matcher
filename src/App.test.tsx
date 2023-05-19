import { StorybookTest } from "../plugin/types";

const mockTest: StorybookTest = {
  component: "Button",
  story: "Primary",
  args: {
    variant: "Primary",
  },
  design: "plugin/designs/primary-button.png",
};

test("should match design", () => {
  expect(mockTest).toMatchDesign();
});
