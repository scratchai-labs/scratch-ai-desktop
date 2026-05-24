import test from "node:test";
import assert from "node:assert/strict";

import { CoachService } from "../dist/coach-service.js";

function createAiConfig(overrides = {}) {
  return {
    configured: true,
    apiKey: "student-token",
    baseUrl: "http://127.0.0.1:8000",
    model: "server-api",
    timeoutMs: 15000,
    configPath: "desktop-companion.config.json",
    source: "custom",
    customKeyConfigured: true,
    releaseId: 7,
    ...overrides
  };
}

function createSnapshot() {
  return {
    currentTarget: "Cat",
    currentTargetId: "sprite-cat",
    toolboxCategories: ["运动", "控制"],
    loadedExtensions: [],
    programAreaModules: [
      {
        id: "motion",
        label: "运动",
        blockCount: 1
      }
    ],
    sprites: [
      {
        name: "Cat",
        isStage: false,
        blockCount: 2,
        variables: [],
        scripts: [
          {
            spriteName: "Cat",
            event: "when green flag clicked",
            blockSequence: ["当绿旗被点击", "移动 10 步"],
            blockOpcodes: ["event_whenflagclicked", "motion_movesteps"]
          }
        ]
      }
    ],
    blocks: [
      {
        id: "block-1",
        opcode: "event_whenflagclicked",
        category: "事件",
        label: "当绿旗被点击",
        spriteName: "Cat",
        topLevel: true
      }
    ],
    globalVariables: [],
    detectedConcepts: ["event", "motion"],
    updatedAt: "2026-05-24T12:00:00.000Z"
  };
}

test("CoachService reports progress then requests a server hint", async () => {
  const requests = [];
  const service = new CoachService(async (url, init) => {
    requests.push({
      url,
      method: init.method,
      headers: init.headers,
      body: JSON.parse(init.body)
    });

    if (String(url).endsWith("/progress")) {
      return new Response(JSON.stringify({ id: 1 }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(
      JSON.stringify({
        prompt: "先让小猫碰到边缘时反弹，再观察移动方向。"
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" }
      }
    );
  });

  const result = await service.generateHint({
    snapshot: createSnapshot(),
    currentTargetPrograms: ["当绿旗被点击 -> 移动 10 步"],
    programAreaModules: [
      {
        id: "motion",
        label: "运动",
        blockCount: 1
      }
    ],
    usedExtensions: [],
    loadedExtensions: [],
    aiConfig: createAiConfig()
  });

  assert.equal(result.source, "server");
  assert.equal(result.model, "server-api");
  assert.equal(result.coachResponse.answerText, "先让小猫碰到边缘时反弹，再观察移动方向。");
  assert.equal(result.coachResponse.recommendedBlocks.length > 0, true);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].url, "http://127.0.0.1:8000/api/student/releases/7/progress");
  assert.equal(requests[1].url, "http://127.0.0.1:8000/api/student/releases/7/hints");
  assert.equal(requests[0].headers.Authorization, "Bearer student-token");
  assert.equal(requests[0].body.currentTarget, "Cat");
  assert.equal(typeof requests[0].body.snapshot, "object");
});

test("CoachService falls back when the server connection is not configured", async () => {
  const service = new CoachService(async () => {
    throw new Error("should not request server");
  });

  const result = await service.generateHint({
    snapshot: createSnapshot(),
    currentTargetPrograms: [],
    programAreaModules: [],
    usedExtensions: [],
    loadedExtensions: [],
    aiConfig: createAiConfig({
      configured: false,
      apiKey: undefined,
      customKeyConfigured: false,
      releaseId: undefined
    })
  });

  assert.equal(result.source, "fallback");
  assert.equal(result.model, "local-heuristic");
  assert.equal(result.coachResponse.recommendedBlocks.length > 0, true);
});
