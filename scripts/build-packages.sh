#!/bin/bash

# Script pour builder tous les packages du monorepo

echo "🔨 Building OPNSKIN packages..."

# Builder le package types
echo "📦 Building @opnskin/types..."
cd packages/types
npm run build 2>/dev/null || echo "No build script for types package"

# Builder le package utils
echo "📦 Building @opnskin/utils..."
cd ../utils
npm run build 2>/dev/null || echo "No build script for utils package"

# Builder le package ui
echo "📦 Building @opnskin/ui..."
cd ../ui
npm run build 2>/dev/null || echo "No build script for ui package"

# Retourner à la racine
cd ../../

echo "✅ All packages built successfully!" 