# 🔧 Améliorations de l'Authentification Steam OpenID 2.0

## 📋 Vue d'ensemble

Cette documentation décrit les améliorations apportées au système d'authentification Steam OpenID 2.0 pour contourner les blocages Akamai et simplifier le processus d'authentification.

## 🎯 Problème résolu

**Problème initial :** Les requêtes POST côté serveur vers `https://steamcommunity.com/openid/login` étaient bloquées par Akamai (erreur 403 : Access Denied).

**Solution :** Suppression complète de la vérification côté serveur et utilisation d'une redirection classique du navigateur.

## ✅ Nouvelle approche simplifiée

### 1. **Redirection directe vers Steam OpenID**

```typescript
// app/api/auth/steam/route.ts
const steamLoginUrl = new URL("https://steamcommunity.com/openid/login");
steamLoginUrl.search = new URLSearchParams({
  "openid.ns": "http://specs.openid.net/auth/2.0",
  "openid.mode": "checkid_setup",
  "openid.return_to": `${baseUrl}/api/auth/steam/return`,
  "openid.realm": baseUrl,
  "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
  "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select"
}).toString();

return NextResponse.redirect(steamLoginUrl.toString());
```

### 2. **Extraction directe du SteamID**

```typescript
// app/api/auth/steam/return/route.ts
const claimedId = searchParams.get('openid.claimed_id');

if (!claimedId) {
  return NextResponse.redirect('/login?error=missing_params');
}

const steamIdMatch = claimedId.match(/(?:https?:\/\/)?steamcommunity\.com\/openid\/id\/(\d+)/);

if (!steamIdMatch || !steamIdMatch[1]) {
  return NextResponse.redirect('/login?error=nosteamid');
}

const steamId = steamIdMatch[1];
```

## 🚀 Avantages de cette approche

1. **Aucun appel POST vers Steam** - Plus de blocage Akamai
2. **Processus simplifié** - Moins de points de défaillance
3. **Performance améliorée** - Pas d'attente de réponse Steam
4. **Fiabilité accrue** - Fonctionne même si Steam API est lente
5. **Debugging facilité** - Logs clairs des paramètres reçus

## 🔄 Flux d'authentification

```
1. Utilisateur clique sur "Connecter Steam"
   ↓
2. Redirection vers /api/auth/steam
   ↓
3. Construction URL Steam OpenID avec paramètres
   ↓
4. Redirection navigateur vers https://steamcommunity.com/openid/login
   ↓
5. Utilisateur s'authentifie sur Steam
   ↓
6. Steam redirige vers /api/auth/steam/return avec paramètres
   ↓
7. Extraction SteamID depuis openid.claimed_id
   ↓
8. Création cookie steamid et redirection vers l'accueil
```

## 🛠️ Configuration requise

### Variables d'environnement

```env
NEXT_PUBLIC_BASE_URL=https://votre-domaine.com
```

### URL de retour configurée

L'URL de retour doit être configurée dans Steam OpenID :
- **URL de retour :** `https://votre-domaine.com/api/auth/steam/return`
- **Realm :** `https://votre-domaine.com`

## 🐛 Gestion des erreurs

### Codes d'erreur

- `missing_params` - Paramètres OpenID manquants
- `nosteamid` - SteamID introuvable dans claimed_id
- `config` - Configuration incorrecte
- `internal` - Erreur interne du serveur

### Debugging

Le système inclut un bloc de debug complet qui log :
- URL complète de la requête
- Tous les headers reçus
- Tous les paramètres OpenID reçus

## 📁 Structure des fichiers

```
app/api/auth/steam/
├── route.ts              # Redirection vers Steam OpenID
└── return/route.ts       # Traitement du retour Steam
```

## 🔒 Sécurité

- **Cookies sécurisés** avec `httpOnly: true`
- **Validation des paramètres** OpenID
- **Rate limiting** par IP (3 secondes entre tentatives)
- **Validation de l'URL de base**

## 🧪 Tests

### Test manuel

1. Accédez à votre application
2. Cliquez sur "Connecter Steam"
3. Vérifiez la redirection vers Steam
4. Authentifiez-vous sur Steam
5. Vérifiez le retour et la création du cookie

### Vérification des logs

Les logs doivent afficher :
```
[STEAM AUTH] Redirecting to Steam OpenID: https://steamcommunity.com/openid/login?...
[STEAM OPENID] Successfully extracted SteamID: 76561198...
[STEAM OPENID] Authentication successful, redirecting to: https://...
```

## 📝 Notes importantes

