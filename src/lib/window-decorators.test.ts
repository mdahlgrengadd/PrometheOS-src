import { getDecorator, getDecoratorFromConfig } from "./window-decorators";

describe("getDecoratorFromConfig", () => {
  it("returns the external decorator when valid", () => {
    const fakeExternal = {
      Header: () => null,
      Controls: () => null,
      borderRadius: 8,
    };
    const decorator = getDecoratorFromConfig("win7", {
      decoratorModule: fakeExternal,
    } as any);
    expect(decorator.Header).toBe(fakeExternal.Header);
    expect(decorator.Controls).toBe(fakeExternal.Controls);
    expect(decorator.borderRadius).toBe(fakeExternal.borderRadius);
  });

  it("falls back to built-in decorator when external is invalid", () => {
    // Invalid because missing Controls or wrong types
    const invalidExternal = { Header: 123 } as any;
    const fallback = getDecoratorFromConfig("light", {
      decoratorModule: invalidExternal,
    } as any);
    const builtIn = getDecorator("light");
    expect(fallback).toEqual(builtIn);
  });
});
