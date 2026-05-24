import { desktopCompanionStateSchema } from "@scratch-ai/shared";

import { normalizeAiHintTriggerMode } from "../common/types";
import type { DesktopCompanionApi } from "../common/desktop-companion-api";
import type { DesktopCompanionState } from "../common/types";

declare global {
  interface Window {
    desktopCompanionApi?: DesktopCompanionApi;
  }
}

const statusElement = document.getElementById("settings-status");
const serverBaseUrlInput = document.getElementById("settings-server-base-url") as HTMLInputElement | null;
const serverAccessTokenInput = document.getElementById("settings-server-access-token") as HTMLInputElement | null;
const serverReleaseIdInput = document.getElementById("settings-server-release-id") as HTMLInputElement | null;
const saveServerConnectionButton = document.getElementById(
  "settings-save-server-connection-button"
) as HTMLButtonElement | null;
const clearServerConnectionButton = document.getElementById(
  "settings-clear-server-connection-button"
) as HTMLButtonElement | null;
const aiHintTriggerModeSelect = document.getElementById(
  "settings-ai-hint-trigger-mode"
) as HTMLSelectElement | null;
const saveAiHintTriggerModeButton = document.getElementById(
  "settings-save-ai-hint-trigger-mode-button"
) as HTMLButtonElement | null;
const errorElement = document.getElementById("settings-error");
const feedbackElement = document.getElementById("settings-feedback");

function getDesktopCompanionApi() {
  if (!window.desktopCompanionApi) {
    throw new Error("预加载脚本没有就绪，请退出旧实例后重新打开设置窗口。");
  }
  return window.desktopCompanionApi;
}

function showMessage(message: string, kind: "error" | "success") {
  if (feedbackElement) {
    feedbackElement.textContent = message;
    feedbackElement.dataset.kind = kind;
    feedbackElement.hidden = false;
  }

  if (errorElement) {
    errorElement.textContent = kind === "error" ? message : "";
    errorElement.hidden = kind !== "error";
  }
}

function clearError() {
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.hidden = true;
  }
}

function normalizeState(rawState: unknown): DesktopCompanionState {
  return desktopCompanionStateSchema.parse(rawState);
}

function renderState(state: DesktopCompanionState) {
  if (statusElement) {
    if (state.aiConfigured) {
      statusElement.textContent = "已保存完整联机配置";
    } else if (state.aiCustomKeyConfigured || state.aiCustomModelConfigured) {
      statusElement.textContent = "联机配置还不完整";
    } else {
      statusElement.textContent = "当前还没有保存联机配置";
    }
  }

  const disabled = state.aiStatus === "loading";
  if (serverBaseUrlInput) {
    serverBaseUrlInput.disabled = disabled;
  }
  if (serverAccessTokenInput) {
    serverAccessTokenInput.disabled = disabled;
  }
  if (serverReleaseIdInput) {
    serverReleaseIdInput.disabled = disabled;
  }
  if (saveServerConnectionButton) {
    saveServerConnectionButton.disabled = disabled;
  }
  if (clearServerConnectionButton) {
    clearServerConnectionButton.disabled = disabled && !state.aiConfigured;
  }
  if (aiHintTriggerModeSelect) {
    aiHintTriggerModeSelect.disabled = disabled;
    aiHintTriggerModeSelect.value = normalizeAiHintTriggerMode(state.aiHintTriggerMode);
  }
  if (saveAiHintTriggerModeButton) {
    saveAiHintTriggerModeButton.disabled = disabled;
  }
}

saveServerConnectionButton?.addEventListener("click", () => {
  saveServerConnectionButton.disabled = true;
  const baseUrl = serverBaseUrlInput?.value?.trim() ?? "";
  const accessToken = serverAccessTokenInput?.value?.trim() ?? "";
  const releaseId = serverReleaseIdInput?.value?.trim() ?? "";

  void Promise.resolve()
    .then(() => {
      clearError();
      if (!baseUrl) {
        throw new Error("请先输入服务器地址。");
      }
      if (!accessToken) {
        throw new Error("请先输入学生 Token。");
      }
      if (!/^\d+$/.test(releaseId) || Number.parseInt(releaseId, 10) <= 0) {
        throw new Error("Release ID 必须是正整数。");
      }

      return getDesktopCompanionApi().saveServerConnection({
        baseUrl,
        accessToken,
        releaseId
      });
    })
    .then(() => {
      if (serverAccessTokenInput) {
        serverAccessTokenInput.value = "";
      }
      showMessage("已保存联机配置。", "success");
    })
    .catch((error) => {
      showMessage(error instanceof Error ? error.message : "保存联机配置失败，请查看日志。", "error");
    })
    .finally(() => {
      window.setTimeout(() => {
        if (saveServerConnectionButton) {
          saveServerConnectionButton.disabled = false;
        }
      }, 400);
    });
});

clearServerConnectionButton?.addEventListener("click", () => {
  clearServerConnectionButton.disabled = true;

  void Promise.resolve()
    .then(() => {
      clearError();
      return getDesktopCompanionApi().clearServerConnection();
    })
    .then(() => {
      if (serverBaseUrlInput) {
        serverBaseUrlInput.value = "";
      }
      if (serverAccessTokenInput) {
        serverAccessTokenInput.value = "";
      }
      if (serverReleaseIdInput) {
        serverReleaseIdInput.value = "";
      }
      showMessage("已清除联机配置，后续会自动使用基础提示。", "success");
    })
    .catch((error) => {
      showMessage(error instanceof Error ? error.message : "清除联机配置失败，请查看日志。", "error");
    })
    .finally(() => {
      window.setTimeout(() => {
        if (clearServerConnectionButton) {
          clearServerConnectionButton.disabled = false;
        }
      }, 400);
    });
});

saveAiHintTriggerModeButton?.addEventListener("click", () => {
  saveAiHintTriggerModeButton.disabled = true;
  const mode = normalizeAiHintTriggerMode(aiHintTriggerModeSelect?.value);
  const modeLabel = mode === "manual" ? "手动点击" : "自动刷新";

  void Promise.resolve()
    .then(() => {
      clearError();
      return getDesktopCompanionApi().saveAiHintTriggerMode(mode);
    })
    .then(() => {
      showMessage(`已保存下一步提示触发方式：${modeLabel}。`, "success");
    })
    .catch((error) => {
      showMessage(error instanceof Error ? error.message : "保存下一步提示触发方式失败，请查看日志。", "error");
    })
    .finally(() => {
      window.setTimeout(() => {
        if (saveAiHintTriggerModeButton) {
          saveAiHintTriggerModeButton.disabled = false;
        }
      }, 400);
    });
});

void Promise.resolve()
  .then(() => getDesktopCompanionApi().getInitialState())
  .then((rawState) => {
    renderState(normalizeState(rawState));
  })
  .catch((error) => {
    showMessage(error instanceof Error ? error.message : "设置窗口初始化失败，请重试。", "error");
  });

try {
  getDesktopCompanionApi().onStateChange((rawState) => {
    renderState(normalizeState(rawState));
  });
} catch (error) {
  showMessage(error instanceof Error ? error.message : "设置窗口状态监听失败，请重试。", "error");
}
