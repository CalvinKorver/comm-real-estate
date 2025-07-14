/*
  Warnings:

  - You are about to drop the column `email1` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `email2` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `landline1` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `landline2` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `landline3` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `landline4` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `wireless1` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `wireless2` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `wireless3` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `wireless4` on the `Owner` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Owner" DROP COLUMN "email1",
DROP COLUMN "email2",
DROP COLUMN "landline1",
DROP COLUMN "landline2",
DROP COLUMN "landline3",
DROP COLUMN "landline4",
DROP COLUMN "wireless1",
DROP COLUMN "wireless2",
DROP COLUMN "wireless3",
DROP COLUMN "wireless4";

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "type" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contacts_ownerId_type_priority_key" ON "contacts"("ownerId", "type", "priority");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
