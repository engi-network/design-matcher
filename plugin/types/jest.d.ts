/* eslint-disable @typescript-eslint/no-empty-interface */
export {};

interface CustomMatchers<R = unknown> {
  toMatchDesign(): R;
}

declare global {
  namespace jest {
    interface Expect extends CustomMatchers {}
    interface Matchers<R> extends CustomMatchers<R> {}
    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}
