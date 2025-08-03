#!/bin/bash

# Script de build pour Vercel
echo "🔨 Building OPNSKIN for Vercel..."

# Installer les dépendances à la racine
echo "📦 Installing root dependencies..."
npm install

# Aller dans le répertoire web et installer les dépendances
cd apps/web
echo "📦 Installing web app dependencies..."
npm install

# Générer le client Prisma (sera fait automatiquement par postinstall)
echo "📦 Prisma client should be generated automatically..."

# Builder l'application
echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build completed successfully!" 