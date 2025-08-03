"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, Settings, BarChart3, Shield, AlertTriangle } from 'lucide-react';
import { useUser } from "@/components/UserProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.replace("/"); // Redirige si pas admin
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-opnskin-bg-primary">
        <div className="text-opnskin-text-primary">Chargement...</div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null; // Sera redirigé
  }

  const adminModules = [
    {
      title: "Support & Tickets",
      description: "Gérer les tickets de support des utilisateurs",
      icon: MessageCircle,
      href: "/admin/support",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      features: ["Voir tous les tickets", "Répondre aux utilisateurs", "Marquer comme résolu", "Gérer les priorités"]
    },
    {
      title: "Gestion des Utilisateurs",
      description: "Administrer les comptes utilisateurs",
      icon: Users,
      href: "/admin/users",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      features: ["Voir tous les utilisateurs", "Modifier les rôles", "Suspendre des comptes", "Statistiques"]
    },
    {
      title: "Configuration",
      description: "Paramètres du système",
      icon: Settings,
      href: "/admin/settings",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      features: ["Paramètres généraux", "Configuration des paiements", "Sécurité", "Maintenance"]
    },
    {
      title: "Analytics & Rapports",
      description: "Statistiques et analyses",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      features: ["Statistiques de vente", "Rapports d'activité", "Métriques utilisateurs", "Performance"]
    },
    {
      title: "Sécurité",
      description: "Surveillance et sécurité",
      icon: Shield,
      href: "/admin/security",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      features: ["Logs de sécurité", "Détection de fraude", "Audit des actions", "Alertes"]
    },
    {
      title: "Maintenance",
      description: "Outils de maintenance",
      icon: AlertTriangle,
      href: "/admin/maintenance",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      features: ["Nettoyage des données", "Sauvegarde", "Mise à jour", "Diagnostic"]
    }
  ];

  return (
    <div className="min-h-screen bg-opnskin-bg-primary py-6 md:py-10 px-2 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-rajdhani text-opnskin-primary mb-2">
            Administration OPNSKIN
          </h1>
          <p className="text-opnskin-text-secondary">
            Bienvenue dans l'interface d'administration. Gérez votre plateforme depuis cet espace sécurisé.
          </p>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-opnskin-primary" />
                <div>
                  <div className="text-2xl font-bold text-opnskin-text-primary">0</div>
                  <div className="text-sm text-opnskin-text-secondary">Utilisateurs</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold text-opnskin-text-primary">0</div>
                  <div className="text-sm text-opnskin-text-secondary">Tickets ouverts</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-opnskin-text-primary">0</div>
                  <div className="text-sm text-opnskin-text-secondary">Transactions</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold text-opnskin-text-primary">0</div>
                  <div className="text-sm text-opnskin-text-secondary">Alertes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modules d'administration */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module, index) => (
            <Card key={index} className="bg-opnskin-bg-card border-opnskin-bg-secondary hover:border-opnskin-primary transition-all duration-200 hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${module.bgColor}`}>
                    <module.icon className={`w-6 h-6 ${module.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-rajdhani text-opnskin-text-primary">
                      {module.title}
                    </CardTitle>
                    <p className="text-sm text-opnskin-text-secondary mt-1">
                      {module.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 mb-4">
                  {module.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-opnskin-text-secondary">
                      <div className="w-1 h-1 bg-opnskin-primary rounded-full"></div>
                      {feature}
                    </div>
                  ))}
                </div>
                <Link href={module.href}>
                  <Button className="w-full btn-opnskin">
                    Accéder
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Informations de sécurité */}
        <Card className="mt-8 bg-opnskin-bg-card border-opnskin-bg-secondary">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-opnskin-text-primary">Sécurité</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-opnskin-text-secondary">
              <div>
                <strong>Session admin active</strong>
                <p>Connecté en tant qu'administrateur</p>
              </div>
              <div>
                <strong>Dernière connexion</strong>
                <p>{new Date().toLocaleString()}</p>
              </div>
              <div>
                <strong>Actions sécurisées</strong>
                <p>Toutes les actions sont loggées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 