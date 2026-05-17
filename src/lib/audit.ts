import { connectDB } from '@/lib/db/mongoose';
import AuditLog from '@/lib/db/models/AuditLog';

export async function createAuditLog(params: {
  actorId: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await connectDB();
    await AuditLog.create({
      actorId: params.actorId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      details: params.details || {},
      ipAddress: params.ipAddress || '',
      userAgent: params.userAgent || '',
    });
  } catch (e) {
    console.error('[audit] Failed to create audit log:', e);
  }
}

export function getClientInfo(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ipAddress = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return { ipAddress, userAgent };
}
