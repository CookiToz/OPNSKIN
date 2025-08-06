'use client';

import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Building, Users, Mail, Globe, Shield } from 'lucide-react';

export default function MentionsPage() {
  const { t, ready } = useTranslation('common');

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-opnskin-bg-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-opnskin-text-primary mb-4">
              Mentions Légales
            </h1>
            <p className="text-lg text-opnskin-text-secondary mb-4">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Conforme au droit français
            </Badge>
          </div>

          {/* Contenu */}
          <div className="space-y-8">
            {/* Éditeur */}
            <section className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Building className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">1. Éditeur du Site</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <div className="bg-opnskin-bg-primary/50 p-4 rounded-lg">
                  <p className="font-semibold text-opnskin-text-primary mb-2">OPNSKIN</p>
                  <p>Adresse : [Adresse complète]</p>
                  <p>Email : contact@opnskin.com</p>
                  <p>Site web : https://www.opnskin.com</p>
                  <p>Forme juridique : [SAS/SARL/etc.]</p>
                  <p>Capital social : [Montant]</p>
                  <p>SIRET : [Numéro SIRET]</p>
                  <p>TVA intracommunautaire : [Numéro TVA]</p>
                </div>
                <p>
                  OPNSKIN est une marketplace spécialisée dans l'échange de skins 
                  pour jeux vidéo, conforme aux réglementations françaises et européennes.
                </p>
              </div>
            </section>

            {/* Directeur de publication */}
            <section className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">2. Directeur de Publication</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <p>
                  Le directeur de publication est [Nom du directeur], 
                  en sa qualité de [Fonction] d'OPNSKIN.
                </p>
                <p>
                  Contact : directeur@opnskin.com
                </p>
              </div>
            </section>

            {/* Hébergement */}
            <section className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">3. Hébergement</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <div className="bg-opnskin-bg-primary/50 p-4 rounded-lg">
                  <p className="font-semibold text-opnskin-text-primary mb-2">Vercel Inc.</p>
                  <p>Adresse : 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</p>
                  <p>Site web : https://vercel.com</p>
                  <p>Email : privacy@vercel.com</p>
                </div>
                <p>
                  Le site OPNSKIN est hébergé par Vercel, plateforme de déploiement 
                  et d'hébergement cloud, conforme aux standards de sécurité internationaux.
                </p>
              </div>
            </section>

            {/* Propriété intellectuelle */}
            <section className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">4. Propriété Intellectuelle</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <p>
                  L'ensemble du contenu de ce site (textes, images, logos, design, 
                  code source) est protégé par les droits de propriété intellectuelle.
                </p>
                <p>
                  Toute reproduction, représentation, modification, publication, 
                  adaptation totale ou partielle des éléments du site, quel que soit 
                  le moyen ou le procédé utilisé, est interdite, sauf autorisation 
                  écrite préalable d'OPNSKIN.
                </p>
                <p>
                  Les skins échangés sur la plateforme restent la propriété de leurs 
                  détenteurs légitimes. OPNSKIN ne revendique aucun droit sur ces objets.
                </p>
              </div>
            </section>

            {/* Liens hypertextes */}
            <section className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">5. Liens Hypertextes</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <p>
                  Le site OPNSKIN peut contenir des liens vers d'autres sites. 
                  OPNSKIN n'exerce aucun contrôle sur ces sites et décline toute 
                  responsabilité quant à leur contenu.
                </p>
                <p>
                  L'établissement de liens vers le site OPNSKIN est autorisé 
                  sous réserve de l'accord préalable d'OPNSKIN.
                </p>
              </div>
            </section>

            {/* Cookies */}
            <section className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">6. Cookies</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <p>
                  Le site OPNSKIN utilise des cookies pour améliorer l'expérience 
                  utilisateur et assurer le bon fonctionnement du service.
                </p>
                <p>
                  La gestion des cookies est assurée par Axeptio, conformément 
                  au RGPD. Vous pouvez modifier vos préférences à tout moment.
                </p>
                <p>
                  Pour plus d'informations, consultez notre 
                  <a href="/privacy" className="text-opnskin-accent hover:underline ml-1">
                    Politique de Confidentialité
                  </a>.
                </p>
              </div>
            </section>

            {/* Responsabilité */}
            <section className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">7. Limitation de Responsabilité</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <p>
                  OPNSKIN s'efforce d'assurer l'exactitude des informations 
                  diffusées sur son site mais ne peut garantir qu'elles soient 
                  exemptes d'erreurs.
                </p>
                <p>
                  OPNSKIN ne saurait être tenue responsable des dommages directs 
                  ou indirects résultant de l'utilisation du site.
                </p>
                <p>
                  OPNSKIN ne peut être tenue responsable des fluctuations de prix 
                  des skins ou des pertes liées aux transactions utilisateur.
                </p>
              </div>
            </section>

            {/* Droit applicable */}
            <section className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">8. Droit Applicable</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <p>
                  Les présentes mentions légales sont régies par le droit français. 
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
                <Mail className="w-6 h-6 text-opnskin-accent" />
                <h2 className="text-2xl font-bold text-opnskin-text-primary">9. Contact</h2>
              </div>
              <div className="text-opnskin-text-secondary space-y-4">
                <p>
                  Pour toute question concernant ces mentions légales :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Email : legal@opnskin.com</li>
                  <li>Support : support@opnskin.com</li>
                  <li>Adresse : [Adresse complète]</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 