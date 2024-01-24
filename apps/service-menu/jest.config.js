module.exports = {
  displayName: "service-menu",
  preset: "../../jest.preset.js",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
  },
  globalSetup: "../../libs/service-sdk/test-provider/setup.ts",
  globalTeardown: "../../libs/service-sdk/test-provider/teardown.ts",
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../../coverage/apps/service-menu",
};
