"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Mail, Send } from 'lucide-react';

const FAQS = [
  {
    question: "Comment vendre un skin ?",
    answer: "Allez dans votre inventaire, sélectionnez un skin et cliquez sur 'Vendre'. Suivez les instructions pour fixer un prix.",
  },
  {
    question: "Quels moyens de paiement acceptez-vous ?",
    answer: "Nous acceptons les paiements par carte bancaire, PayPal et plusieurs cryptomonnaies.",
  },
  {
    question: "Combien de temps pour recevoir une réponse ?",
    answer: "Notre équipe répond généralement sous 24h à 48h.",
  },
];

export default function AssistancePage() {
  const [showForm, setShowForm] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici tu pourrais envoyer la requête à une API
    setSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-opnskin-bg-primary py-10 px-4">
      <Card className="w-full max-w-2xl mb-8 bg-opnskin-bg-card border-opnskin-bg-secondary">
        <CardContent className="py-6">
          <h1 className="text-3xl font-bold font-rajdhani text-opnskin-primary mb-6">Assistance & FAQ</h1>
          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="border-b border-opnskin-bg-secondary pb-2">
                <button
                  className="flex items-center w-full text-left text-lg font-semibold text-opnskin-text-primary focus:outline-none"
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
                  <div className="mt-2 text-opnskin-text-secondary text-base">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {!showForm && !sent && (
        <Button className="btn-opnskin mb-8" size="lg" onClick={() => setShowForm(true)}>
          <Mail className="w-5 h-5 mr-2" /> Contacter l'assistance
        </Button>
      )}

      {showForm && !sent && (
        <Card className="w-full max-w-2xl bg-opnskin-bg-card border-opnskin-bg-secondary mb-8">
          <CardContent className="py-6">
            <h2 className="text-xl font-bold font-rajdhani text-opnskin-primary mb-4">Formulaire de contact</h2>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm text-opnskin-text-secondary mb-1">Objet</label>
                <Input
                  type="text"
                  placeholder="Sujet de votre demande"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                  className="bg-opnskin-bg-secondary border-opnskin-bg-secondary text-opnskin-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-opnskin-text-secondary mb-1">Votre message</label>
                <Textarea
                  placeholder="Expliquez votre problème..."
                  value={message}
                  onChange={e => {
                    if (e.target.value.length <= 350) setMessage(e.target.value);
                  }}
                  required
                  className="bg-opnskin-bg-secondary border-opnskin-bg-secondary text-opnskin-text-primary"
                  rows={5}
                />
                <div className="text-xs text-opnskin-text-secondary text-right mt-1">{message.length}/350 caractères</div>
              </div>
              <div>
                <label className="block text-sm text-opnskin-text-secondary mb-1">Votre email</label>
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="bg-opnskin-bg-secondary border-opnskin-bg-secondary text-opnskin-text-primary"
                />
              </div>
              <Button type="submit" className="btn-opnskin w-full flex items-center justify-center mt-2">
                <Send className="w-4 h-4 mr-2" /> Envoyer
              </Button>
            </form>
            <div className="text-xs text-opnskin-text-secondary mt-4 text-center">
              Nous répondons sous 24h-48h.
            </div>
          </CardContent>
        </Card>
      )}

      {sent && (
        <Card className="w-full max-w-2xl bg-opnskin-bg-card border-opnskin-bg-secondary">
          <CardContent className="py-8 flex flex-col items-center">
            <Badge className="bg-opnskin-accent/10 text-opnskin-accent border-opnskin-accent/30 mb-4 text-lg">Message envoyé !</Badge>
            <div className="text-opnskin-text-primary text-lg mb-2">Merci pour votre message.</div>
            <div className="text-opnskin-text-secondary text-sm text-center">Notre équipe vous répondra sous 24h-48h à l'adresse indiquée.</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 