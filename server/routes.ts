import { Router } from "express";
import { createDockerClient, DockerClient } from "./dockerClient";
import {
  buildActivityEvents,
  buildAlerts,
  buildContainerDetails,
  buildContainerEvents,
  buildHostDetails,
  buildHostStats,
  buildImages,
  buildNetworks,
  buildVolumes,
  gatherContainersWithStats,
} from "./transformers";
import { ContainerEvent } from "./types";

const router = Router();

const getDockerClient = (() => {
  let client: DockerClient | null = null;
  return () => {
    if (!client) {
      client = createDockerClient();
    }
    return client;
  };
})();

const asyncHandler =
  (handler: (req: any, res: any) => Promise<void>) => async (req: any, res: any) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Internal server error";
      res.status(500).json({ success: false, error: message });
    }
  };

router.get(
  "/health",
  asyncHandler(async (_req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  })
);

router.get(
  "/containers",
  asyncHandler(async (_req, res) => {
    const docker = getDockerClient();
    const { containers } = await gatherContainersWithStats(docker);
    res.json({ success: true, data: containers });
  })
);

router.get(
  "/containers/:id",
  asyncHandler(async (req, res) => {
    const docker = getDockerClient();
    const { id } = req.params;
    const [inspect, stats] = await Promise.all([
      docker.inspectContainer(id),
      docker.getContainerStats(id).catch(() => null),
    ]);
    const payload = buildContainerDetails(inspect, stats);
    res.json({ success: true, data: payload });
  })
);

router.post(
  "/containers",
  asyncHandler(async (req, res) => {
    const docker = getDockerClient();
    const body = req.body as {
      image: string;
      name?: string;
      ports?: { hostPort: string; containerPort: string; protocol?: string }[];
      env?: Record<string, string>;
      command?: string;
      restartPolicy?: "no" | "always" | "unless-stopped" | "on-failure";
      start?: boolean;
    };

    if (!body?.image) {
      res.status(400).json({ success: false, error: "Image is required" });
      return;
    }

    const exposedPorts: Record<string, {}> = {};
    const portBindings: Record<string, { HostPort: string }[]> = {};
    for (const port of body.ports ?? []) {
      if (!port.containerPort) continue;
      const key = `${port.containerPort}/${port.protocol ?? "tcp"}`;
      exposedPorts[key] = {};
      if (port.hostPort) {
        portBindings[key] = [{ HostPort: port.hostPort }];
      }
    }

    const payload: Record<string, unknown> = {
      Image: body.image,
      Cmd: body.command ? body.command.split(" ") : undefined,
      Env: body.env
        ? Object.entries(body.env).map(([key, value]) => `${key}=${value}`)
        : undefined,
      ExposedPorts: Object.keys(exposedPorts).length ? exposedPorts : undefined,
      HostConfig: {
        PortBindings: Object.keys(portBindings).length ? portBindings : undefined,
        RestartPolicy: { Name: body.restartPolicy ?? "no" },
      },
    };
    const created = await docker.createContainer(payload, body.name);
    const containerId = created?.Id ?? created?.id;
    if (body.start !== false && containerId) {
      await docker.startContainer(containerId);
    }
    res.json({ success: true, data: { id: containerId } });
  })
);

router.post(
  "/containers/:id/:action",
  asyncHandler(async (req, res) => {
    const docker = getDockerClient();
    const { id, action } = req.params;
    if (action === "start") {
      await docker.startContainer(id);
    } else if (action === "stop") {
      await docker.stopContainer(id);
    } else if (action === "restart") {
      await docker.restartContainer(id);
    } else {
      res.status(400).json({ success: false, error: "Unsupported action" });
      return;
    }
    res.json({ success: true, data: { id, action } });
  })
);

router.delete(
  "/containers/:id",
  asyncHandler(async (req, res) => {
    const docker = getDockerClient();
    const { id } = req.params;
    await docker.removeContainer(id, true);
    res.json({ success: true, data: { id } });
  })
);

router.post(
  "/containers/:id/exec",
  asyncHandler(async (req, res) => {
    const docker = getDockerClient();
    const { id } = req.params;
    const { command } = req.body ?? {};
    if (!command?.trim()) {
      res.status(400).json({ success: false, error: "Command is required" });
      return;
    }
    const execInstance = await docker.createExec(id, {
      AttachStdout: true,
      AttachStderr: true,
      Cmd: command.trim().split(" "),
      Tty: true,
    });
    const execId = execInstance?.Id ?? execInstance?.id;
    if (!execId) {
      throw new Error("Failed to create exec instance");
    }
    const output = await docker.startExec(execId);
    res.json({ success: true, data: { output } });
  })
);

router.get(
  "/containers/:id/logs",
  asyncHandler(async (req, res) => {
    const docker = getDockerClient();
    const { id } = req.params;
    const { tail, since } = req.query;
    const logs = await docker.containerLogs(id, {
      tail: tail ? Number(tail) : 200,
      since: since ? Number(since) : undefined,
    });
    const entries = logs
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [timestamp, ...rest] = line.trim().split(" ");
        return {
          timestamp: new Date(timestamp).toISOString(),
          message: rest.join(" "),
        };
      });
    res.json({ success: true, data: entries });
  })
);

router.get(
  "/containers/:id/events",
  asyncHandler(async (req, res) => {
    const docker = getDockerClient();
    const { id } = req.params;
    const nowSeconds = Math.floor(Date.now() / 1000);
    const response = await docker.events({
      since: nowSeconds - 60 * 60 * 24 * 7,
      until: nowSeconds,
      filters: JSON.stringify({ container: [id] }),
    });
    const payload = await response.text();
    const events: ContainerEvent[] = buildContainerEvents(payload);
    res.json({ success: true, data: events });
  })
);

