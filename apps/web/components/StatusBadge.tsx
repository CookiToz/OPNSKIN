"use client";

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock, ShieldCheck, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TransactionStatus } from './TransactionStepper';

interface StatusBadgeProps {
  status: TransactionStatus;
  className?: string;
  showIcon?: boolean;
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'En attente',
    icon: Clock,
    color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    pulse: true,
  },
  IN_ESCROW: {
    label: 'En escrow',
    icon: ShieldCheck,
    color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    pulse: true,
  },
  RELEASED: {
    label: 'Terminée',
    icon: CheckCircle2,
    color: 'bg-green-500/15 text-green-400 border-green-500/30',
    pulse: false,
  },
  REFUNDED: {
    label: 'Remboursée',
    icon: XCircle,
    color: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    pulse: false,
  },
  CANCELLED: {
    label: 'Annulée',
    icon: AlertCircle,
    color: 'bg-red-500/15 text-red-400 border-red-500/30',
    pulse: false,
  },
};

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  
  if (!config) {
    return (
      <Badge variant="outline" className={cn("text-xs", className)}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge 
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-semibold transition-all duration-200",
        config.color,
        config.pulse && "animate-pulse",
        className
      )}
    >
      {showIcon && <config.icon className="w-3.5 h-3.5" />}
      {config.label}
    </Badge>
  );
}
