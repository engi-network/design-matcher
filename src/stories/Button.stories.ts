import type { Meta, StoryObj } from "@storybook/react";

import Button from "../components/Button";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Button",
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Button",
    className:
      "flex items-center justify-center w-[105px] h-[48px] font-['Helvetica_Neue']",
  },
};

export const Default: Story = {
  args: {
    variant: "default",
    children: "Button",
  },
};
