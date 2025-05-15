/**
 * Basic tests for the WorkerPluginManager
 */

import { afterAll, describe, expect, jest, test } from "@jest/globals";

import { workerPluginManager } from "../plugins/WorkerPluginManagerClient";

describe("WorkerPluginManager", () => {
  // Set a timeout for async tests
  jest.setTimeout(10000);

  // Clean up after tests
  afterAll(() => {
    workerPluginManager.terminate();
  });

  test("should connect to the worker", async () => {
    await expect(workerPluginManager.connect()).resolves.not.toThrow();
  });

  test("should get plugin info for calculator", async () => {
    const info = await workerPluginManager.getPluginInfo("calculator");
    expect(info).not.toBeNull();
    expect(info?.id).toBe("calculator");
  });

  test("should perform calculations correctly", async () => {
    const addResult = await workerPluginManager.calculate(5, 3, "+");
    expect(addResult).toBe(8);

    const subtractResult = await workerPluginManager.calculate(10, 4, "-");
    expect(subtractResult).toBe(6);

    const multiplyResult = await workerPluginManager.calculate(6, 7, "*");
    expect(multiplyResult).toBe(42);

    const divideResult = await workerPluginManager.calculate(20, 5, "/");
    expect(divideResult).toBe(4);
  });
});
