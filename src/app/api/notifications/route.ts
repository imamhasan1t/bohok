// Route: GET /api/notifications, PATCH /api/notifications

import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/server/auth/authMiddleware';
import { ServerNotificationService } from '@/lib/server/notifications/notificationService';
import { successResponse, errorResponse } from '@/lib/server/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const notifications = ServerNotificationService.getUserNotifications(auth.user.id);
    return successResponse(notifications);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const body = await req.json().catch(() => ({}));
    const { notificationId } = body;

    const ok = ServerNotificationService.markAsRead(notificationId, auth.user.id);
    return successResponse({ success: ok });
  } catch (err) {
    return errorResponse(err);
  }
}
