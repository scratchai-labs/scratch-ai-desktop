export interface DesktopCompanionApi {
  getInitialState: () => Promise<unknown>;
  onStateChange: (listener: (state: unknown) => void) => () => void;
  retryNow: () => Promise<void>;
  chooseScratchExecutable: () => Promise<string | null>;
  launchScratch: () => Promise<void>;
  openSettings: () => Promise<void>;
  requestAiHint: (goal?: string) => Promise<void>;
  saveServerConnection: (config: { baseUrl: string; accessToken: string; releaseId: string }) => Promise<void>;
  clearServerConnection: () => Promise<void>;
  saveAiHintTriggerMode: (mode: "auto" | "manual") => Promise<void>;
}
