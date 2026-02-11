export function isRetryableAuthError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("timeout") ||
    message.includes("offline") ||
    message.includes("temporarily") ||
    message.includes("unavailable")
  );
}

export function getRetryableAuthError(error: unknown) {
  if (!isRetryableAuthError(error)) {
    return null;
  }
  return error instanceof Error
    ? error
    : new Error("Network error. Please try again.");
}
