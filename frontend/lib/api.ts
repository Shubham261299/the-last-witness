export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public uncertain = false,
  ) {
    super(message);
  }
}

export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "Cannot reach the investigation service. Unsaved changes are kept on this page.",
      "disconnected",
      method !== "GET",
    );
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      "The service did not return a complete response. Reconnect to check your last action.",
      "disconnected",
      method !== "GET",
    );
  }
  if (!response.ok) {
    throw new ApiError(
      data.error?.message ||
        "The investigation service is unavailable. Try reconnecting.",
      data.error?.code || "service_error",
      response.status >= 500 && method !== "GET",
    );
  }
  return data as T;
}

export function savedTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
