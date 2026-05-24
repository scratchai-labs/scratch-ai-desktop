import test from "node:test";
import assert from "node:assert/strict";

import { SessionManager } from "../dist/session-manager.js";
import { StateStore } from "../dist/state-store.js";

function createBridgeServerMock() {
  return {
    handlers: { onPayload: null, onError: null },
    start: async () => {},
    stop: async () => {},
    getBaseUrl: () => "http://127.0.0.1:39000",
    getToken: () => "token",
    setHandlers(onPayload, onError) {
      this.handlers = { onPayload, onError };
    }
  };
}

function createAiConfigMock(overrides = {}) {
  return async (_unused, options = {}) => ({
    configured: Boolean(options.baseUrl && options.accessToken && options.releaseId),
    apiKey: options.accessToken,
    baseUrl: options.baseUrl ?? "",
    model: "server-api",
    timeoutMs: 15000,
    configPath: "desktop-companion.config.json",
    source: "custom",
    customKeyConfigured: Boolean(options.accessToken),
    releaseId: options.releaseId ? Number.parseInt(options.releaseId, 10) : undefined,
    ...overrides
  });
}

function createConfigStoreMock(initialPath = undefined) {
  let scratchExecutablePath = initialPath;
  let serverBaseUrl;
  let serverAccessToken;
  let serverReleaseId;

  return {
    load: async () => ({
      ...(scratchExecutablePath ? { scratchExecutablePath } : {}),
      ...(serverBaseUrl ? { serverBaseUrl } : {}),
      ...(serverAccessToken ? { serverAccessToken } : {}),
      ...(serverReleaseId ? { serverReleaseId } : {})
    }),
    saveScratchExecutablePath: async (value) => {
      scratchExecutablePath = value;
      return {
        ...(scratchExecutablePath ? { scratchExecutablePath } : {}),
        ...(serverBaseUrl ? { serverBaseUrl } : {}),
        ...(serverAccessToken ? { serverAccessToken } : {}),
        ...(serverReleaseId ? { serverReleaseId } : {})
      };
    },
    saveServerConnection: async (value) => {
      serverBaseUrl = value.baseUrl;
      serverAccessToken = value.accessToken;
      serverReleaseId = value.releaseId;
      return {
        ...(scratchExecutablePath ? { scratchExecutablePath } : {}),
        serverBaseUrl,
        serverAccessToken,
        serverReleaseId
      };
    },
    clearServerConnection: async () => {
      serverBaseUrl = undefined;
      serverAccessToken = undefined;
      serverReleaseId = undefined;
      return {
        ...(scratchExecutablePath ? { scratchExecutablePath } : {})
      };
    },
    saveAiHintTriggerMode: async (value) => ({
      ...(scratchExecutablePath ? { scratchExecutablePath } : {}),
      ...(serverBaseUrl ? { serverBaseUrl } : {}),
      ...(serverAccessToken ? { serverAccessToken } : {}),
      ...(serverReleaseId ? { serverReleaseId } : {}),
      aiHintTriggerMode: value
    })
  };
}

function createLinearProjectData(opcodes) {
  const blocks = {};

  for (const [index, opcode] of opcodes.entries()) {
    const id = String.fromCharCode(97 + index);
    const nextId = index < opcodes.length - 1 ? String.fromCharCode(97 + index + 1) : null;
    blocks[id] = {
      opcode,
      next: nextId,
      parent: index === 0 ? null : String.fromCharCode(97 + index - 1),
      inputs: {},
      fields: {},
      shadow: false,
      topLevel: index === 0
    };
  }

  return {
    targets: [
      {
        id: "sprite-a",
        name: "Cat",
        isStage: false,
        blocks
      }
    ]
  };
}

test("SessionManager enters waiting state when Scratch path is not configured", async () => {
  const stateStore = new StateStore();
  const manager = new SessionManager(stateStore, {
    bridgeServer: createBridgeServerMock(),
    platform: "win32",
    log: () => {},
    configStore: createConfigStoreMock(),
    loadAiConfig: createAiConfigMock(),
    scratchLauncher: {},
    scratchRemoteDebugger: {}
  });

  await manager.start();

  const nextState = stateStore.getState();
  assert.equal(nextState.status, "waiting");
  assert.equal(nextState.aiConfigured, false);
  assert.equal(nextState.statusText, "请先选择 Scratch 软件");
});

test("SessionManager saves server connection settings into AI state", async () => {
  const stateStore = new StateStore();
  const manager = new SessionManager(stateStore, {
    bridgeServer: createBridgeServerMock(),
    platform: "win32",
    log: () => {},
    configStore: createConfigStoreMock("C:\\Scratch 3.exe"),
    loadAiConfig: createAiConfigMock(),
    scratchLauncher: {},
    scratchRemoteDebugger: {}
  });

  await manager.start();
  await manager.saveServerConnection({
    baseUrl: "http://127.0.0.1:8000",
    accessToken: "student-token",
    releaseId: "12"
  });

  const nextState = stateStore.getState();
  assert.equal(nextState.aiConfigured, true);
  assert.equal(nextState.aiModel, "server-api");
  assert.equal(nextState.aiCustomKeyConfigured, true);
  assert.equal(nextState.aiCustomModel, "12");
});

test("SessionManager stores server hint results after reading Scratch state", async () => {
  const stateStore = new StateStore();
  const manager = new SessionManager(stateStore, {
    bridgeServer: createBridgeServerMock(),
    platform: "win32",
    log: () => {},
    configStore: createConfigStoreMock("C:\\Scratch 3.exe"),
    loadAiConfig: createAiConfigMock(),
    scratchLauncher: {},
    scratchRemoteDebugger: {},
    coachService: {
      generateHint: async () => ({
        source: "server",
        model: "server-api",
        coachResponse: {
          answerText: "服务端建议先补一个碰撞判断。",
          recommendedBlocks: [],
          nextStep: "先补一个碰撞判断。",
          detectedIssues: []
        }
      })
    }
  });

  await manager.start();
  await manager.saveServerConnection({
    baseUrl: "http://127.0.0.1:8000",
    accessToken: "student-token",
    releaseId: "12"
  });

  manager.handlePayload({
    source: "test",
    currentTargetId: "sprite-a",
    currentTargetName: "Cat",
    toolboxCategories: ["motion"],
    loadedExtensions: [],
    projectData: createLinearProjectData(["event_whenflagclicked", "motion_movesteps"])
  });

  await manager.requestAiHint();

  const nextState = stateStore.getState();
  assert.equal(nextState.aiProvider, "server");
  assert.equal(nextState.aiModel, "server-api");
  assert.equal(nextState.aiCoachResponse?.answerText, "服务端建议先补一个碰撞判断。");
});
