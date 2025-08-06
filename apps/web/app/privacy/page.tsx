'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, Database, Cookie, Users, Globe } from 'lucide-react';

export default function PrivacyPage() {
  const { t, ready } = useTranslation('common');

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-opnskin-bg-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-opnskin-text-primary mb-4">
              Politique de Confidentialité
            </h1>
            <p className="text-lg text-opnskin-text-secondary">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
            <Badge className="mt-4 bg-green-500/20 text-green-400 border-green-500/30">
              Conforme RGPD
            </Badge>
          </div>

          {/* Grille responsive compacte */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Introduction */}
            <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-opnskin-text-primary text-lg">
                  <Globe className="w-4 h-4" />
                  Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="text-opnskin-text-secondary text-sm">
                <p className="mb-3">
                  OPNSKIN s'engage à protéger votre vie privée conformément au RGPD et à la loi française.
                </p>
                <p>
                  En utilisant notre service, vous acceptez les pratiques décrites dans cette politique.
                </p>
              </CardContent>
            </Card>

            {/* Responsable du traitement */}
            <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-opnskin-text-primary text-lg">
                  <Users className="w-4 h-4" />
                  Responsable
                </CardTitle>
              </CardHeader>
              <CardContent className="text-opnskin-text-secondary text-sm">
                <p className="mb-2">
                  <strong>OPNSKIN</strong><br />
                  Email : privacy@opnskin.com
                </p>
                <p>
                  Contactez-nous pour toute question sur vos données personnelles.
                </p>
              </CardContent>
            </Card>

            {/* Données collectées */}
            <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-opnskin-text-primary text-lg">
                  <Database className="w-4 h-4" />
                  Données Collectées
                </CardTitle>
              </CardHeader>
              <CardContent className="text-opnskin-text-secondary text-sm">
                <ul className="list-disc list-inside space-y-1">
                  <li>Steam ID et profil</li>
                  <li>Historique des transactions</li>
                  <li>Données techniques (IP, navigateur)</li>
                  <li>Messages de support</li>
                </ul>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-opnskin-text-primary text-lg">
                  <Cookie className="w-4 h-4" />
                  Cookies
                </CardTitle>
              </CardHeader>
              <CardContent className="text-opnskin-text-secondary text-sm">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>steamid</strong> : Authentification (7 jours)</li>
                  <li><strong>session</strong> : Session utilisateur</li>
                  <li><strong>csrf</strong> : Protection CSRF</li>
                </ul>
                <p className="text-xs mt-2 text-opnskin-text-secondary/70">
                  Steam ne dépose aucun cookie sur notre domaine.
                </p>
              </CardContent>
            </Card>

            {/* Finalités */}
            <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-opnskin-text-primary text-lg">
                  <Eye className="w-4 h-4" />
                  Finalités
                </CardTitle>
              </CardHeader>
              <CardContent className="text-opnskin-text-secondary text-sm">
                <ul className="list-disc list-inside space-y-1">
                  <li>Authentification Steam</li>
                  <li>Gestion des transactions</li>
                  <li>Support client</li>
                  <li>Sécurité et prévention fraude</li>
                  <li>Amélioration du service</li>
                </ul>
              </CardContent>
            </Card>

            {/* Base légale */}
            <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-opnskin-text-primary text-lg">
                  <Shield className="w-4 h-4" />
                  Base Légale
                </CardTitle>
              </CardHeader>
              <CardContent className="text-opnskin-text-secondary text-sm">
                <ul className="list-disc list-inside space-y-1">
                  <li>Exécution du contrat</li>
                  <li>Intérêt légitime</li>
                  <li>Obligation légale</li>
                  <li>Consentement (optionnel)</li>
                </ul>
              </CardContent>
            </Card>

            {/* Conservation */}
            <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-opnskin-text-primary text-lg">
                  <Lock className="w-4 h-4" />
                  Conservation
                </CardTitle>
              </CardHeader>
              <CardContent className="text-opnskin-text-secondary text-sm">
                <ul className="list-disc list-inside space-y-1">
                  <li>Compte : Jusqu'à suppression</li>
                  <li>Transactions : 10 ans</li>
                  <li>Logs : 12 mois</li>
                  <li>Cookies : 7 jours</li>
                  <li>Support : 3 ans</li>
                </ul>
              </CardContent>
            </Card>

            {/* Vos droits */}
            <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-opnskin-text-primary text-lg">
                  <Users className="w-4 h-4" />
                  Vos Droits RGPD
                </CardTitle>
              </CardHeader>
              <CardContent className="text-opnskin-text-secondary text-sm">
                <ul className="list-disc list-inside space-y-1">
                  <li>Droit d'accès</li>
                  <li>Droit de rectification</li>
                  <li>Droit à l'effacement</li>
                  <li>Droit à la portabilité</li>
                  <li>Droit d'opposition</li>
                </ul>
                <p className="text-xs mt-2 text-opnskin-text-secondary/70">
                  Contact : privacy@opnskin.com
                </p>
              </CardContent>
            </Card>

            {/* Sécurité */}
            <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-opnskin-text-primary text-lg">
                  <Lock className="w-4 h-4" />
                  Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="text-opnskin-text-secondary text-sm">
                <ul className="list-disc list-inside space-y-1">
                  <li>Chiffrement SSL/TLS</li>
                  <li>Cookies sécurisés</li>
                  <li>Authentification Steam</li>
                  <li>Base de données chiffrée</li>
                  <li>Audit de sécurité</li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-opnskin-text-primary text-lg">
                  <Users className="w-4 h-4" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="text-opnskin-text-secondary text-sm">
                <p className="mb-2">
                  <strong>DPO :</strong> dpo@opnskin.com
                </p>
                <p className="mb-2">
                  <strong>Général :</strong> privacy@opnskin.com
                </p>
                <p className="mb-2">
                  <strong>Support :</strong> support@opnskin.com
                </p>
                <p className="text-xs text-opnskin-text-secondary/70">
                  Autorité : CNIL (www.cnil.fr)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 