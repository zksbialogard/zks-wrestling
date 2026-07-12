export function getDeploymentVersion(): string {
  return (
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
    process.env.VERCEL_DEPLOYMENT_ID?.trim() ||
    process.env.npm_package_version?.trim() ||
    "dev"
  );
}

export function getDisplayVersion(version: string): string {
  if (version === "dev") {
    return "dev";
  }

  return version.length > 7 ? version.slice(0, 7) : version;
}

export function appUpdateReminderKey(version: string): string {
  return `app_update:${version}`;
}
