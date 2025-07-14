/*
  Warnings:

  - A unique constraint covering the columns `[parcel_id]` on the table `properties` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Owner" ADD COLUMN     "email1" TEXT,
ADD COLUMN     "email2" TEXT,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "landline1" TEXT,
ADD COLUMN     "landline2" TEXT,
ADD COLUMN     "landline3" TEXT,
ADD COLUMN     "landline4" TEXT,
ADD COLUMN     "llcContact" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "wireless1" TEXT,
ADD COLUMN     "wireless2" TEXT,
ADD COLUMN     "wireless3" TEXT,
ADD COLUMN     "wireless4" TEXT,
ALTER COLUMN "phoneNumber" DROP NOT NULL;

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "parcel_id" TEXT,
ADD COLUMN     "state" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "properties_parcel_id_key" ON "properties"("parcel_id");
