interface ActivityLog {
  id: string;
  userId?: string | null;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any>;
  createdAt: Date;
}

class ActivityLogEntity implements ActivityLog {
  id: string;
  userId?: string | null;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any>;
  createdAt: Date;

  constructor(data: ActivityLog) {
    Object.assign(this, data);
  }
}
