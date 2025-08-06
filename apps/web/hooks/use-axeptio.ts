'use client';

import { useState, useEffect } from 'react';
import { AxeptioChoices } from '@/lib/axeptio';

export const useAxeptio = () => {
  const [choices, setChoices] = useState<AxeptioChoices | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Attendre qu'Axeptio soit chargé
    const checkAxeptio = () => {
      if (typeof window !== 'undefined' && window._axcb) {
        setIsLoaded(true);
        
        // Écouter les changements de choix
        window._axcb.push(function(axeptio: any) {
          axeptio.on("cookies:complete", function(newChoices: AxeptioChoices) {
            console.log('🍪 Hook - Nouveaux choix détectés:', newChoices);
            setChoices(newChoices);
          });
        });
      } else {
        // Réessayer dans 100ms si Axeptio n'est pas encore chargé
        setTimeout(checkAxeptio, 100);
      }
    };

    checkAxeptio();
  }, []);

  // Fonction pour ouvrir les préférences de cookies
  const openPreferences = () => {
    if (typeof window !== 'undefined' && window.openAxeptioCookies) {
      window.openAxeptioCookies();
    }
  };

  // Fonction pour vérifier si un type de cookie est accepté
  const isAccepted = (type: string): boolean => {
    return choices ? choices[type] === true : false;
  };

  // Fonction pour obtenir tous les choix
  const getChoices = (): AxeptioChoices | null => {
    return choices;
  };

  return {
    choices,
    isLoaded,
    openPreferences,
    isAccepted,
    getChoices,
  };
}; 