import { Agent } from "undici";

type Primitive = string | number | boolean;

interface DockerClientOptions {
  baseUrl: string;
  basicAuth?: string;
  username?: string;
  password?: string;
  bearerToken?: string;
  allowInsecure?: boolean;
}

type DockerRequestInit = RequestInit & {
  query?: Record<string, Primitive | undefined>;
  rawResponse?: boolean;
};

const jsonBody = (body: unknown): body is Record<string, unknown> =>
  typeof body === "object" &&
  body !== null &&
  !(body instanceof ArrayBuffer) &&
  !(body instanceof URLSearchParams) &&
  !(body instanceof ReadableStream) &&
  !(body instanceof FormData);

const encodeBasic = (username: string, password: string) =>
  Buffer.from(`${username}:${password}`).toString("base64");

export class DockerClient {
  private readonly baseUrl: string;
  private readonly authHeader?: string;
  private readonly allowInsecure: boolean;
  private readonly httpsAgent?: Agent;

  constructor(options: DockerClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    if (options.basicAuth) {
      this.authHeader = `Basic ${options.basicAuth}`;
    } else if (options.username && options.password) {
      this.authHeader = `Basic ${encodeBasic(options.username, options.password)}`;
    } else if (options.bearerToken) {
      this.authHeader = `Bearer ${options.bearerToken}`;
    }
    this.allowInsecure = !!options.allowInsecure;
    if (this.allowInsecure) {
      this.httpsAgent = new Agent({ connect: { rejectUnauthorized: false } });
    }
  }

  public listContainers(all = true) {
    return this.request(`/containers/json`, {
      query: { all: all ? 1 : 0 },
    });
  }

  public inspectContainer(id: string) {
    return this.request(`/containers/${encodeURIComponent(id)}/json`);
  }

  public getContainerStats(id: string) {
    return this.request(`/containers/${encodeURIComponent(id)}/stats`, {
      query: { stream: 0 },
    });
  }

  public async containerLogs(
    id: string,
    options: { tail?: number; since?: number } = {}
  ) {
    const query: Record<string, Primitive> = {
      stdout: 1,
      stderr: 1,
      timestamps: 1,
    };
    if (options.tail) query.tail = options.tail;
    if (options.since) query.since = options.since;
    const response = await this.request(
      `/containers/${encodeURIComponent(id)}/logs`,
      {
        query,
        rawResponse: true,
      }
    );
    return response.text();
  }

  public startContainer(id: string) {
    return this.request(`/containers/${encodeURIComponent(id)}/start`, {
      method: "POST",
    });
  }

  public stopContainer(id: string) {
    return this.request(`/containers/${encodeURIComponent(id)}/stop`, {
      method: "POST",
    });
  }

  public restartContainer(id: string) {
    return this.request(`/containers/${encodeURIComponent(id)}/restart`, {
      method: "POST",
    });
  }

  public removeContainer(id: string, force = false) {
    return this.request(`/containers/${encodeURIComponent(id)}`, {
      method: "DELETE",
      query: { force: force ? 1 : 0 },
    });
  }

  public createContainer(payload: Record<string, unknown>, name?: string) {
    return this.request(`/containers/create`, {
      method: "POST",
      body: payload,
      query: name ? { name } : undefined,
    });
  }

  public listImages() {
    return this.request(`/images/json`, {
      query: { all: 0 },
    });
  }

  public removeImage(id: string, force = false) {
    return this.request(`/images/${encodeURIComponent(id)}`, {
      method: "DELETE",
      query: { force: force ? 1 : 0 },
    });
  }

  public pullImage(image: string, tag?: string) {
    const query: Record<string, Primitive> = { fromImage: image };
    if (tag) query.tag = tag;
    return this.request(`/images/create`, {
      method: "POST",
      query,
      rawResponse: true,
    }).then((response) => response.text());
  }

  public pruneImages() {
    return this.request(`/images/prune`, {
      method: "POST",
    });
  }

  public listVolumes() {
    return this.request(`/volumes`);
  }

  public createVolume(payload: Record<string, unknown>) {
    return this.request(`/volumes/create`, {
      method: "POST",
      body: payload,
    });
  }

  public removeVolume(name: string, force = false) {
    return this.request(`/volumes/${encodeURIComponent(name)}`, {
      method: "DELETE",
      query: { force: force ? 1 : 0 },
    });
  }

  public listNetworks() {
    return this.request(`/networks`);
  }

  public createNetwork(payload: Record<string, unknown>) {
    return this.request(`/networks/create`, {
      method: "POST",
      body: payload,
    });
  }

  public removeNetwork(id: string) {
    return this.request(`/networks/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  }

  public systemPrune(payload?: Record<string, unknown>) {
    return this.request(`/system/prune`, {
      method: "POST",
      query: { filters: payload ? JSON.stringify(payload) : undefined },
    });
  }

  public diskUsage() {
    return this.request(`/system/df`);
  }

  public info() {
    return this.request(`/info`);
  }

  public events(query: Record<string, Primitive>) {
    return this.request(`/events`, {
      query,
      rawResponse: true,
    });
  }

  public createExec(containerId: string, payload: Record<string, unknown>) {
    return this.request(`/containers/${encodeURIComponent(containerId)}/exec`, {
      method: "POST",
      body: payload,
    });
  }

  public startExec(execId: string) {
    return this.request(`/exec/${encodeURIComponent(execId)}/start`, {
      method: "POST",
      body: { Detach: false, Tty: true },
      rawResponse: true,
    }).then((response) => response.text());
  }

  private async request(path: string, init: DockerRequestInit = {}) {
    const url = new URL(this.baseUrl + path);
    if (init.query) {
      for (const [key, value] of Object.entries(init.query)) {
        if (value === undefined) continue;
        url.searchParams.set(key, String(value));
      }
    }
    const headers = new Headers(init.headers);
    if (this.authHeader && !headers.has("Authorization")) {
      headers.set("Authorization", this.authHeader);
    }
    const requestInit: RequestInit = { ...init, headers };
    if (this.allowInsecure && url.protocol === "https:" && this.httpsAgent) {
      (requestInit as any).dispatcher = this.httpsAgent;
    }
    if (jsonBody(init.body)) {
      headers.set("Content-Type", "application/json");
      requestInit.body = JSON.stringify(init.body);
    }
    const response = await fetch(url, requestInit);
    if (init.rawResponse) {
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Docker API ${response.status}: ${text}`);
      }
      return response;
    }
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Docker API ${response.status}: ${text}`);
    }
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json();
    }
    return response.text();
  }
}

export const createDockerClient = () => {
  const baseUrl = process.env.DOCKER_API_BASE;
  if (!baseUrl) {
    throw new Error("DOCKER_API_BASE is not configured");
  }
  return new DockerClient({
    baseUrl,
    basicAuth: process.env.DOCKER_API_BASIC_AUTH,
    username: process.env.DOCKER_API_USERNAME,
    password: process.env.DOCKER_API_PASSWORD,
    bearerToken: process.env.DOCKER_API_BEARER_TOKEN,
    allowInsecure: process.env.DOCKER_API_ALLOW_INSECURE === "1",
  });
};
