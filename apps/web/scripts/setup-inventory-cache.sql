-- Script pour créer la table InventoryCache
-- À exécuter manuellement dans votre base de données Supabase

-- Créer la table InventoryCache
CREATE TABLE IF NOT EXISTS "InventoryCache" (
    "id" TEXT NOT NULL,
    "steamId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gameId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,

    CONSTRAINT "InventoryCache_pkey" PRIMARY KEY ("id")
);

-- Créer les index pour optimiser les performances
CREATE UNIQUE INDEX IF NOT EXISTS "InventoryCache_steamId_gameId_currency_key" 
ON "InventoryCache"("steamId", "gameId", "currency");

CREATE INDEX IF NOT EXISTS "InventoryCache_steamId_idx" 
ON "InventoryCache"("steamId");

CREATE INDEX IF NOT EXISTS "InventoryCache_updatedAt_idx" 
ON "InventoryCache"("updatedAt");

-- Ajouter les permissions RLS si nécessaire
ALTER TABLE "InventoryCache" ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'accès aux utilisateurs authentifiés
CREATE POLICY "Users can access their own inventory cache" ON "InventoryCache"
    FOR ALL USING (auth.uid()::text = "steamId");

-- Vérifier que la table a été créée
SELECT 'InventoryCache table created successfully' as status; 