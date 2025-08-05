import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  variant?: 'default' | 'sparkle' | 'pulse';
  className?: string;
}

export function Loading({ 
  size = 'md', 
  text = 'Chargement...', 
  variant = 'default',
  className = '' 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (variant === 'sparkle') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
        <div className="relative">
          <Sparkles className={`${sizeClasses[size]} text-opnskin-primary animate-pulse`} />
          <div className="absolute inset-0">
            <Sparkles className={`${sizeClasses[size]} text-opnskin-accent animate-ping`} />
          </div>
        </div>
        {text && (
          <p className={`${textSizes[size]} text-opnskin-text-secondary animate-pulse`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`${sizeClasses[size]} bg-opnskin-primary rounded-full animate-pulse`}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        {text && (
          <p className={`${textSizes[size]} text-opnskin-text-secondary animate-pulse`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-opnskin-primary animate-spin`} />
      {text && (
        <p className={`${textSizes[size]} text-opnskin-text-secondary animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
}

// Composant de chargement pour les pages
export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-opnskin-bg-primary">
      <Loading 
        size="lg" 
        text="Chargement d'OPNSKIN..." 
        variant="sparkle"
        className="space-y-6"
      />
    </div>
  );
}

// Composant de chargement pour les sections
export function SectionLoading() {
  return (
    <div className="py-12 flex items-center justify-center">
      <Loading 
        size="md" 
        text="Chargement..." 
        variant="pulse"
      />
    </div>
  );
}

// Composant de chargement pour les cartes
export function CardLoading() {
  return (
    <div className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6">
      <div className="animate-pulse space-y-4">
        <div className="aspect-square bg-opnskin-bg-secondary rounded-lg"></div>
        <div className="space-y-2">
          <div className="h-4 bg-opnskin-bg-secondary rounded w-3/4"></div>
          <div className="h-3 bg-opnskin-bg-secondary rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

// Composant de chargement pour les grilles
export function GridLoading({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardLoading key={i} />
      ))}
    </div>
  );
} 

// Composant de chargement non-bloquant
export function NonBlockingLoading() {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-6 shadow-xl">
        <Loading size="md" text="Chargement..." variant="sparkle" />
      </div>
    </div>
  );
}

// Composant de chargement inline
export function InlineLoading({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div className="w-4 h-4 border-2 border-opnskin-primary border-t-transparent rounded-full animate-spin"></div>
      <span className="text-sm text-opnskin-text-secondary">Chargement...</span>
    </div>
  );
} 