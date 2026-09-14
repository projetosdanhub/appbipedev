-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "surface" VARCHAR(50) NOT NULL DEFAULT 'tenant';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "two_factor_backup_codes" TEXT[];
