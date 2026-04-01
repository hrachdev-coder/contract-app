function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getConfiguredAppUrl() {
  const configuredUrl =
    (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
      ? process.env.VERCEL_URL
      : null) ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";

  if (configuredUrl.startsWith("http://") || configuredUrl.startsWith("https://")) {
    return trimTrailingSlash(configuredUrl);
  }

  return trimTrailingSlash(`https://${configuredUrl}`);
}

export function getRequestBaseUrl(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const host = forwardedHost || request.headers.get("host");

  if (host) {
    return trimTrailingSlash(`${forwardedProto || "https"}://${host}`);
  }

  try {
    return trimTrailingSlash(new URL(request.url).origin);
  } catch {
    return getConfiguredAppUrl();
  }
}