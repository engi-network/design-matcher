import type { Preview } from "@storybook/react";
import "!style-loader!css-loader!postcss-loader!tailwindcss/tailwind.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: "dark",
      values: [
        {
          name: "dark",
          value: "#000",
        },
      ],
    },
    // remove default padding around components
    layout: "fullscreen",
  },
};

export default preview;
