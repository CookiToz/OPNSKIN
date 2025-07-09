"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Bell, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function Notifications() {
  const { t } = useTranslation("common");
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications`);
      const data = await response.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos notifications.",
        variant: "destructive",
      });
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [toast]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        // Mettre à jour l'état local
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de marquer la notification comme lue.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue.",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      'OFFER_CREATED': '📝',
      'OFFER_SOLD': '💰',
      'OFFRE_CANCELLED': '❌',
      'TRANSACTION_STARTED': '🔄',
      'TRANSACTION_COMPLETED': '✅',
      'REMINDER': '⏰',
      'PENALTY': '⚠️',
      'CONFIRM': '✅',
    };
    return iconMap[type] || '📢';
  };

  const getNotificationColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'OFFER_CREATED': 'bg-blue-500',
      'OFFER_SOLD': 'bg-green-500',
      'OFFRE_CANCELLED': 'bg-red-500',
      'TRANSACTION_STARTED': 'bg-yellow-500',
      'TRANSACTION_COMPLETED': 'bg-green-500',
      'REMINDER': 'bg-orange-500',
      'PENALTY': 'bg-red-500',
      'CONFIRM': 'bg-green-500',
    };
    return colorMap[type] || 'bg-gray-500';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-3 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/profile">
            <Button variant="outline" size="sm" className="border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <Bell className="h-8 w-8 text-opnskin-primary" />
          <h1 className="text-2xl md:text-3xl font-bold font-rajdhani text-opnskin-text-primary">
            Notifications
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </h1>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-opnskin-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <Bell className="h-16 w-16 text-opnskin-text-secondary/30" />
            <div className="text-center">
              <h2 className="text-xl font-bold font-satoshi-bold text-opnskin-text-primary mb-2">
                Aucune notification
              </h2>
              <p className="text-opnskin-text-secondary mb-4">
                Vous n'avez pas encore reçu de notifications.
              </p>
              <Link href="/marketplace">
                <Button className="btn-opnskin">
                  Aller au marketplace
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`bg-opnskin-bg-card border-opnskin-bg-secondary ${
                  !notification.read ? 'border-l-4 border-l-opnskin-primary' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-opnskin-text-primary">
                          {notification.title}
                        </h3>
                        <Badge className={`${getNotificationColor(notification.type)} text-white text-xs`}>
                          {notification.type}
                        </Badge>
                        {!notification.read && (
                          <Badge className="bg-opnskin-primary text-white text-xs">
                            Nouveau
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-opnskin-text-secondary mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-opnskin-text-secondary">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                        
                        {!notification.read && (
                          <Button
                            onClick={() => handleMarkAsRead(notification.id)}
                            variant="outline"
                            size="sm"
                            className="border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Marquer comme lue
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 