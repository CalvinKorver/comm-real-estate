/*
  Warnings:

  - You are about to drop the column `providerAccountId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `llcContact` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `streetAddress` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `sessionToken` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `contacts` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `contacts` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `contacts` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `coordinates` table. All the data in the column will be lost.
  - You are about to drop the column `placeId` on the `coordinates` table. All the data in the column will be lost.
  - You are about to drop the column `propertyId` on the `coordinates` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `coordinates` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `propertyId` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `property_images` table. All the data in the column will be lost.
  - You are about to drop the column `propertyId` on the `property_images` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[provider,provider_account_id]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[session_token]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[owner_id,type,priority]` on the table `contacts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[property_id]` on the table `coordinates` will be added. If there are existing duplicate values, this will fail.

*/

-- Step 1: Add new columns to Owner table
ALTER TABLE "Owner" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Owner" ADD COLUMN "first_name" TEXT;
ALTER TABLE "Owner" ADD COLUMN "full_name" TEXT;
ALTER TABLE "Owner" ADD COLUMN "last_name" TEXT;
ALTER TABLE "Owner" ADD COLUMN "llc_contact" TEXT;
ALTER TABLE "Owner" ADD COLUMN "phone_number" TEXT;
ALTER TABLE "Owner" ADD COLUMN "street_address" TEXT;
ALTER TABLE "Owner" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Owner" ADD COLUMN "zip_code" TEXT;

-- Step 2: Copy data from old columns to new columns in Owner table
UPDATE "Owner" SET 
  "first_name" = "firstName",
  "last_name" = "lastName",
  "full_name" = "fullName",
  "llc_contact" = "llcContact",
  "phone_number" = "phoneNumber",
  "street_address" = "streetAddress",
  "zip_code" = "zipCode",
  "created_at" = "createdAt",
  "updated_at" = "updatedAt";

-- Step 3: Make required columns NOT NULL
ALTER TABLE "Owner" ALTER COLUMN "first_name" SET NOT NULL;
ALTER TABLE "Owner" ALTER COLUMN "last_name" SET NOT NULL;

-- Step 4: Add new columns to contacts table
ALTER TABLE "contacts" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "contacts" ADD COLUMN "owner_id" TEXT;
ALTER TABLE "contacts" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 5: Copy data from old columns to new columns in contacts table
UPDATE "contacts" SET 
  "owner_id" = "ownerId",
  "created_at" = "createdAt",
  "updated_at" = "updatedAt";

-- Step 6: Make required columns NOT NULL
ALTER TABLE "contacts" ALTER COLUMN "owner_id" SET NOT NULL;

-- Step 7: Add new columns to coordinates table
ALTER TABLE "coordinates" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "coordinates" ADD COLUMN "place_id" TEXT;
ALTER TABLE "coordinates" ADD COLUMN "property_id" TEXT;
ALTER TABLE "coordinates" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 8: Copy data from old columns to new columns in coordinates table
UPDATE "coordinates" SET 
  "property_id" = "propertyId",
  "place_id" = "placeId",
  "created_at" = "createdAt",
  "updated_at" = "updatedAt";

-- Step 9: Make required columns NOT NULL
ALTER TABLE "coordinates" ALTER COLUMN "property_id" SET NOT NULL;

-- Step 10: Add new columns to notes table
ALTER TABLE "notes" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "notes" ADD COLUMN "property_id" TEXT;
ALTER TABLE "notes" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 11: Copy data from old columns to new columns in notes table
UPDATE "notes" SET 
  "property_id" = "propertyId",
  "created_at" = "createdAt",
  "updated_at" = "updatedAt";

-- Step 12: Make required columns NOT NULL
ALTER TABLE "notes" ALTER COLUMN "property_id" SET NOT NULL;

-- Step 13: Add new columns to properties table
ALTER TABLE "properties" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "properties" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 14: Copy data from old columns to new columns in properties table
UPDATE "properties" SET 
  "created_at" = "createdAt",
  "updated_at" = "updatedAt";

-- Step 15: Add new columns to property_images table
ALTER TABLE "property_images" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "property_images" ADD COLUMN "property_id" TEXT;

-- Step 16: Copy data from old columns to new columns in property_images table
UPDATE "property_images" SET 
  "property_id" = "propertyId",
  "created_at" = "createdAt";

-- Step 17: Make required columns NOT NULL
ALTER TABLE "property_images" ALTER COLUMN "property_id" SET NOT NULL;

