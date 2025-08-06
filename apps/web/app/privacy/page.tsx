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
        <div className="max-w-5xl mx-auto">
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

          {/* Grille responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne gauche */}
            <div className="space-y-6">
              {/* Introduction */}
              <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-opnskin-text-primary">
                    <Globe className="w-5 h-5" />
                    Introduction
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-opnskin-text-secondary">
                  <p className="mb-4">
                    OPNSKIN ("nous", "notre", "nos") s'engage à protéger votre vie privée. 
                    Cette politique de confidentialité explique comment nous collectons, utilisons 
                    et protégeons vos informations personnelles conformément au Règlement Général 
                    sur la Protection des Données (RGPD) et à la loi française.
                  </p>
                  <p>
                    En utilisant notre service, vous acceptez les pratiques décrites dans cette politique.
                  </p>
                </CardContent>
              </Card>

              {/* Responsable du traitement */}
              <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-opnskin-text-primary">
                    <Users className="w-5 h-5" />
                    Responsable du Traitement
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-opnskin-text-secondary">
                  <p className="mb-4">
                    <strong>OPNSKIN</strong><br />
                    Adresse : [Votre adresse]<br />
                    Email : privacy@opnskin.com<br />
                    Site web : https://www.opnskin.com
                  </p>
                  <p>
                    Pour toute question concernant cette politique ou vos données personnelles, 
                    contactez-nous à privacy@opnskin.com
                  </p>
                </CardContent>
              </Card>

              {/* Données collectées */}
              <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-opnskin-text-primary">
                    <Database className="w-5 h-5" />
                    Données Collectées
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-opnskin-text-secondary">
                  <h3 className="font-semibold mb-3 text-opnskin-text-primary">Données d'identification Steam :</h3>
                  <ul className="list-disc list-inside mb-4 space-y-2">
                    <li>Steam ID (identifiant unique)</li>
                    <li>Nom d'utilisateur Steam</li>
                    <li>Avatar Steam</li>
                    <li>URL du profil Steam</li>
                  </ul>
                  
                  <h3 className="font-semibold mb-3 text-opnskin-text-primary">Données de transaction :</h3>
                  <ul className="list-disc list-inside mb-4 space-y-2">
                    <li>Historique des achats/ventes</li>
                    <li>Solde du portefeuille</li>
                    <li>Annonces créées</li>
                    <li>Messages de support</li>
                  </ul>

                  <h3 className="font-semibold mb-3 text-opnskin-text-primary">Données techniques :</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Adresse IP</li>
                    <li>Type de navigateur</li>
                    <li>Système d'exploitation</li>
                    <li>Horodatage des connexions</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Cookies */}
              <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-opnskin-text-primary">
                    <Cookie className="w-5 h-5" />
                    Utilisation des Cookies
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-opnskin-text-secondary">
                  <h3 className="font-semibold mb-3 text-opnskin-text-primary">Cookies essentiels :</h3>
                  <ul className="list-disc list-inside mb-4 space-y-2">
                    <li><strong>steamid</strong> : Authentification Steam (7 jours)</li>
                    <li><strong>session</strong> : Session utilisateur</li>
                    <li><strong>csrf</strong> : Protection CSRF</li>
                  </ul>

                  <h3 className="font-semibold mb-3 text-opnskin-text-primary">Cookies analytiques :</h3>
                  <ul className="list-disc list-inside mb-4 space-y-2">
                    <li>Google Analytics (avec consentement)</li>
                    <li>Vercel Analytics (anonymisé)</li>
                  </ul>

                  <p className="text-sm text-opnskin-text-secondary mt-4">
                    <strong>Note importante :</strong> Nous n'utilisons pas de cookies tiers 
                    sans votre consentement explicite. Steam ne dépose aucun cookie sur notre domaine.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Colonne droite */}
            <div className="space-y-6">
              {/* Finalités */}
              <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-opnskin-text-primary">
                    <Eye className="w-5 h-5" />
                    Finalités du Traitement
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-opnskin-text-secondary">
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Authentification :</strong> Connexion via Steam OpenID</li>
                    <li><strong>Gestion des transactions :</strong> Achat/vente de skins</li>
                    <li><strong>Support client :</strong> Assistance et tickets</li>
                    <li><strong>Sécurité :</strong> Prévention de la fraude</li>
                    <li><strong>Amélioration du service :</strong> Analytics anonymisés</li>
                    <li><strong>Conformité légale :</strong> Obligations fiscales et légales</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Base légale */}
              <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-opnskin-text-primary">
                    <Shield className="w-5 h-5" />
                    Base Légale
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-opnskin-text-secondary">
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Exécution du contrat :</strong> Services de marketplace</li>
                    <li><strong>Intérêt légitime :</strong> Sécurité et prévention fraude</li>
                    <li><strong>Obligation légale :</strong> Conformité fiscale</li>
                    <li><strong>Consentement :</strong> Analytics et marketing (optionnel)</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Conservation */}
              <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-opnskin-text-primary">
                    <Lock className="w-5 h-5" />
                    Durée de Conservation
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-opnskin-text-secondary">
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Données de compte :</strong> Jusqu'à suppression du compte</li>
                    <li><strong>Données de transaction :</strong> 10 ans (obligation fiscale)</li>
                    <li><strong>Logs de connexion :</strong> 12 mois</li>
                    <li><strong>Cookies :</strong> 7 jours (steamid)</li>
                    <li><strong>Données de support :</strong> 3 ans après résolution</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Vos droits */}
              <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-opnskin-text-primary">
                    <Users className="w-5 h-5" />
                    Vos Droits RGPD
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-opnskin-text-secondary">
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Droit d'accès :</strong> Consulter vos données</li>
                    <li><strong>Droit de rectification :</strong> Corriger vos données</li>
                    <li><strong>Droit à l'effacement :</strong> Supprimer vos données</li>
                    <li><strong>Droit à la portabilité :</strong> Exporter vos données</li>
                    <li><strong>Droit d'opposition :</strong> Refuser le traitement</li>
                    <li><strong>Droit de limitation :</strong> Limiter le traitement</li>
                  </ul>
                  
                  <p className="mt-4 text-sm">
                    Pour exercer vos droits, contactez-nous à privacy@opnskin.com
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Section pleine largeur en bas */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sécurité */}
            <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-opnskin-text-primary">
                  <Lock className="w-5 h-5" />
                  Mesures de Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="text-opnskin-text-secondary">
                <ul className="list-disc list-inside space-y-2">
                  <li>Chiffrement SSL/TLS</li>
                  <li>Cookies sécurisés (httpOnly, secure)</li>
                  <li>Authentification Steam sécurisée</li>
                  <li>Base de données chiffrée</li>
                  <li>Accès restreint aux données</li>
                  <li>Audit de sécurité régulier</li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-opnskin-text-primary">
                  <Users className="w-5 h-5" />
                  Contact et DPO
                </CardTitle>
              </CardHeader>
              <CardContent className="text-opnskin-text-secondary">
                <p className="mb-4">
                  <strong>Délégué à la Protection des Données (DPO) :</strong><br />
                  Email : dpo@opnskin.com<br />
                  Adresse : [Adresse DPO]
                </p>
                
                <p className="mb-4">
                  <strong>Autorité de contrôle :</strong><br />
                  Commission Nationale de l'Informatique et des Libertés (CNIL)<br />
                  Site web : https://www.cnil.fr
                </p>

                <p>
                  <strong>Contact général :</strong><br />
                  Email : privacy@opnskin.com<br />
                  Support : support@opnskin.com
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 