router.get(
  "/images",
  asyncHandler(async (_req, res) => {
    const docker = getDockerClient();
    const rawImages = await docker.listImages();
    res.json({ success: true, data: buildImages(rawImages) });
  })
);

router.post(
  "/images/pull",
  asyncHandler(async (req, res) => {
    const docker = getDockerClient();
    const { reference } = req.body ?? {};
    if (!reference) {
      res.status(400).json({ success: false, error: "reference is required" });
      return;
    }
    const [image, tag] = reference.split(":");
    const result = await docker.pullImage(image, tag);
    const output = result.trim().split("\n").pop() ?? "pulled";
    res.json({ success: true, data: { message: output } });
  })
);

router.post(
  "/images/prune",
  asyncHandler(async (_req, res) => {
    const docker = getDockerClient();
    const result = await docker.pruneImages();
    res.json({ success: true, data: result });
  })
);

router.delete(
  "/images/:id",
  asyncHandler(async (req, res) => {
    const docker = getDockerClient();
    const { id } = req.params;
    await docker.removeImage(id, true);
    res.json({ success: true, data: { id } });
  })
);

router.get(
  "/volumes",
  asyncHandler(async (_req, res) => {
    const docker = getDockerClient();
    const [volumesResponse, containers] = await Promise.all([
      docker.listVolumes(),
      docker.listContainers(true),
    ]);
    res.json({
      success: true,
      data: buildVolumes(volumesResponse?.Volumes ?? [], containers),
    });
  })
);

router.post(
  "/volumes",
  asyncHandler(async (req, res) => {
    const docker = getDockerClient();
    const { name, driver } = req.body ?? {};
    if (!name) {
      res.status(400).json({ success: false, error: "name is required" });
      return;
    }
    const result = await docker.createVolume({
      Name: name,
      Driver: driver ?? "local",
    });
    res.json({ success: true, data: result });
  })
);

router.delete(
  "/volumes/:name",
  asyncHandler(async (req, res) => {
    const docker = getDockerClient();
    const { name } = req.params;
    await docker.removeVolume(name, true);
    res.json({ success: true, data: { name } });
  })
);

router.get(
  "/networks",
  asyncHandler(async (_req, res) => {
    const docker = getDockerClient();
    const networks = await docker.listNetworks();
    res.json({ success: true, data: buildNetworks(networks) });
  })
);

router.post(
  "/networks",
  asyncHandler(async (req, res) => {
    const docker = getDockerClient();
    const { name, driver } = req.body ?? {};
    if (!name) {
      res.status(400).json({ success: false, error: "name is required" });
      return;
    }
    const network = await docker.createNetwork({
      Name: name,
      Driver: driver ?? "bridge",
    });
    res.json({ success: true, data: network });
  })
);

router.delete(
  "/networks/:id",
  asyncHandler(async (req, res) => {
    const docker = getDockerClient();
    const { id } = req.params;
    await docker.removeNetwork(id);
    res.json({ success: true, data: { id } });
  })
);

router.post(
  "/system/prune",
  asyncHandler(async (_req, res) => {
    const docker = getDockerClient();
    const result = await docker.systemPrune();
    res.json({ success: true, data: result });
  })
);

router.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const docker = getDockerClient();
    const diskTotalOverride = process.env.HOST_DISK_TOTAL_GB
      ? Number(process.env.HOST_DISK_TOTAL_GB)
      : undefined;
    const [
      { containers, networkRates, raw },
      imagesRaw,
      volumesResponse,
      networksResponse,
      info,
      diskInfo,
    ] = await Promise.all([
      gatherContainersWithStats(docker),
      docker.listImages(),
      docker.listVolumes(),
      docker.listNetworks(),
      docker.info(),
      docker.diskUsage(),
    ]);
    const images = buildImages(imagesRaw);
    const volumes = buildVolumes(volumesResponse?.Volumes ?? [], raw);
    const networks = buildNetworks(networksResponse);
    const danglingImages = images.filter((image) => image.name === "<none>").length;
    const hostStats = buildHostStats(
      info,
      diskInfo,
      containers,
      networkRates,
      diskTotalOverride
    );
    const alerts = buildAlerts(hostStats, containers, danglingImages);
    const recentActivity = await fetchRecentActivity(docker);
    res.json({
      success: true,
      data: {
        summary: {
          containers: {
            running: containers.filter((c) => c.status === "running").length,
            exited: containers.filter((c) => c.status === "exited").length,
            paused: containers.filter((c) => c.status === "paused").length,
            total: containers.length,
          },
          images: images.length,
          volumes: volumes.length,
          networks: networks.length,
        },
        hostStats,
        hostDetails: buildHostDetails(info),
        alerts,
        recentActivity,
      },
    });
  })
);

router.post(
  "/client-errors",
  asyncHandler(async (req, res) => {
    console.error("[CLIENT ERROR]", JSON.stringify(req.body, null, 2));
    res.json({ success: true, data: { logged: true } });
  })
);

const fetchRecentActivity = async (docker: DockerClient) => {
  try {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const since = nowSeconds - 6 * 60 * 60;
    const response = await docker.events({ since, until: nowSeconds });
    const payload = await response.text();
    return buildActivityEvents(payload);
  } catch (error) {
    console.error("Failed to fetch docker events", error);
    return [];
  }
};

export { router };
