export const bytesToGB = (bytes: number, precision = 2) =>
  Number((bytes / 1024 / 1024 / 1024).toFixed(precision));

export const bytesToMB = (bytes: number, precision = 1) =>
  Number((bytes / 1024 / 1024).toFixed(precision));

export const formatDuration = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "seconds";
  const units: [number, string][] = [
    [60 * 60 * 24 * 30, "month"],
    [60 * 60 * 24 * 7, "week"],
    [60 * 60 * 24, "day"],
    [60 * 60, "hour"],
    [60, "minute"],
  ];
  for (const [unitSeconds, unitLabel] of units) {
    if (seconds >= unitSeconds) {
      const value = Math.floor(seconds / unitSeconds);
      return `${value} ${unitLabel}${value === 1 ? "" : "s"}`;
    }
  }
  const rounded = Math.max(1, Math.floor(seconds));
  return `${rounded} sec${rounded === 1 ? "" : "s"}`;
};

export const humanFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
};

export const truncateId = (value: string, size = 12) =>
  value?.substring(0, size) ?? "";

export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;
  const execute = async (): Promise<void> => {
    const currentIndex = index;
    if (currentIndex >= items.length) return;
    index += 1;
    results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    await execute();
  };
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => execute()
  );
  await Promise.all(workers);
  return results;
}

export const relativeTimeFromNow = (value: string | number): string => {
  const timestamp =
    typeof value === "number" ? value * 1000 : Date.parse(String(value));
  if (!Number.isFinite(timestamp)) return "unknown";
  const diffMs = Date.now() - timestamp;
  const diffSeconds = Math.max(0, diffMs / 1000);
  if (diffSeconds < 60) return "just now";
  if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }
  if (diffSeconds < 3600 * 24) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  const days = Math.floor(diffSeconds / (3600 * 24));
  return `${days} day${days === 1 ? "" : "s"} ago`;
};
