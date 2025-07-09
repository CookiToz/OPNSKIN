# Parcours Utilisateur Complet OPNSKIN

## 🎯 Vue d'Ensemble du Parcours

### Côté Vendeur (Seller)
1. **Arrivée** → Landing Page
2. **Connexion** → Steam Auth
3. **Configuration** → Profil + Trade URL
4. **Inventaire** → Sélection jeu + Items
5. **Mise en vente** → Prix + Confirmation
6. **Gestion** → Mes Annonces
7. **Retrait** → Confirmation + Notification
8. **Transaction** → Échange Steam
9. **Confirmation** → Fin de transaction

### Côté Acheteur (Buyer)
1. **Arrivée** → Landing Page
2. **Connexion** → Steam Auth
3. **Configuration** → Profil + Trade URL
4. **Marketplace** → Sélection jeu + Items
5. **Achat** → Confirmation + Paiement
6. **Transaction** → Échange Steam
7. **Confirmation** → Fin de transaction

---

## 🔄 Parcours Détaillé

### 1. ARRIVÉE - Landing Page (`/`)
**Composant** : `app/page.tsx` ✅ (use client)

**Actions utilisateur** :
- Voir la présentation OPNSKIN
- Cliquer sur "Explorer le marketplace" → `/marketplace`
- Ou cliquer sur "Se connecter avec Steam" → `/api/auth/steam`

**États** :
- Utilisateur non connecté
- Animation des skins en arrière-plan
- Boutons d'action principaux

### 2. CONNEXION - Steam Authentication
**Composant** : `app/login/page.tsx` ✅ (use client)

**Actions utilisateur** :
- Redirection automatique depuis Steam
- Gestion des erreurs de connexion
- Retry en cas d'échec

**États** :
- Loading pendant redirection
- Gestion des erreurs Steam
- Bouton de retry

### 3. CONFIGURATION - Profil Utilisateur (`/profile`)
**Composant** : `app/profile/page.tsx` ✅ (use client)

**Actions utilisateur** :
- Voir les informations Steam
- Configurer le Trade URL Steam
- Voir le solde du wallet

**États** :
- Utilisateur connecté
- Trade URL configuré ou non
- Validation du format Trade URL

---

## 🛒 CÔTÉ VENDEUR

### 4. INVENTAIRE - Sélection et Vente (`/inventory`)
**Composant** : `app/inventory/page.tsx` ✅ (use client)

**Actions utilisateur** :
- Sélectionner un jeu (CS2, Dota2, Rust, TF2)
- Voir les items de l'inventaire
- Cliquer "Mettre en vente" sur un item
- Définir le prix de vente
- Confirmer la mise en vente

**États** :
- Inventaire chargé
- Filtres actifs (rareté, prix, catégorie)
- Modal de vente ouverte
- Confirmation de vente

### 5. GESTION - Mes Annonces (`/listings`)
**Composant** : `app/listings/page.tsx` ✅ (use client)

**Actions utilisateur** :
- Voir toutes ses offres groupées par statut
- Retirer une offre active
- Lancer l'échange Steam pour les offres en cours
- Voir l'historique des transactions

**États** :
- Offres chargées
- Modal de confirmation de retrait
- Notification de succès/erreur

### 6. RETRAIT - Confirmation et Notification
**Composant** : `components/OfferCard.tsx` ✅ (use client)

**Actions utilisateur** :
- Cliquer "Retirer" sur une offre active
- Confirmer dans la modale AlertDialog
- Recevoir notification toast
- Voir l'offre passer en "Expirée"

**États** :
- Modal de confirmation ouverte
- Loading pendant retrait
- Toast de succès/erreur

---

## 🛍️ CÔTÉ ACHETEUR

### 7. MARKETPLACE - Découverte et Achat (`/marketplace`)
**Composant** : `app/marketplace/page.tsx` ✅ (use client)

**Actions utilisateur** :
- Sélectionner un jeu
- Voir toutes les offres disponibles
- Appliquer des filtres
- Ajouter au panier ou acheter directement

**États** :
- Jeu sélectionné
- Filtres appliqués
- Items filtrés

### 8. MARKETPLACE PAR JEU - Achat Direct (`/marketplace/[game]`)
**Composant** : `app/marketplace/[game]/page.tsx` ✅ (use client)

**Actions utilisateur** :
- Voir les offres du jeu sélectionné
- Cliquer "Acheter" sur une offre
- Confirmer l'achat
- Recevoir notification de succès

**États** :
- Offres du jeu chargées
- Loading pendant achat
- Message de succès/erreur