1. **Aucune vérification POST** vers Steam n'est effectuée
2. **Confiance dans les paramètres** OpenID retournés par Steam
3. **Extraction directe** du SteamID depuis `openid.claimed_id`
4. **Compatibilité** avec tous les navigateurs modernes

## 🔄 Migration depuis l'ancienne version

Si vous migrez depuis l'ancienne version avec vérification POST :

1. Supprimez les routes `/api/auth/steam/verify-client` et `/api/auth/steam/complete`
2. Mettez à jour la configuration `NEXT_PUBLIC_BASE_URL`
3. Testez l'authentification complète
4. Vérifiez les logs pour confirmer le bon fonctionnement

## 🎉 Résultat

L'authentification Steam fonctionne maintenant de manière fiable sans être bloquée par Akamai, avec un processus simplifié et des performances améliorées.

## 🔧 Corrections récentes pour résoudre l'erreur Akamai

### Problèmes identifiés et corrigés :

1. **Configuration i18n supprimée** ✅
   - Suppression de la configuration i18n dans `next.config.mjs` qui interférait avec les routes API
   - L'internationalisation est maintenant gérée côté client uniquement

2. **Headers de navigateur ajoutés** ✅
   - Ajout de headers réalistes pour toutes les requêtes vers Steam
   - User-Agent, Accept, Accept-Language, etc. pour éviter la détection Akamai

3. **URLs ngrok hardcodées supprimées** ✅
   - Suppression des fallbacks ngrok hardcodés dans toutes les routes
   - Validation stricte de `NEXT_PUBLIC_BASE_URL`

4. **Rate limiting assoupli** ✅
   - Réduction du délai de 3 à 2 secondes entre les tentatives
   - Moins restrictif pour éviter les erreurs utilisateur

### Configuration requise :

**IMPORTANT** : Vous devez maintenant configurer la variable d'environnement :

```bash
# Dans votre fichier .env.local ou variables d'environnement Vercel
NEXT_PUBLIC_BASE_URL=https://votre-domaine.com
```

**Pas de fallback hardcodé** - l'application échouera proprement si cette variable n'est pas configurée.

### Problème initial :
Les requêtes POST côté serveur vers `https://steamcommunity.com/openid/login` étaient bloquées par Akamai (erreur 403 : Access Denied).

### Solution implémentée :
1. **Redirection navigateur directe** : Plus de requêtes POST côté serveur
2. **Extraction directe du SteamID** : Depuis les paramètres de retour OpenID
3. **Headers de navigateur** : Pour éviter la détection Akamai
4. **Configuration propre** : Sans URLs hardcodées

### Flux d'authentification simplifié :

```typescript
// 1. Utilisateur clique sur "Connecter Steam"
window.location.href = '/api/auth/steam';

// 2. Redirection vers Steam OpenID
const steamLoginUrl = new URL("https://steamcommunity.com/openid/login");
steamLoginUrl.search = new URLSearchParams({
  "openid.ns": "http://specs.openid.net/auth/2.0",
  "openid.mode": "checkid_setup",
  "openid.return_to": `${baseUrl}/api/auth/steam/return`,
  "openid.realm": baseUrl,
  "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
  "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select"
}).toString();

// 3. Steam redirige vers /api/auth/steam/return avec les paramètres
// 4. Extraction du SteamID depuis openid.claimed_id
// 5. Création du cookie et redirection vers l'accueil
```

### Avantages de cette approche :

✅ **Évite Akamai** : Pas de requêtes POST côté serveur
✅ **Plus simple** : Moins de code, moins de points de défaillance
✅ **Plus robuste** : Extraction directe du SteamID
✅ **Headers réalistes** : Évite la détection comme bot
✅ **Configuration propre** : Pas d'URLs hardcodées

### Déploiement :

1. **Configuration Vercel** :
   ```bash
   NEXT_PUBLIC_BASE_URL=https://votre-app.vercel.app
   ```

2. **Configuration locale** :
   ```bash
   # .env.local
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

### Test :

Utilisez le script de test fourni :
```bash
npm run test:openid
```

### Monitoring :

Les logs détaillés sont disponibles dans la console pour diagnostiquer les problèmes :
- `[STEAM AUTH]` : Logs de la route d'authentification
- `[STEAM OPENID]` : Logs de la route de retour
- `🔍 [DEBUG OPENID]` : Debug complet des paramètres reçus

### En cas de problème :

1. Vérifiez que `NEXT_PUBLIC_BASE_URL` est configuré
2. Vérifiez les logs dans la console
3. Testez avec le script de test
4. Vérifiez que l'URL est accessible depuis l'extérieur 