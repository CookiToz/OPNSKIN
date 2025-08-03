import { toast } from '@/hooks/use-toast';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export class AppError extends Error {
  public code?: string;
  public status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Gestionnaire d'erreurs global pour les appels API
 */
export const handleApiError = async (response: Response): Promise<never> => {
  let error: ApiError;

  try {
    const data = await response.json();
    error = {
      message: data.error || data.message || 'Une erreur est survenue',
      code: data.code,
      status: response.status,
    };
  } catch {
    error = {
      message: 'Erreur de connexion au serveur',
      status: response.status,
    };
  }

  // Afficher l'erreur à l'utilisateur
  toast({
    title: 'Erreur',
    description: error.message,
    variant: 'destructive',
  });

  throw new AppError(error.message, error.code, error.status);
};

/**
 * Wrapper pour les appels API avec gestion d'erreurs
 */
export const apiCall = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    // Erreur réseau
    const networkError = new AppError(
      'Erreur de connexion. Vérifiez votre connexion internet.',
      'NETWORK_ERROR'
    );

    toast({
      title: 'Erreur de connexion',
      description: networkError.message,
      variant: 'destructive',
    });

    throw networkError;
  }
};

/**
 * Gestionnaire d'erreurs pour les composants React
 */
export const handleComponentError = (error: unknown, context?: string) => {
  console.error(`Erreur dans ${context || 'composant'}:`, error);

  let message = 'Une erreur inattendue est survenue';

  if (error instanceof AppError) {
    message = error.message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  toast({
    title: 'Erreur',
    description: message,
    variant: 'destructive',
  });
};

/**
 * Hook pour gérer les erreurs dans les composants
 */
export const useErrorHandler = () => {
  return {
    handleError: handleComponentError,
    apiCall,
  };
}; 