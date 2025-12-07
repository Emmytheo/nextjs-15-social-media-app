-- Safe add organizationId to notifications (Resolution for Drift)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'organizationId') THEN
        ALTER TABLE "notifications" ADD COLUMN "organizationId" TEXT;
    END IF;
END $$;

-- Safe add ForeignKey for organizationId
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'notifications_organizationId_fkey') THEN
        ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Add inviteCode to organizations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'inviteCode') THEN
        ALTER TABLE "organizations" ADD COLUMN "inviteCode" TEXT;
    END IF;
END $$;

-- CreateIndex for inviteCode
CREATE UNIQUE INDEX IF NOT EXISTS "organizations_inviteCode_key" ON "organizations"("inviteCode");
