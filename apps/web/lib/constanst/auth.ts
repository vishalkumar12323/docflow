import { OrgRole } from "@prisma/client";

export const ROLE_PERMISSIONS = {
  [OrgRole.OWNER]: [
    'org:read',
    'org:update',
    'org:delete',
    'members:invite',
    'members:remove',
    'members:update_role',
    'documents:create',
    'documents:read',
    'documents:update',
    'documents:delete',
    'jobs:create',
    'jobs:read',
    'jobs:cancel',
  ],
  [OrgRole.ADMIN]: [
    'org:read',
    'org:update',
    'members:invite',
    'members:remove',
    'members:update_role',
    'documents:create',
    'documents:read',
    'documents:update',
    'documents:delete',
    'jobs:create',
    'jobs:read',
    'jobs:cancel',
  ],
  [OrgRole.EDITOR]: [
    'org:read',
    'documents:create',
    'documents:read',
    'documents:update',
    'jobs:create',
    'jobs:read',
  ],
  [OrgRole.VIEWER]: [
    'org:read',
    'documents:read',
    'jobs:read',
  ],

};

export const ROLE_HIERARCHY = {
  [OrgRole.VIEWER]: 1,
  [OrgRole.EDITOR]: 2,
  [OrgRole.ADMIN]: 3,
  [OrgRole.OWNER]: 4,
};

export const DEFAULT_ORG_SETTINGS = {
  allowMemberInvites: false,
  documentRetentionDays: 30,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedFileTypes: ["application/pdf"],
};

export const PLAN_LIMITS = {
  FREE: {
    maxMembers: 3,
    maxDocuments: 100,
    maxStorageBytes: 1024 * 1024 * 1024, // 1GB
    maxJobsPerDay: 50,
  },
  PRO: {
    maxMembers: 20,
    maxDocuments: 1000,
    maxStorageBytes: 10 * 1024 * 1024 * 1024, // 10GB
    maxJobsPerDay: 500,
  },
  ENTERPRISE: {
    maxMembers: -1, // Unlimited
    maxDocuments: -1,
    maxStorageBytes: -1,
    maxJobsPerDay: -1,
  },
};
