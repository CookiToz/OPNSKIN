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
        className="bg-opnskin-blue hover:bg-opnskin-blue/80 rounded-full p-2 flex items-center justify-center shadow focus:outline-none focus:ring-2 focus:ring-opnskin-blue/60 transition-all w-10 h-10"
        aria-label="Se connecter avec Steam"
        disabled={isRedirecting}
      >
        <img
          src="/icons8-steam-128.png"
          alt="Steam"
          className="w-6 h-6 object-contain"
        />
      </button>
    );
  }
  return (
    <div className="flex items-center space-x-2">
      <Image
        src={user.avatar || "/logo-OPNSKIN.png"}
        alt="Avatar Steam"
        width={32}
        height={32}
        className="rounded-full border border-opnskin-bg-secondary"
      />
      <span className="text-opnskin-text-primary font-satoshi-regular text-sm truncate max-w-[80px]">{user.name}</span>
    </div>
  );
}
