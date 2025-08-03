"use client";
import { usePingPresence } from '@/app/hooks/use-ping-presence';

export default function UserPresencePinger() {
  usePingPresence();
  return null;
} 