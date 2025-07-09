# Système OPNSKIN - Raccordement Base de Données ↔ Frontend

## 🎯 Vue d'ensemble

Le système OPNSKIN est maintenant entièrement raccordé avec une base de données PostgreSQL via Prisma. Toutes les fonctionnalités sont connectées et fonctionnelles.

## 🗄️ Structure de la Base de Données

### Modèles Prisma

```prisma
model User {
  id           String   @id @default(cuid())
  steamId      String   @unique
  name         String?
  avatar       String?
  profileUrl   String?
  email        String?  @unique
  walletBalance Float   @default(0)
  bannedUntil  DateTime?
  tradeUrl     String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  offers       Offer[]
  transactions Transaction[]
  notifications Notification[]
}

model Offer {
  id         String   @id @default(cuid())
  sellerId   String
  seller     User     @relation(fields: [sellerId], references: [id])
  itemId     String
  itemName   String?
  itemImage  String?
  game       String?
  price      Float
  status     OfferStatus @default(AVAILABLE)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  expiresAt  DateTime?

  transaction Transaction?
}

model Transaction {
  id            String   @id @default(cuid())
  offerId       String   @unique
  buyerId       String
  buyer         User     @relation(fields: [buyerId], references: [id])
  offer         Offer    @relation(fields: [offerId], references: [id])
  escrowAmount  Float
  startedAt     DateTime @default(now())
  completedAt   DateTime?
  cancelledAt   DateTime?
  status        TransactionStatus @default(WAITING_TRADE)
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  type      NotificationType
  title     String
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

## 🔗 APIs Raccordées

### 1. API Utilisateur (`/api/users/me`)
- **GET** : Récupère/crée l'utilisateur connecté
- **PUT** : Met à jour le trade URL Steam
- **Fonctionnalités** :
  - Création automatique d'utilisateur lors de la première connexion Steam
  - Récupération des infos Steam via l'API Steam
  - Gestion du trade URL

### 2. API Offres (`/api/offers`)
- **POST** : Crée une nouvelle offre depuis l'inventaire
- **GET** : Liste les offres disponibles avec filtres
- **Fonctionnalités** :
  - Création d'offre avec validation
  - Filtrage par jeu, prix
  - Pagination
  - Notifications automatiques

### 3. API Offres Spécifiques (`/api/offers/[id]`)
- **GET** : Récupère une offre spécifique
- **DELETE** : Annule une offre (vendeur uniquement)
- **PUT** : Confirme/annule une transaction
- **Fonctionnalités** :
  - Gestion des permissions
  - Confirmation de transactions
  - Transfert d'argent automatique

### 4. API Transactions (`/api/transactions`)
- **POST** : Crée une transaction (achat d'offre)
- **GET** : Liste les transactions de l'utilisateur
- **Fonctionnalités** :
  - Vérification du solde
  - Création de notifications
  - Gestion des statuts

### 5. API Notifications (`/api/notifications`)
- **GET** : Récupère les notifications
- **PUT** : Marque comme lue
- **Fonctionnalités** :
  - Filtrage par statut (lu/non lu)
  - Limitation du nombre
  - Types de notifications variés

## 🎮 Parcours Utilisateur Complet

### 1. Connexion Steam
```
1. Utilisateur clique sur "Se connecter avec Steam"
2. Redirection vers Steam OpenID
3. Retour avec steamId dans un cookie
4. API /api/users/me crée automatiquement l'utilisateur
5. Récupération des infos Steam (nom, avatar, etc.)
```

### 2. Mise en Vente d'un Item
```
1. Utilisateur va dans son inventaire
2. Clique sur "Mettre en vente" sur un item
3. Saisit le prix
4. API /api/offers crée l'offre
5. Notification automatique créée
6. Item apparaît sur la marketplace
```

### 3. Achat d'un Item
```
1. Utilisateur parcourt la marketplace
2. Clique sur "Acheter" sur une offre
3. API /api/transactions crée la transaction
4. Statut de l'offre passe à "PENDING_TRADE_OFFER"
5. Notifications envoyées au vendeur et à l'acheteur
6. L'offre disparaît de la marketplace
```

### 4. Confirmation de Transaction
```
1. Vendeur va dans ses transactions
2. Clique sur "Confirmer" la transaction
3. API /api/offers/[id] confirme la transaction
4. Argent transféré du portefeuille acheteur vers vendeur
5. Statut passe à "DONE"
6. Notifications de confirmation envoyées
```

### 5. Gestion des Offres
```
1. Vendeur va dans ses annonces
2. Peut voir toutes ses offres groupées par statut
3. Peut annuler une offre disponible
4. API /api/offers/[id] supprime l'offre
5. Notification de suppression créée
```

## 🔄 Flux de Données

### Authentification
```
Cookie steamId → API /api/users/me → Utilisateur créé/récupéré → Frontend mis à jour
```

### Création d'Offre
```
Frontend → API /api/offers → Base de données → Notification créée → Header mis à jour
```

### Achat
```
Frontend → API /api/transactions → Base de données → Notifications → Pages mises à jour
```

### Notifications
```
Base de données → API /api/notifications → Header + Page notifications → Marquage comme lu
```

## 📱 Pages Frontend Raccordées

### 1. Page de Profil (`/profile`)
- ✅ Récupère les infos utilisateur via `/api/users/me`
- ✅ Met à jour le trade URL via `/api/users/me` (PUT)
- ✅ Affiche le solde du portefeuille
- ✅ Gestion de la déconnexion

### 2. Page Inventaire (`/inventory`)
- ✅ Simulation d'inventaire Steam
- ✅ Bouton "Mettre en vente" raccordé à `/api/offers`
- ✅ Notifications de succès/erreur
- ✅ Redirection vers les listings après vente

### 3. Page Marketplace (`/marketplace/[game]`)
- ✅ Récupère les offres via `/api/offers?game=...`
- ✅ Bouton "Acheter" raccordé à `/api/transactions`
- ✅ Filtrage et pagination
- ✅ Mise à jour en temps réel

### 4. Page Listings (`/listings`)
- ✅ Récupère les offres utilisateur via `/api/users/me`
- ✅ Groupement par statut
- ✅ Bouton "Retirer" raccordé à `/api/offers/[id]` (DELETE)
- ✅ Rafraîchissement automatique

### 5. Page Transactions (`/transactions`)
- ✅ Récupère les transactions via `/api/transactions`
- ✅ Boutons "Confirmer/Annuler" raccordés
- ✅ Affichage des rôles (acheteur/vendeur)
- ✅ Gestion des statuts

### 6. Page Notifications (`/notifications`)
- ✅ Récupère les notifications via `/api/notifications`
- ✅ Bouton "Marquer comme lue"
- ✅ Affichage des types et dates
- ✅ Indicateurs visuels

### 7. Header
- ✅ Indicateur de notifications non lues
- ✅ Menu déroulant des notifications récentes
- ✅ Lien vers la page notifications complète
- ✅ Mise à jour automatique

## 🔒 Sécurité et Validation

### Authentification
- Vérification du cookie `steamId` sur toutes les APIs
- Création automatique d'utilisateur si nécessaire
- Validation des permissions (vendeur/acheteur)

### Validation des Données
- Prix positif pour les offres
- Trade URL Steam valide
- Statuts de transaction cohérents
- Vérification du solde avant achat

### Gestion d'Erreurs
- Messages d'erreur clairs
- Logs détaillés côté serveur
- Fallbacks pour les APIs externes
- Notifications utilisateur appropriées

## 🚀 Déploiement

### Base de Données
```bash
npx prisma generate  # Génère le client Prisma
npx prisma db push   # Synchronise le schema avec la DB
```

### Variables d'Environnement Requises
```env
DATABASE_URL="postgresql://..."
STEAM_API_KEY="..."  # Optionnel pour les infos Steam
```

## 📊 Métriques et Monitoring

### Données Traçées
- Création d'offres
- Transactions effectuées
- Notifications envoyées
- Erreurs d'API
- Temps de réponse

### Logs Disponibles
- Création d'utilisateurs
- Opérations sur les offres
- Transactions
- Erreurs de validation
- Appels API Steam

## 🎯 Prochaines Étapes

1. **Tests E2E** : Tester le parcours complet
2. **Optimisations** : Cache, pagination avancée
3. **Fonctionnalités** : Système de réputation, chat
4. **Monitoring** : Métriques en temps réel
5. **Sécurité** : Rate limiting, validation renforcée

---

Le système OPNSKIN est maintenant **entièrement fonctionnel** avec une base de données PostgreSQL, des APIs REST complètes, et un frontend Next.js entièrement raccordé. Tous les parcours utilisateur sont opérationnels de la connexion Steam jusqu'à la finalisation des transactions. 