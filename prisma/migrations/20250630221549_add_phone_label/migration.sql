-- CreateEnum
CREATE TYPE "PhoneLabel" AS ENUM ('primary', 'secondary', 'husband', 'wife', 'son', 'daughter', 'property_manager', 'attorney', 'tenant', 'grandson', 'granddaughter', 'other');

-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "label" "PhoneLabel";
