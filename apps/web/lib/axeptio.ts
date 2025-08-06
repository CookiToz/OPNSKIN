// Types pour Axeptio
declare global {
  interface Window {
    axeptioSettings: {
      clientId: string;
      cookiesVersion: string;
      googleConsentMode: {
        default: {
          analytics_storage: string;
          ad_storage: string;
          ad_user_data: string;
          ad_personalization: string;
          wait_for_update: number;
        };
      };
    };
    openAxeptioCookies: () => void;
    _axcb: Array<(axeptio: any) => void>;
  }
}

// Types pour les choix utilisateur
export interface AxeptioChoices {
  [vendor: string]: boolean;
}

// Configuration Axeptio
export const axeptioConfig = {
  clientId: "689390aba5e74449ee8b9c58",
  cookiesVersion: "opnskin-fr-EU",
  googleConsentMode: {
    default: {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500
    }
  }
};

// Fonction pour ouvrir les préférences de cookies
export const openAxeptioCookies = () => {
  if (typeof window !== 'undefined' && window.openAxeptioCookies) {
    window.openAxeptioCookies();
  }
};

// Fonction pour gérer les choix utilisateur
export const handleCookieChoices = (choices: AxeptioChoices) => {
  console.log('🍪 Axeptio - Choix utilisateur:', choices);
  
  // Gestion des analytics
  if (choices.analytics) {
    console.log('✅ Analytics activés');
    // Ici vous pouvez activer Google Analytics, etc.
  } else {
    console.log('❌ Analytics désactivés');
    // Ici vous pouvez désactiver les analytics
  }
  
  // Gestion des publicités
  if (choices.advertising) {
    console.log('✅ Publicités activées');
    // Ici vous pouvez activer les publicités
  } else {
    console.log('❌ Publicités désactivées');
    // Ici vous pouvez désactiver les publicités
  }
  
  // Gestion des cookies tiers
  if (choices.third_party) {
    console.log('✅ Cookies tiers activés');
    // Ici vous pouvez activer les cookies tiers
  } else {
    console.log('❌ Cookies tiers désactivés');
    // Ici vous pouvez désactiver les cookies tiers
  }
  
  // Vous pouvez ajouter d'autres logiques selon vos besoins
  // Par exemple, sauvegarder les préférences en base de données
  // ou déclencher des événements personnalisés
};

// Fonction pour initialiser Axeptio avec gestion des événements
export const initAxeptio = () => {
  if (typeof window !== 'undefined') {
    // Configuration Axeptio
    window.axeptioSettings = axeptioConfig;
    
    // Initialisation du callback array
    if (typeof window._axcb === 'undefined') {
      window._axcb = [];
    }
    
    // Ajout du callback pour intercepter les événements
    window._axcb.push(function(axeptio: any) {
      // Événement déclenché quand un choix utilisateur est sauvegardé
      axeptio.on("cookies:complete", function(choices: AxeptioChoices) {
        console.log('🍪 Axeptio - Événement cookies:complete déclenché');
        handleCookieChoices(choices);
      });
      
      // Événement déclenché quand la bannière s'affiche
      axeptio.on("cookies:display", function() {
        console.log('🍪 Axeptio - Bannière cookies affichée');
      });
      
      // Événement déclenché quand l'utilisateur fait un choix
      axeptio.on("cookies:choice", function(choices: AxeptioChoices) {
        console.log('🍪 Axeptio - Choix utilisateur en cours:', choices);
      });
    });
    
    // Script Axeptio
    const script = document.createElement('script');
    script.async = true;
    script.src = '//static.axept.io/sdk.js';
    document.head.appendChild(script);
  }
}; 