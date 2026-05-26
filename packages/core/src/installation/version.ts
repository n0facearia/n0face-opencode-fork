declare global {
  const AM_VERSION: string
  const AM_CHANNEL: string
}

export const InstallationVersion = typeof AM_VERSION === "string" ? AM_VERSION : "local"
export const InstallationChannel = typeof AM_CHANNEL === "string" ? AM_CHANNEL : "local"
export const InstallationLocal = InstallationChannel === "local"
