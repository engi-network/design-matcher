export type StorybookTest = {
  component: string;
  story: string;
  args?: Record<string, any>;
  design: string;
};

export type DesignMatcherOptions = {
  background?: string;
};
