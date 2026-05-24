import { contextBridge, ipcRenderer } from "electron";

const api = {
  getInitialState: async () => ipcRenderer.invoke("desktop-companion:get-state"),
  onStateChange: (listener: (state: unknown) => void) => {
    const wrapped = (_event: Electron.IpcRendererEvent, state: unknown) => {
      listener(state);
    };

    ipcRenderer.on("desktop-companion:state", wrapped);
    return () => {
      ipcRenderer.off("desktop-companion:state", wrapped);
    };
  },
  retryNow: async () => {
    await ipcRenderer.invoke("desktop-companion:retry");
  },
  chooseScratchExecutable: async () =>
    ipcRenderer.invoke("desktop-companion:choose-scratch-executable"),
  launchScratch: async () => {
    await ipcRenderer.invoke("desktop-companion:launch-scratch");
  },
  openSettings: async () => {
    await ipcRenderer.invoke("desktop-companion:open-settings");
  },
  requestAiHint: async (goal?: string) => {
    await ipcRenderer.invoke("desktop-companion:request-ai-hint", goal);
  },
  saveServerConnection: async (config: { baseUrl: string; accessToken: string; releaseId: string }) => {
    await ipcRenderer.invoke("desktop-companion:save-server-connection", config);
  },
  clearServerConnection: async () => {
    await ipcRenderer.invoke("desktop-companion:clear-server-connection");
  },
  saveAiHintTriggerMode: async (mode: "auto" | "manual") => {
    await ipcRenderer.invoke("desktop-companion:save-ai-hint-trigger-mode", mode);
  }
};

contextBridge.exposeInMainWorld("desktopCompanionApi", api);
