-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('energy_ready', 'nerve_ready', 'travel_landed', 'chain_alert', 'price_alert', 'cooldown_expired');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tornId" INTEGER NOT NULL,
    "apiKeyEnc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "strength" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "speed" INTEGER NOT NULL,
    "dexterity" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketItem" (
    "id" TEXT NOT NULL,
    "tornItemId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricePoint" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "averagePrice" INTEGER NOT NULL,
    "lowestPrice" INTEGER NOT NULL,
    "volume" INTEGER NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricePoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchedItem" (
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "alertBelow" INTEGER,
    "alertAbove" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchedItem_pkey" PRIMARY KEY ("userId","itemId")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "payload" JSONB NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_tornId_key" ON "User"("tornId");

-- CreateIndex
CREATE INDEX "StatSnapshot_userId_takenAt_idx" ON "StatSnapshot"("userId", "takenAt");

-- CreateIndex
CREATE UNIQUE INDEX "MarketItem_tornItemId_key" ON "MarketItem"("tornItemId");

-- CreateIndex
CREATE INDEX "PricePoint_itemId_recordedAt_idx" ON "PricePoint"("itemId", "recordedAt");

-- CreateIndex
CREATE INDEX "Alert_userId_createdAt_idx" ON "Alert"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "StatSnapshot" ADD CONSTRAINT "StatSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricePoint" ADD CONSTRAINT "PricePoint_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MarketItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchedItem" ADD CONSTRAINT "WatchedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchedItem" ADD CONSTRAINT "WatchedItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MarketItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
