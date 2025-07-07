# Script de test OpenID Steam

Ce script permet de tester et déboguer l'authentification Steam OpenID.

## 🚀 Utilisation rapide

1. **Configurez votre environnement** :
   ```bash
   # Créez un fichier .env.local à la racine du projet
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

2. **Lancez le test** :
   ```bash
   npm run test:openid
   ```

3. **Suivez les instructions affichées**

## 📋 Configuration requise

### Variables d'environnement

**IMPORTANT** : Vous devez configurer `NEXT_PUBLIC_BASE_URL` :

```bash
# Pour le développement local
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Pour Vercel
NEXT_PUBLIC_BASE_URL=https://votre-app.vercel.app

# Pour ngrok (temporaire)
NEXT_PUBLIC_BASE_URL=https://votre-tunnel.ngrok-free.app
```

### Fichier .env.local

Créez un fichier `.env.local` à la racine du projet :

```bash
# Configuration de base
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Clés API (optionnelles)
CSFLOAT_API_KEY=votre_cle_csfloat
STEAM_API_KEY=votre_cle_steam
```

## 🧪 Ce que fait le script

Le script effectue les tests suivants :

1. **Validation de la configuration**
   - Vérifie que `NEXT_PUBLIC_BASE_URL` est configuré
   - Valide le format de l'URL

2. **Construction de l'URL de redirection**
   - Construit l'URL Steam OpenID avec tous les paramètres
   - Affiche l'URL complète pour test manuel

3. **Simulation des paramètres de retour**
   - Simule les paramètres que Steam envoie
   - Teste l'extraction du SteamID

4. **Instructions de test manuel**
   - Guide pour tester l'authentification complète
   - Points de vérification

## 🔧 Résolution des problèmes

### Erreur "NEXT_PUBLIC_BASE_URL doit être une URL valide"

**Solution** : Configurez la variable d'environnement :

```bash
# .env.local
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Erreur "Access Denied" (Akamai)

**Causes possibles** :
- URL ngrok expirée
- Headers manquants
- Configuration i18n qui interfère

**Solutions** :
1. Vérifiez que votre URL est accessible
2. Utilisez une URL de production (Vercel) plutôt que ngrok
3. Vérifiez les logs du serveur

### Erreur "Rate limit exceeded"

**Solution** : Attendez 2 secondes entre les tentatives

## 📊 Logs et debugging

### Logs du serveur

Surveillez ces logs dans la console du serveur :

```
[STEAM AUTH] Redirecting to Steam OpenID: https://steamcommunity.com/openid/login?...
[STEAM OPENID] Received params: {...}
[STEAM OPENID] Successfully extracted SteamID: 76561198012345678
```

### Logs de debug

Le script affiche des logs détaillés :

```
🔍 [DEBUG OPENID] === DÉBUT DU DEBUG ===
🔍 [DEBUG OPENID] URL complète: http://localhost:3000/api/auth/steam/return?...
🔍 [DEBUG OPENID] Paramètres OpenID reçus: {...}
🔍 [DEBUG OPENID] === FIN DU DEBUG ===
```

## 🚀 Déploiement

### Vercel

1. Configurez les variables d'environnement dans Vercel :
   ```
   NEXT_PUBLIC_BASE_URL=https://votre-app.vercel.app
   ```

2. Déployez votre application

3. Testez avec l'URL de production

### Local avec ngrok

1. Lancez ngrok :
   ```bash
   ngrok http 3000
   ```

2. Configurez l'URL :
   ```bash
   NEXT_PUBLIC_BASE_URL=https://votre-tunnel.ngrok-free.app
   ```

3. Testez avec le script

## 📝 Exemple de sortie

```
🧪 === TEST AUTHENTIFICATION STEAM OPENID ===
📍 URL de base: http://localhost:3000

🔗 Test 1: Construction de l'URL de redirection Steam
✅ URL de redirection construite:
https://steamcommunity.com/openid/login?openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.mode=checkid_setup&...

🔄 Test 2: Simulation des paramètres de retour Steam
✅ URL de retour simulée:
http://localhost:3000/api/auth/steam/return?openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&...

🆔 Test 3: Extraction du SteamID
✅ SteamID extrait avec succès: 76561198012345678

📋 Test 4: Instructions de test manuel

Pour tester l'authentification complète:

1. Assurez-vous que votre serveur Next.js est démarré
   URL de retour: http://localhost:3000/api/auth/steam/return

2. Accédez à: https://steamcommunity.com/openid/login?...
3. Authentifiez-vous sur Steam
4. Vérifiez que vous êtes redirigé vers votre application
5. Vérifiez les logs dans la console du serveur

⚙️ Test 5: Vérification de la configuration
✅ NEXT_PUBLIC_BASE_URL: http://localhost:3000
✅ URL de retour configurée: http://localhost:3000/api/auth/steam/return
✅ URL de redirection: https://steamcommunity.com/openid/login?...

🎯 === RÉSUMÉ ===
✅ Configuration valide
✅ URLs construites correctement
✅ Extraction SteamID fonctionnelle

🚀 Prêt pour les tests !

💡 Conseils:
   - Vérifiez que votre serveur Next.js est démarré
   - Vérifiez que NEXT_PUBLIC_BASE_URL est accessible
   - Surveillez les logs du serveur pendant les tests
   - En cas d'erreur, vérifiez la console du navigateur
```

## 🔗 Liens utiles

- [Documentation Steam OpenID](https://steamcommunity.com/dev)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Vercel](https://vercel.com/docs) 