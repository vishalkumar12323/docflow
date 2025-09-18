/*
  Warnings:

  - You are about to drop the column `orgId` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `checksum` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `currentVersionId` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `orgId` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `orgId` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `kindeId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `document_versions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `org_invitations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `org_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organizations` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."audit_logs" DROP CONSTRAINT "audit_logs_orgId_fkey";

-- DropForeignKey
ALTER TABLE "public"."document_versions" DROP CONSTRAINT "document_versions_documentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."documents" DROP CONSTRAINT "documents_orgId_fkey";

-- DropForeignKey
ALTER TABLE "public"."jobs" DROP CONSTRAINT "jobs_orgId_fkey";

-- DropForeignKey
ALTER TABLE "public"."org_invitations" DROP CONSTRAINT "org_invitations_orgId_fkey";

-- DropForeignKey
ALTER TABLE "public"."org_members" DROP CONSTRAINT "org_members_orgId_fkey";

-- DropForeignKey
ALTER TABLE "public"."org_members" DROP CONSTRAINT "org_members_userId_fkey";

-- DropIndex
DROP INDEX "public"."users_kindeId_key";

-- AlterTable
ALTER TABLE "public"."audit_logs" DROP COLUMN "orgId";

-- AlterTable
ALTER TABLE "public"."documents" DROP COLUMN "checksum",
DROP COLUMN "currentVersionId",
DROP COLUMN "orgId";

-- AlterTable
ALTER TABLE "public"."jobs" DROP COLUMN "orgId";

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "kindeId",
ADD COLUMN     "password" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."document_versions";

-- DropTable
DROP TABLE "public"."org_invitations";

-- DropTable
DROP TABLE "public"."org_members";

-- DropTable
DROP TABLE "public"."organizations";

-- DropEnum
DROP TYPE "public"."OrgPlan";

-- DropEnum
DROP TYPE "public"."OrgRole";
