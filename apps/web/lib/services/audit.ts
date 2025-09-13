import { prisma } from "@/lib/prisma";

export interface AuditLogData {
  orgId: string;
  userId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  static async log(data: AuditLogData) {
    try {
      await prisma.auditLog.create({
        data: {
          ...data,
          metadata: data.metadata || {},
        },
      });
    } catch (error) {
      console.error("Failed to log audit event:", error);
      // Don't throw - audit logging shouldn't break the main flow
    }
  }

  static async getOrgAuditLog(
    orgId: string,
    options: {
      page?: number;
      limit?: number;
      action?: string;
      userId?: string;
      resource?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ) {
    const {
      page = 1,
      limit = 50,
      action,
      userId,
      resource,
      startDate,
      endDate,
    } = options;

    const where: any = { orgId };

    if (action) where.action = action;
    if (userId) where.userId = userId;
    if (resource) where.resource = resource;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