### 9. PANIER - Gestion des Achats (`/cart`)
**Composant** : `app/cart/page.tsx` ✅ (use client)

**Actions utilisateur** :
- Voir les items ajoutés au panier
- Modifier les quantités
- Procéder au checkout
- Payer en crypto/fiat

**États** :
- Panier avec items
- Calcul du total
- Processus de paiement

---

## 💰 TRANSACTION COMMUNE

### 10. ÉCHANGE STEAM - Finalisation
**Composant** : `components/OfferCard.tsx` ✅ (use client)

**Actions utilisateur** :
- Vendeur : Cliquer "Lancer l'échange Steam"
- Redirection vers Steam Trade URL
- Acheteur : Accepter l'échange Steam
- Confirmation de réception

**États** :
- Transaction en cours
- Échange Steam lancé
- Confirmation de l'acheteur

### 11. CONFIRMATION - Fin de Transaction
**API** : `POST /api/transactions/[id]/confirm`

**Actions utilisateur** :
- Acheteur : Confirmer réception
- Vendeur : Confirmer vente
- Transaction marquée comme "COMPLETED"

**États** :
- Transaction terminée
- Notification de succès
- Historique mis à jour

---

## 🔧 Composants et Pages Vérifiés

### ✅ Pages avec "use client"
- `app/page.tsx` - Landing Page
- `app/login/page.tsx` - Connexion Steam
- `app/profile/page.tsx` - Profil utilisateur
- `app/inventory/page.tsx` - Inventaire
- `app/listings/page.tsx` - Mes annonces
- `app/marketplace/page.tsx` - Marketplace principal
- `app/marketplace/[game]/page.tsx` - Marketplace par jeu
- `app/cart/page.tsx` - Panier
- `app/wallet/page.tsx` - Wallet
- `app/history/page.tsx` - Historique
- `app/assistance/page.tsx` - Assistance

### ✅ Composants avec "use client"
- `components/OfferCard.tsx` - Carte d'offre
- `components/InventoryByGame.tsx` - Inventaire par jeu
- `components/SteamAuthStatus.tsx` - Statut Steam
- `components/header.tsx` - Header
- `components/sidebar.tsx` - Sidebar
- `components/MobileLayout.tsx` - Layout mobile

### ✅ APIs Backend
- `GET /api/me` - Informations utilisateur
- `GET /api/offers/list` - Liste des offres
- `POST /api/offers/create` - Créer une offre
- `POST /api/offers/[id]/cancel` - Retirer une offre
- `POST /api/offers/[id]/accept` - Accepter une offre
- `POST /api/transactions/[id]/confirm` - Confirmer transaction
- `POST /api/users/update-trade-url` - Mettre à jour Trade URL

---

## 🎨 États et Notifications

### États de Chargement
- Loading spinner sur toutes les pages
- Skeleton loading pour les listes
- Disabled buttons pendant actions

### Notifications Toast
- Succès : Offre créée, retirée, achetée
- Erreur : Échec API, validation, réseau
- Info : Confirmation, redirection

### Modales de Confirmation
- AlertDialog pour retrait d'offre
- Dialog pour mise en vente
- Confirmation d'achat

---

## 🚀 Améliorations Identifiées

### 1. Corrections Nécessaires
- [ ] Corriger URL API dans marketplace/[game] (`/api/offers/${offerId}/accept.ts` → `/api/offers/${offerId}/accept`)
- [ ] Ajouter gestion d'erreur dans toutes les APIs
- [ ] Améliorer la validation des formulaires

### 2. Fonctionnalités Manquantes
- [ ] Système de notifications temps réel
- [ ] Chat entre acheteur/vendeur
- [ ] Système de réputation
- [ ] Historique détaillé des transactions
- [ ] Filtres avancés sur marketplace

### 3. UX/UI Améliorations
- [ ] Animations de transition
- [ ] États de chargement plus fluides
- [ ] Messages d'erreur plus clairs
- [ ] Responsive design optimisé

---

## 🔒 Sécurité et Validation

### Validation Frontend
- Trade URL format validation
- Prix minimum/maximum
- Confirmation obligatoire pour actions critiques

### Validation Backend
- Vérification propriétaire des offres
- Validation des statuts de transaction
- Rate limiting sur les APIs

### Gestion d'Erreurs
- Messages d'erreur clairs
- Retry automatique pour erreurs réseau
- Fallback pour APIs indisponibles

---

**🎉 Le parcours utilisateur est maintenant complet et documenté !** 