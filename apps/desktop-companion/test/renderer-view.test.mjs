import test from "node:test";
import assert from "node:assert/strict";

import {
  formatAiConfigSummary,
  formatAiStatus
} from "../dist/renderer-view.js";

test("formats server-backed AI status", () => {
  assert.equal(
    formatAiStatus({
      aiStatus: "ready",
      aiProvider: "server",
      aiModel: "server-api",
      aiLastUpdatedAt: "2026-05-24T12:00:00.000Z",
      aiConfigured: true,
      aiCustomKeyConfigured: true,
      aiCustomModelConfigured: true,
      aiHintTriggerMode: "auto",
      status: "connected",
      statusText: "已连接到 Scratch Desktop",
      toolboxCategories: [],
      usedExtensions: [],
      loadedExtensions: [],
      programAreaModules: [],
      currentTargetPrograms: [],
      currentTargetScriptBlocks: [],
      currentTargetScriptXmlList: [],
      aiCoachResponse: {
        answerText: "先补一个碰撞判断。",
        recommendedBlocks: [],
        nextStep: "先补一个碰撞判断。",
        detectedIssues: []
      }
    }),
    "当前提示来源：服务器（server-api），生成时间：" +
      new Date("2026-05-24T12:00:00.000Z").toLocaleString()
  );
});

test("formats unconfigured network guidance", () => {
  assert.equal(
    formatAiStatus({
      aiStatus: "idle",
      aiConfigured: false,
      aiCustomKeyConfigured: false,
      aiCustomModelConfigured: false,
      aiHintTriggerMode: "manual",
      status: "waiting",
      statusText: "请先选择 Scratch 软件",
      toolboxCategories: [],
      usedExtensions: [],
      loadedExtensions: [],
      programAreaModules: [],
      currentTargetPrograms: [],
      currentTargetScriptBlocks: [],
      currentTargetScriptXmlList: []
    }),
    "还没配置联机参数也可以先用。点击“生成下一步提示”后，程序会先给基础提示；需要更完整结果时，再到“联机设置”里保存服务器配置。"
  );
});

test("formats server config summary", () => {
  assert.equal(
    formatAiConfigSummary({
      aiConfigSource: "custom",
      aiConfigured: true,
      aiCustomKeyConfigured: true,
      aiCustomModelConfigured: true,
      aiHintTriggerMode: "auto",
      aiStatus: "idle",
      status: "waiting",
      statusText: "请先选择 Scratch 软件",
      toolboxCategories: [],
      usedExtensions: [],
      loadedExtensions: [],
      programAreaModules: [],
      currentTargetPrograms: [],
      currentTargetScriptBlocks: [],
      currentTargetScriptXmlList: []
    }),
    "当前使用本机保存的服务器配置。"
  );
});
