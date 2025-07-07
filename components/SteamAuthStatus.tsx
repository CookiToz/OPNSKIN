'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useUser } from "@/components/UserProvider";

export default function SteamAuthStatus() {
  const { user, isLoading, isError, refetch } = useUser();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleLogout = () => {
    fetch('/api/logout').then(() => {
      refetch();
      window.location.reload();
    });
  };

  if (isLoading) {
    return <div className="text-opnskin-primary animate-pulse">Chargement…</div>;
  }
  if (isError) {
    return <div className="text-red-500">Erreur de connexion</div>;
  }
  if (!user || !user.loggedIn) {
    return (
      <button
        onClick={() => {
          setIsRedirecting(true);
          window.location.href = '/api/auth/steam';
        }}
        className="btn-opnskin-secondary flex items-center gap-2"
        disabled={isRedirecting}
      >
        <img
          src="/icons8-steam-128.png"
          alt="Steam"
          className="w-6 h-6 object-contain"
        />
        {isRedirecting ? 'Redirection…' : 'Connecter Steam'}
      </button>
    );
  }
  return (
    <div className="flex items-center space-x-4">
      <Image
        src={user.avatar || "/logo-OPNSKIN.png"}
        alt="Avatar Steam"
        width={40}
        height={40}
        className="rounded-full border border-opnskin-bg-secondary"
      />
      <span className="text-opnskin-text-primary font-satoshi-regular">{user.name}</span>
      <button
        onClick={handleLogout}
        className="text-red-400 border border-red-400 hover:bg-red-400/10 px-3 py-1 rounded transition-colors"
      >
        Déconnexion
      </button>
    </div>
  );
}
