// BOHOK Phase 9 — Database Health & Connectivity Status API
// Endpoint: GET /api/health/db

import { postgresAdapter } from '@/lib/server/db/postgresClient';
import { successResponse, errorResponse } from '@/lib/server/apiResponse';

export async function GET() {
  try {
    const health = await postgresAdapter.checkHealth();
    return successResponse(health);
  } catch (err: unknown) {
    return errorResponse(err);
  }
}
