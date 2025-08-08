# Intégration Stripe - OPNSKIN Marketplace

## Vue d'ensemble

Cette intégration Stripe permet de gérer les paiements dans la marketplace OPNSKIN avec :
- **Dépôts** : Les utilisateurs peuvent recharger leur wallet via Stripe
- **Retraits** : Les utilisateurs peuvent retirer leurs fonds via Stripe Connect
- **Frais de transaction** : 5% de frais sur chaque transaction de skins

## Architecture

### Flux de paiement
1. **Dépôt** : Stripe → Wallet interne
2. **Transactions** : Wallet interne (avec frais de 5%)
3. **Retraits** : Wallet interne → Stripe Connect

### Modèles de base de données ajoutés
- `StripeAccount` : Comptes Stripe Connect des utilisateurs
- `StripeDeposit` : Historique des dépôts
- `StripeWithdrawal` : Historique des retraits
- `Transaction.transactionFee` : Frais de transaction

## Configuration

### 1. Variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Base URL for redirects
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Configuration Stripe Dashboard

#### Compte Principal (Marketplace)
1. Créez un compte Stripe pour votre marketplace
2. Activez Stripe Connect dans le dashboard
3. Configurez les webhooks pour les événements :
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `transfer.created`
   - `transfer.paid`
   - `account.updated`

#### Webhook Endpoint
- URL : `https://votre-domaine.com/api/stripe/webhook`
- Événements à écouter : Tous les événements mentionnés ci-dessus

### 3. Migration de base de données

Exécutez la migration Prisma pour ajouter les nouveaux modèles :

```bash
cd apps/web
npx prisma migrate dev --name add_stripe_integration
```

## APIs Créées

### Comptes Stripe Connect
- `POST /api/stripe/connect/create-account` : Créer un compte Stripe Connect
- `POST /api/stripe/connect/create-account-link` : Créer un lien d'onboarding
- `GET /api/stripe/account/status` : Statut du compte utilisateur

### Dépôts et Retraits
- `POST /api/stripe/deposit/create-session` : Créer une session de dépôt
- `POST /api/stripe/withdrawal/create` : Créer un retrait

### Webhook
- `POST /api/stripe/webhook` : Gérer les événements Stripe

## Fonctionnalités

### Dépôts
- Montant minimum : 1€
- Paiement par carte bancaire
- Crédit automatique du wallet après paiement réussi

### Retraits
- Montant minimum : 5€
- Nécessite un compte Stripe Connect validé
- Débit immédiat du wallet
- Transfert vers le compte bancaire de l'utilisateur

### Frais de Transaction
- 5% sur chaque transaction de skins
- Prélevés automatiquement sur l'acheteur
- Intégrés dans le calcul du solde requis

## Interface Utilisateur

### Page Wallet
- Bouton "Ajouter des fonds" → Redirection vers Stripe Checkout
- Section Stripe Connect avec 3 états :
  1. **Configuration requise** : Créer le compte Stripe
  2. **En cours de validation** : Compléter l'onboarding
  3. **Compte activé** : Retraits disponibles

### Notifications
- Notifications automatiques pour les dépôts/retraits réussis
- Messages d'erreur en cas de problème

## Sécurité

### Webhooks
- Signature vérifiée avec `STRIPE_WEBHOOK_SECRET`
- Gestion des erreurs et retry automatique

### Validation
- Vérification des montants minimums
- Validation du solde avant retrait
- Vérification du statut du compte Stripe

## Tests

### Test des Dépôts
1. Cliquer sur "Ajouter des fonds"
2. Saisir un montant (min 1€)
3. Compléter le paiement Stripe
4. Vérifier le crédit du wallet

### Test des Retraits
1. Créer un compte Stripe Connect
2. Compléter l'onboarding
3. Saisir un montant de retrait (min 5€)
4. Vérifier le débit du wallet

### Test des Transactions
1. Acheter un skin
2. Vérifier que les frais de 5% sont prélevés
3. Vérifier le nouveau solde

## Déploiement

### Production
1. Utiliser les clés Stripe de production
2. Configurer le webhook avec l'URL de production
3. Tester les paiements en mode production

### Variables d'environnement de production
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=https://votre-domaine.com
```

## Support

En cas de problème :
1. Vérifier les logs Stripe Dashboard
2. Contrôler les webhooks dans le dashboard
3. Vérifier les variables d'environnement
4. Tester avec les clés de test d'abord
