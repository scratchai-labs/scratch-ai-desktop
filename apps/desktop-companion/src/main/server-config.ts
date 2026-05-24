const DEFAULT_SERVER_TIMEOUT_MS = 15_000;
const DEFAULT_SERVER_MODEL = "server-api";

export interface LoadedServerConfig {
  configured: boolean;
  apiKey?: string;
  baseUrl: string;
  model: string;
  timeoutMs: number;
  configPath: string;
  source?: "custom";
  customKeyConfigured: boolean;
  releaseId?: number;
}

interface LoadServerConfigOptions {
  baseUrl?: string;
  accessToken?: string;
  releaseId?: string;
  configPath?: string;
}

function normalizeBaseUrl(value: unknown) {
  const candidate = typeof value === "string" ? value.trim().replace(/\/+$/, "") : "";
  return candidate;
}

function normalizeReleaseId(value: unknown) {
  const candidate = typeof value === "string" ? value.trim() : "";
  if (!candidate) {
    return undefined;
  }

  const parsed = Number.parseInt(candidate, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

export async function loadServerConfig(
  _configPath?: string,
  options: LoadServerConfigOptions = {}
): Promise<LoadedServerConfig> {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const apiKey = typeof options.accessToken === "string" ? options.accessToken.trim() : "";
  const releaseId = normalizeReleaseId(options.releaseId);
  const configured = Boolean(baseUrl && apiKey && releaseId);

  return {
    configured,
    baseUrl,
    model: DEFAULT_SERVER_MODEL,
    timeoutMs: DEFAULT_SERVER_TIMEOUT_MS,
    configPath: options.configPath ?? "desktop-companion.config.json",
    customKeyConfigured: Boolean(apiKey),
    releaseId,
    ...(configured ? { apiKey, source: "custom" as const } : {})
  };
}
