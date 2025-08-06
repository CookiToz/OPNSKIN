'use client';

import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Shield, FileText, Users, Globe } from 'lucide-react';

export default function TermsPage() {
  const { t, ready } = useTranslation('common');

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-opnskin-bg-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-opnskin-text-primary mb-4">
              Conditions Générales d'Utilisation
            </h1>
            <p className="text-lg text-opnskin-text-secondary mb-4">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              Conforme au droit français
            </Badge>
          </div>

          {/* Contenu */}
          <div className="space-y-8">
            {/* Introduction */}
            <section className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">1. Introduction</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <p>
                  Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation 
                  du service OPNSKIN, marketplace de skins gaming accessible à l'adresse 
                  https://www.opnskin.com.
                </p>
                <p>
                  En utilisant notre service, vous acceptez d'être lié par ces conditions. 
                  Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
                </p>
              </div>
            </section>

            {/* Définitions */}
            <section className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">2. Définitions</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Service :</strong> La plateforme OPNSKIN et ses fonctionnalités</li>
                  <li><strong>Utilisateur :</strong> Toute personne utilisant le service</li>
                  <li><strong>Skins :</strong> Objets cosmétiques de jeux vidéo</li>
                  <li><strong>Transaction :</strong> Achat ou vente de skins sur la plateforme</li>
                  <li><strong>Compte :</strong> Profil utilisateur lié à Steam</li>
                </ul>
              </div>
            </section>

            {/* Services */}
            <section className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">3. Services Proposés</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <p>OPNSKIN propose les services suivants :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Marketplace de skins pour jeux vidéo (CS2, Dota 2, Rust, TF2)</li>
                  <li>Système de portefeuille sécurisé</li>
                  <li>Historique des transactions</li>
                  <li>Support client multilingue</li>
                  <li>Authentification via Steam</li>
                </ul>
              </div>
            </section>

            {/* Obligations utilisateur */}
            <section className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">4. Obligations de l'Utilisateur</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <p>L'utilisateur s'engage à :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Fournir des informations exactes et à jour</li>
                  <li>Respecter les lois en vigueur</li>
                  <li>Ne pas utiliser le service à des fins illégales</li>
                  <li>Ne pas tenter de contourner les mesures de sécurité</li>
                  <li>Respecter les droits de propriété intellectuelle</li>
                  <li>Ne pas spammer ou harceler d'autres utilisateurs</li>
                </ul>
              </div>
            </section>

            {/* Propriété intellectuelle */}
            <section className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">5. Propriété Intellectuelle</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <p>
                  OPNSKIN et son contenu sont protégés par les droits de propriété intellectuelle. 
                  L'utilisateur ne peut reproduire, distribuer ou modifier le contenu sans autorisation.
                </p>
                <p>
                  Les skins restent la propriété de leurs détenteurs légitimes. OPNSKIN ne revendique 
                  aucun droit sur les skins échangés sur la plateforme.
                </p>
              </div>
            </section>

            {/* Responsabilité */}
            <section className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">6. Limitation de Responsabilité</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <p>
                  OPNSKIN s'efforce de maintenir un service fiable mais ne peut garantir 
                  une disponibilité continue. La responsabilité d'OPNSKIN est limitée aux 
                  dommages directs prouvés.
                </p>
                <p>
                  OPNSKIN n'est pas responsable des pertes liées aux fluctuations de prix 
                  des skins ou aux erreurs utilisateur.
                </p>
              </div>
            </section>

            {/* Protection des données */}
            <section className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">7. Protection des Données</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <p>
                  La collecte et le traitement des données personnelles sont régis par 
                  notre Politique de Confidentialité, conforme au RGPD.
                </p>
                <p>
                  L'utilisateur peut exercer ses droits en contactant notre DPO à 
                  dpo@opnskin.com.
                </p>
              </div>
            </section>

            {/* Résiliation */}
            <section className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">8. Résiliation</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <p>
                  OPNSKIN peut suspendre ou résilier un compte en cas de violation 
                  des présentes conditions.
                </p>
                <p>
                  L'utilisateur peut supprimer son compte à tout moment via les 
                  paramètres de son profil.
                </p>
              </div>
            </section>

            {/* Droit applicable */}
            <section className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">9. Droit Applicable</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <p>
                  Les présentes conditions sont régies par le droit français. 
                  Tout litige sera soumis à la compétence des tribunaux français.
                </p>
                <p>
                  En cas de litige, l'utilisateur peut recourir à la médiation 
                  ou aux tribunaux compétents.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">10. Contact</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <p>
                  Pour toute question concernant ces conditions, contactez-nous :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Email : legal@opnskin.com</li>
                  <li>Support : support@opnskin.com</li>
                  <li>Adresse : [Adresse légale]</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 