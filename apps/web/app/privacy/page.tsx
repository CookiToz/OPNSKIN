'use client';

import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, Database, Cookie, Users, Globe } from 'lucide-react';

export default function PrivacyPage() {
  const { t, ready } = useTranslation('common');

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-opnskin-bg-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-none mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-opnskin-text-primary mb-4">
              Politique de Confidentialité
            </h1>
            <p className="text-lg text-opnskin-text-secondary mb-4">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Conforme RGPD
            </Badge>
          </div>

          {/* Navigation rapide */}
          <div className="mb-8 p-6 bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg">
            <h2 className="text-xl font-semibold text-opnskin-text-primary mb-4">Sommaire</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <a href="#introduction" className="text-opnskin-accent hover:underline">1. Introduction</a>
              <a href="#responsable" className="text-opnskin-accent hover:underline">2. Responsable</a>
              <a href="#donnees" className="text-opnskin-accent hover:underline">3. Données</a>
              <a href="#cookies" className="text-opnskin-accent hover:underline">4. Cookies</a>
              <a href="#finalites" className="text-opnskin-accent hover:underline">5. Finalités</a>
              <a href="#base-legale" className="text-opnskin-accent hover:underline">6. Base légale</a>
              <a href="#conservation" className="text-opnskin-accent hover:underline">7. Conservation</a>
              <a href="#droits" className="text-opnskin-accent hover:underline">8. Vos droits</a>
            </div>
          </div>

          {/* Contenu linéaire */}
          <div className="space-y-8">
            {/* 1. Introduction */}
            <section id="introduction" className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">1. Introduction</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <p>
                  OPNSKIN s'engage à protéger votre vie privée. Cette politique de confidentialité 
                  explique comment nous collectons, utilisons et protégeons vos informations personnelles 
                  conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi française.
                </p>
                <p>
                  En utilisant notre service, vous acceptez les pratiques décrites dans cette politique.
                </p>
              </div>
            </section>

            {/* 2. Responsable du traitement */}
            <section id="responsable" className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">2. Responsable du Traitement</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <div className="bg-opnskin-bg-primary/50 p-4 rounded-lg">
                  <p className="font-semibold text-opnskin-text-primary mb-2">OPNSKIN</p>
                  <p>Adresse : [Votre adresse]</p>
                  <p>Email : privacy@opnskin.com</p>
                  <p>Site web : https://www.opnskin.com</p>
                </div>
                <p>
                  Pour toute question concernant cette politique ou vos données personnelles, 
                  contactez-nous à privacy@opnskin.com
                </p>
              </div>
            </section>

            {/* 3. Données collectées */}
            <section id="donnees" className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">3. Données Collectées</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-opnskin-text-primary mb-3">Données d'identification Steam</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Steam ID (identifiant unique)</li>
                    <li>Nom d'utilisateur Steam</li>
                    <li>Avatar Steam</li>
                    <li>URL du profil Steam</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-opnskin-text-primary mb-3">Données de transaction</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Historique des achats/ventes</li>
                    <li>Solde du portefeuille</li>
                    <li>Annonces créées</li>
                    <li>Messages de support</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-opnskin-text-primary mb-3">Données techniques</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Adresse IP</li>
                    <li>Type de navigateur</li>
                    <li>Système d'exploitation</li>
                    <li>Horodatage des connexions</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 4. Cookies */}
            <section id="cookies" className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Cookie className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">4. Utilisation des Cookies</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-opnskin-text-primary mb-3">Cookies essentiels</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>steamid</strong> : Authentification Steam (7 jours)</li>
                    <li><strong>session</strong> : Session utilisateur</li>
                    <li><strong>csrf</strong> : Protection CSRF</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-opnskin-text-primary mb-3">Cookies analytiques</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Google Analytics (avec consentement)</li>
                    <li>Vercel Analytics (anonymisé)</li>
                  </ul>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <p className="text-sm">
                    <strong>Note importante :</strong> Nous n'utilisons pas de cookies tiers 
                    sans votre consentement explicite. Steam ne dépose aucun cookie sur notre domaine.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Finalités */}
            <section id="finalites" className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">5. Finalités du Traitement</h2>
              </div>
              <div className="text-opnskin-text-secondary">
                <ul className="list-disc list-inside space-y-3 ml-4">
                  <li><strong>Authentification :</strong> Connexion via Steam OpenID</li>
                  <li><strong>Gestion des transactions :</strong> Achat/vente de skins</li>
                  <li><strong>Support client :</strong> Assistance et tickets</li>
                  <li><strong>Sécurité :</strong> Prévention de la fraude</li>
                  <li><strong>Amélioration du service :</strong> Analytics anonymisés</li>
                  <li><strong>Conformité légale :</strong> Obligations fiscales et légales</li>
                </ul>
              </div>
            </section>

            {/* 6. Base légale */}
            <section id="base-legale" className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">6. Base Légale</h2>
              </div>
              <div className="text-opnskin-text-secondary">
                <ul className="list-disc list-inside space-y-3 ml-4">
                  <li><strong>Exécution du contrat :</strong> Services de marketplace</li>
                  <li><strong>Intérêt légitime :</strong> Sécurité et prévention fraude</li>
                  <li><strong>Obligation légale :</strong> Conformité fiscale</li>
                  <li><strong>Consentement :</strong> Analytics et marketing (optionnel)</li>
                </ul>
              </div>
            </section>

            {/* 7. Conservation */}
            <section id="conservation" className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">7. Durée de Conservation</h2>
              </div>
              <div className="text-opnskin-text-secondary">
                <ul className="list-disc list-inside space-y-3 ml-4">
                  <li><strong>Données de compte :</strong> Jusqu'à suppression du compte</li>
                  <li><strong>Données de transaction :</strong> 10 ans (obligation fiscale)</li>
                  <li><strong>Logs de connexion :</strong> 12 mois</li>
                  <li><strong>Cookies :</strong> 7 jours (steamid)</li>
                  <li><strong>Données de support :</strong> 3 ans après résolution</li>
                </ul>
              </div>
            </section>

            {/* 8. Vos droits */}
            <section id="droits" className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">8. Vos Droits RGPD</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <ul className="list-disc list-inside space-y-3 ml-4">
                  <li><strong>Droit d'accès :</strong> Consulter vos données</li>
                  <li><strong>Droit de rectification :</strong> Corriger vos données</li>
                  <li><strong>Droit à l'effacement :</strong> Supprimer vos données</li>
                  <li><strong>Droit à la portabilité :</strong> Exporter vos données</li>
                  <li><strong>Droit d'opposition :</strong> Refuser le traitement</li>
                  <li><strong>Droit de limitation :</strong> Limiter le traitement</li>
                </ul>
                
                <div className="bg-opnskin-accent/10 border border-opnskin-accent/20 rounded-lg p-4">
                  <p className="text-sm">
                    <strong>Pour exercer vos droits :</strong> Contactez-nous à privacy@opnskin.com
                  </p>
                </div>
              </div>
            </section>

            {/* 9. Sécurité */}
            <section className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">9. Mesures de Sécurité</h2>
              </div>
              <div className="text-opnskin-text-secondary">
                <ul className="list-disc list-inside space-y-3 ml-4">
                  <li>Chiffrement SSL/TLS</li>
                  <li>Cookies sécurisés (httpOnly, secure)</li>
                  <li>Authentification Steam sécurisée</li>
                  <li>Base de données chiffrée</li>
                  <li>Accès restreint aux données</li>
                  <li>Audit de sécurité régulier</li>
                </ul>
              </div>
            </section>

            {/* 10. Contact */}
            <section className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">10. Contact et DPO</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-opnskin-text-primary mb-2">Délégué à la Protection des Données (DPO)</h3>
                  <p>Email : dpo@opnskin.com</p>
                  <p>Adresse : [Adresse DPO]</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-opnskin-text-primary mb-2">Autorité de contrôle</h3>
                  <p>Commission Nationale de l'Informatique et des Libertés (CNIL)</p>
                  <p>Site web : https://www.cnil.fr</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-opnskin-text-primary mb-2">Contact général</h3>
                  <p>Email : privacy@opnskin.com</p>
                  <p>Support : support@opnskin.com</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 