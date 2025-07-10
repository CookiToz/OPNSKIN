"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { ChevronDown, ChevronUp, Mail, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AssistancePage() {
  const { t } = useTranslation('common');
  const [showForm, setShowForm] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const FAQS = [
    {
      question: t('assistance.faq1_q', 'Comment vendre un skin ?'),
      answer: t('assistance.faq1_a', "Allez dans votre inventaire, sélectionnez le skin que vous souhaitez vendre puis cliquez sur 'Vendre'. Vous pourrez fixer votre prix, choisir la devise et suivre l'état de votre annonce dans l'onglet 'Mes Annonces'. Une fois vendu, le montant sera crédité sur votre portefeuille OPNSKIN."),
    },
    {
      question: t('assistance.faq2_q', 'Quels moyens de paiement acceptez-vous ?'),
      answer: t('assistance.faq2_a', "Nous acceptons les paiements par carte bancaire (Visa, Mastercard), PayPal, ainsi que plusieurs cryptomonnaies (Bitcoin, Ethereum, Solana, etc.). Toutes les transactions sont sécurisées et vos informations restent confidentielles."),
    },
    {
      question: t('assistance.faq3_q', 'Combien de temps pour recevoir une réponse ?'),
      answer: t('assistance.faq3_a', "Notre équipe d'assistance s'engage à répondre à toutes les demandes sous 24h à 48h. En période de forte affluence, ce délai peut exceptionnellement être allongé, mais nous faisons toujours le maximum pour vous répondre rapidement."),
    },
    {
      question: t('assistance.faq4_q', 'Comment assurer la sécurité de mes transactions ?'),
      answer: t('assistance.faq4_a', "Toutes les transactions sur OPNSKIN sont protégées par des protocoles de sécurité avancés. Nous ne partageons jamais vos données personnelles et utilisons des systèmes de vérification pour éviter toute tentative de fraude. N'hésitez pas à activer l'authentification à deux facteurs sur votre compte Steam pour une sécurité renforcée."),
    },
    {
      question: t('assistance.faq5_q', 'Que faire si je rencontre un problème lors d\'un achat ou d\'une vente ?'),
      answer: t('assistance.faq5_a', "Si vous rencontrez un souci (paiement non reçu, skin non livré, etc.), contactez-nous via le formulaire d'assistance ci-dessous en précisant l'objet et le détail du problème. Notre équipe analysera votre dossier et vous tiendra informé par email dans les plus brefs délais."),
    },
    {
      question: t('assistance.faq6_q', 'Puis-je annuler une transaction ?'),
      answer: t('assistance.faq6_a', "Une fois une transaction validée et le skin transféré, il n'est plus possible de l'annuler. Si la transaction n'a pas encore été finalisée, contactez rapidement l'assistance pour voir si une solution est possible."),
    },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici tu pourrais envoyer la requête à une API
    setSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-opnskin-bg-primary py-6 md:py-10 px-2 md:px-4">
      <Card className="w-full max-w-2xl mb-6 md:mb-8 bg-opnskin-bg-card border-opnskin-bg-secondary">
        <CardContent className="py-4 md:py-6">
          <h1 className="text-2xl md:text-3xl font-bold font-rajdhani text-opnskin-primary mb-4 md:mb-6">{t('assistance.title', 'Assistance & FAQ')}</h1>
          <div className="space-y-3 md:space-y-4">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="border-b border-opnskin-bg-secondary pb-2">
                <button
                  className="flex items-center w-full text-left text-base md:text-lg font-semibold text-opnskin-text-primary focus:outline-none"
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                >
                  {faq.question}
                  {faqOpen === idx ? (
                    <ChevronUp className="ml-auto w-5 h-5 text-opnskin-primary" />
                  ) : (
                    <ChevronDown className="ml-auto w-5 h-5 text-opnskin-primary" />
                  )}
                </button>
                {faqOpen === idx && (
                  <div className="mt-2 text-opnskin-text-secondary text-sm md:text-base">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {!showForm && !sent && (
        <Button className="btn-opnskin mb-6 md:mb-8 w-full max-w-2xl text-base md:text-lg py-3 md:py-4" size="lg" onClick={() => setShowForm(true)}>
          <Mail className="w-5 h-5 mr-2" /> {t('assistance.contact_btn', "Contacter l'assistance")}
        </Button>
      )}

      {showForm && !sent && (
        <Card className="w-full max-w-2xl bg-opnskin-bg-card border-opnskin-bg-secondary mb-6 md:mb-8">
          <CardContent className="py-4 md:py-6">
            <h2 className="text-lg md:text-xl font-bold font-rajdhani text-opnskin-primary mb-3 md:mb-4">{t('assistance.form_title', 'Formulaire de contact')}</h2>
            <form onSubmit={handleSend} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs md:text-sm text-opnskin-text-secondary mb-1">{t('assistance.form_subject', 'Objet')}</label>
                <Input
                  type="text"
                  placeholder={t('assistance.form_subject_placeholder', 'Sujet de votre demande')}
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                  className="bg-opnskin-bg-secondary border-opnskin-bg-secondary text-opnskin-text-primary"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-opnskin-text-secondary mb-1">{t('assistance.form_message', 'Votre message')}</label>
                <Textarea
                  placeholder={t('assistance.form_message_placeholder', 'Expliquez votre problème...')}
                  value={message}
                  onChange={e => {
                    if (e.target.value.length <= 350) setMessage(e.target.value);
                  }}
                  required
                  className="bg-opnskin-bg-secondary border-opnskin-bg-secondary text-opnskin-text-primary"
                  rows={5}
                />
                <div className="text-xs text-opnskin-text-secondary text-right mt-1">{message.length}/350 {t('assistance.form_chars', 'caractères')}</div>
              </div>
              <div>
                <label className="block text-xs md:text-sm text-opnskin-text-secondary mb-1">{t('assistance.form_email', 'Votre email')}</label>
                <Input
                  type="email"
                  placeholder={t('assistance.form_email_placeholder', 'votre@email.com')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="bg-opnskin-bg-secondary border-opnskin-bg-secondary text-opnskin-text-primary"
                />
              </div>
              <Button type="submit" className="btn-opnskin w-full flex items-center justify-center mt-2 text-base md:text-lg py-3 md:py-4">
                <Send className="w-4 h-4 mr-2" /> {t('assistance.form_send', 'Envoyer')}
              </Button>
            </form>
            <div className="text-xs md:text-sm text-opnskin-text-secondary mt-4 text-center">
              {t('assistance.form_delay', 'Nous répondons sous 24h-48h.')}
            </div>
          </CardContent>
        </Card>
      )}

      {sent && (
        <Card className="w-full max-w-2xl bg-opnskin-bg-card border-opnskin-bg-secondary">
          <CardContent className="py-6 md:py-8 flex flex-col items-center">
            <Badge className="bg-opnskin-accent/10 text-opnskin-accent border-opnskin-accent/30 mb-3 md:mb-4 text-base md:text-lg">{t('assistance.form_sent_badge', 'Message envoyé !')}</Badge>
            <div className="text-opnskin-text-primary text-base md:text-lg mb-2">{t('assistance.form_sent_thanks', 'Merci pour votre message.')}</div>
            <div className="text-opnskin-text-secondary text-xs md:text-sm text-center">{t('assistance.form_sent_info', "Notre équipe vous répondra sous 24h-48h à l'adresse indiquée.")}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 