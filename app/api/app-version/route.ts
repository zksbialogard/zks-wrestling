import { NextResponse } from "next/server";

import { getDeploymentVersion, getDisplayVersion } from "@/lib/app-version";

export async function GET() {
  const version = getDeploymentVersion();

  return NextResponse.json({
    version,
    displayVersion: getDisplayVersion(version),
  });
}
