/*
  Warnings:

  - Added the required column `imageName` to the `workouts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `workouts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "blocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockType" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "metricType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "blocks_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "work_blocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockId" TEXT NOT NULL,
    "restBlockId" TEXT,
    "repeats" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "work_blocks_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "blocks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "work_blocks_restBlockId_fkey" FOREIGN KEY ("restBlockId") REFERENCES "blocks" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "distances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "distances_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "blocks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "durations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seconds" INTEGER NOT NULL,
    "blockId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "durations_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "blocks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pace_constraints" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "duration" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "workBlockId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pace_constraints_workBlockId_fkey" FOREIGN KEY ("workBlockId") REFERENCES "work_blocks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_workouts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "imageName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "workouts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_workouts" ("createdAt", "id", "updatedAt", "userId") SELECT "createdAt", "id", "updatedAt", "userId" FROM "workouts";
DROP TABLE "workouts";
ALTER TABLE "new_workouts" RENAME TO "workouts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "work_blocks_blockId_key" ON "work_blocks"("blockId");

-- CreateIndex
CREATE UNIQUE INDEX "distances_blockId_key" ON "distances"("blockId");

-- CreateIndex
CREATE UNIQUE INDEX "durations_blockId_key" ON "durations"("blockId");

-- CreateIndex
CREATE UNIQUE INDEX "pace_constraints_workBlockId_key" ON "pace_constraints"("workBlockId");
