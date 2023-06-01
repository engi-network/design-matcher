import { StorybookTest } from "../plugin/types";

const mockTest: StorybookTest = {
  component: "Button",
  story: "Primary",
  args: {
    variant: "Primary",
  },
  design: "designs/button--primary.png",
};

test("should match design", async () => {
  await expect(mockTest).toMatchDesign();
});
