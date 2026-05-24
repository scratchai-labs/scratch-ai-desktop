import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { normalizeAiHintTriggerMode } from "../common/types";

const CONFIG_FILE_NAME = "desktop-companion.config.json";

export class ScratchExecutableConfigStore {
  private readonly filePath: string;

  constructor(baseDir: string) {
    this.filePath = path.join(baseDir, CONFIG_FILE_NAME);
  }

  async load() {
    const parsed = await this.readParsedConfig();
    const nextConfig: {
      scratchExecutablePath?: string;
      serverBaseUrl?: string;
      serverAccessToken?: string;
      serverReleaseId?: string;
      aiHintTriggerMode?: "auto" | "manual";
    } = {};

    if (typeof parsed.scratchExecutablePath === "string" && parsed.scratchExecutablePath.trim()) {
      nextConfig.scratchExecutablePath = parsed.scratchExecutablePath.trim();
    }

    if (typeof parsed.serverBaseUrl === "string" && parsed.serverBaseUrl.trim()) {
      nextConfig.serverBaseUrl = parsed.serverBaseUrl.trim().replace(/\/+$/, "");
    }

    if (typeof parsed.serverAccessToken === "string" && parsed.serverAccessToken.trim()) {
      nextConfig.serverAccessToken = parsed.serverAccessToken.trim();
    }

    if (typeof parsed.serverReleaseId === "string" && parsed.serverReleaseId.trim()) {
      nextConfig.serverReleaseId = parsed.serverReleaseId.trim();
    }

    nextConfig.aiHintTriggerMode = normalizeAiHintTriggerMode(parsed.aiHintTriggerMode);

    return nextConfig;
  }

  async saveScratchExecutablePath(scratchExecutablePath: string) {
    const currentConfig = await this.load();
    const nextConfig = {
      ...currentConfig,
      scratchExecutablePath: scratchExecutablePath.trim()
    };

    await this.writeConfig(nextConfig);
    return nextConfig;
  }

  async saveServerConnection(serverConnection: {
    baseUrl: string;
    accessToken: string;
    releaseId: string;
  }) {
    const currentConfig = await this.load();
    const nextConfig = {
      ...currentConfig,
      serverBaseUrl: serverConnection.baseUrl.trim().replace(/\/+$/, ""),
      serverAccessToken: serverConnection.accessToken.trim(),
      serverReleaseId: serverConnection.releaseId.trim()
    };

    await this.writeConfig(nextConfig);
    return nextConfig;
  }

  async clearServerConnection() {
    const currentConfig = await this.load();
    const nextConfig = {
      ...currentConfig
    };

    delete nextConfig.serverBaseUrl;
    delete nextConfig.serverAccessToken;
    delete nextConfig.serverReleaseId;

    await this.writeConfig(nextConfig);
    return nextConfig;
  }

  async saveAiHintTriggerMode(aiHintTriggerMode: "auto" | "manual") {
    const currentConfig = await this.load();
    const nextConfig = {
      ...currentConfig,
      aiHintTriggerMode: normalizeAiHintTriggerMode(aiHintTriggerMode)
    };

    await this.writeConfig(nextConfig);
    return nextConfig;
  }

  private async readParsedConfig() {
    try {
      const rawConfig = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(rawConfig);

      if (!parsed || typeof parsed !== "object") {
        return {} as Record<string, unknown>;
      }

      return parsed as Record<string, unknown>;
    } catch {
      return {} as Record<string, unknown>;
    }
  }

  private async writeConfig(nextConfig: Record<string, unknown>) {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(nextConfig, null, 2), "utf8");
  }
}