-- Step 18: Add new columns to users table
ALTER TABLE "users" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "users" ADD COLUMN "email_verified" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "first_name" TEXT;
ALTER TABLE "users" ADD COLUMN "last_name" TEXT;
ALTER TABLE "users" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 19: Copy data from old columns to new columns in users table
UPDATE "users" SET 
  "first_name" = "firstName",
  "last_name" = "lastName",
  "email_verified" = "emailVerified",
  "created_at" = "createdAt",
  "updated_at" = "updatedAt";

-- Step 20: Add new columns to Account table
ALTER TABLE "Account" ADD COLUMN "provider_account_id" TEXT;
ALTER TABLE "Account" ADD COLUMN "user_id" TEXT;

-- Step 21: Copy data from old columns to new columns in Account table
UPDATE "Account" SET 
  "provider_account_id" = "providerAccountId",
  "user_id" = "userId";

-- Step 22: Make required columns NOT NULL
ALTER TABLE "Account" ALTER COLUMN "provider_account_id" SET NOT NULL;
ALTER TABLE "Account" ALTER COLUMN "user_id" SET NOT NULL;

-- Step 23: Add new columns to Session table
ALTER TABLE "Session" ADD COLUMN "session_token" TEXT;
ALTER TABLE "Session" ADD COLUMN "user_id" TEXT;

-- Step 24: Copy data from old columns to new columns in Session table
UPDATE "Session" SET 
  "session_token" = "sessionToken",
  "user_id" = "userId";

-- Step 25: Make required columns NOT NULL
ALTER TABLE "Session" ALTER COLUMN "session_token" SET NOT NULL;
ALTER TABLE "Session" ALTER COLUMN "user_id" SET NOT NULL;

-- Step 26: Drop foreign key constraints
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";
ALTER TABLE "contacts" DROP CONSTRAINT "contacts_ownerId_fkey";
ALTER TABLE "coordinates" DROP CONSTRAINT "coordinates_propertyId_fkey";
ALTER TABLE "notes" DROP CONSTRAINT "notes_propertyId_fkey";
ALTER TABLE "property_images" DROP CONSTRAINT "property_images_propertyId_fkey";

-- Step 27: Drop indexes
DROP INDEX "Account_provider_providerAccountId_key";
DROP INDEX "Session_sessionToken_key";
DROP INDEX "contacts_ownerId_type_priority_key";
DROP INDEX "coordinates_propertyId_key";

-- Step 28: Drop old columns from all tables
ALTER TABLE "Account" DROP COLUMN "providerAccountId", DROP COLUMN "userId";
ALTER TABLE "Owner" DROP COLUMN "createdAt", DROP COLUMN "firstName", DROP COLUMN "fullName", DROP COLUMN "lastName", DROP COLUMN "llcContact", DROP COLUMN "phoneNumber", DROP COLUMN "streetAddress", DROP COLUMN "updatedAt", DROP COLUMN "zipCode";
ALTER TABLE "Session" DROP COLUMN "sessionToken", DROP COLUMN "userId";
ALTER TABLE "contacts" DROP COLUMN "createdAt", DROP COLUMN "ownerId", DROP COLUMN "updatedAt";
ALTER TABLE "coordinates" DROP COLUMN "createdAt", DROP COLUMN "placeId", DROP COLUMN "propertyId", DROP COLUMN "updatedAt";
ALTER TABLE "notes" DROP COLUMN "createdAt", DROP COLUMN "propertyId", DROP COLUMN "updatedAt";
ALTER TABLE "properties" DROP COLUMN "createdAt", DROP COLUMN "updatedAt";
ALTER TABLE "property_images" DROP COLUMN "createdAt", DROP COLUMN "propertyId";
ALTER TABLE "users" DROP COLUMN "createdAt", DROP COLUMN "emailVerified", DROP COLUMN "firstName", DROP COLUMN "lastName", DROP COLUMN "updatedAt";

-- Step 29: Create new indexes
CREATE UNIQUE INDEX "Account_provider_provider_account_id_key" ON "Account"("provider", "provider_account_id");
CREATE UNIQUE INDEX "Session_session_token_key" ON "Session"("session_token");
CREATE UNIQUE INDEX "contacts_owner_id_type_priority_key" ON "contacts"("owner_id", "type", "priority");
CREATE UNIQUE INDEX "coordinates_property_id_key" ON "coordinates"("property_id");

-- Step 30: Add new foreign key constraints
ALTER TABLE "Account" ADD CONSTRAINT "Account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "coordinates" ADD CONSTRAINT "coordinates_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notes" ADD CONSTRAINT "notes_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
