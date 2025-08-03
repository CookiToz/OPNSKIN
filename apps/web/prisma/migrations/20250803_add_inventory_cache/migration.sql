-- CreateTable
CREATE TABLE "InventoryCache" (
    "id" TEXT NOT NULL,
    "steamId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gameId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,

    CONSTRAINT "InventoryCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InventoryCache_steamId_gameId_currency_key" ON "InventoryCache"("steamId", "gameId", "currency");

-- CreateIndex
CREATE INDEX "InventoryCache_steamId_idx" ON "InventoryCache"("steamId");

-- CreateIndex
CREATE INDEX "InventoryCache_updatedAt_idx" ON "InventoryCache"("updatedAt"); 