"use client";

import React from 'react';
import { Clock, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TransactionStatus = 'PENDING' | 'IN_ESCROW' | 'RELEASED' | 'REFUNDED' | 'CANCELLED';

interface TransactionStepperProps {
  status: TransactionStatus;
  className?: string;
}

const STEPS = [
  {
    key: 'PENDING' as const,
    label: 'En attente',
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
    pulseColor: 'bg-yellow-500',
  },
  {
    key: 'IN_ESCROW' as const,
    label: 'En escrow',
    icon: Lock,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    pulseColor: 'bg-blue-500',
  },
  {
    key: 'RELEASED' as const,
    label: 'Terminé',
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500',
    pulseColor: 'bg-green-500',
  },
];

const ERROR_STEP = {
  key: 'ERROR' as const,
  label: 'Erreur',
  icon: AlertCircle,
  color: 'text-red-500',
  bgColor: 'bg-red-500',
  pulseColor: 'bg-red-500',
};

export function TransactionStepper({ status, className }: TransactionStepperProps) {
  const currentStepIndex = STEPS.findIndex(step => step.key === status);
  const isError = status === 'REFUNDED' || status === 'CANCELLED';
  
  if (isError) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
              ERROR_STEP.bgColor,
              "border-white shadow-lg"
            )}>
              <ERROR_STEP.icon className="w-4 h-4 text-white" />
            </div>
            <div className={cn(
              "absolute inset-0 rounded-full animate-ping",
              ERROR_STEP.pulseColor,
              "opacity-75"
            )} />
          </div>
          <span className="text-sm font-medium text-red-500">
            {status === 'REFUNDED' ? 'Remboursé' : 'Annulé'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {STEPS.map((step, index) => {
        const isActive = index === currentStepIndex;
        const isCompleted = index < currentStepIndex;
        const isPending = index > currentStepIndex;
        
        return (
          <React.Fragment key={step.key}>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isCompleted && step.bgColor,
                  isActive && step.bgColor,
                  isPending && "bg-opnskin-bg-secondary border-opnskin-bg-secondary",
                  isCompleted && "border-white shadow-lg",
                  isActive && "border-white shadow-lg",
                  isPending && "border-opnskin-bg-secondary"
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <step.icon className={cn(
                      "w-4 h-4 transition-colors duration-300",
                      isActive && "text-white",
                      isPending && "text-opnskin-text-secondary"
                    )} />
                  )}
                </div>
                {isActive && (
                  <div className={cn(
                    "absolute inset-0 rounded-full animate-ping",
                    step.pulseColor,
                    "opacity-75"
                  )} />
                )}
              </div>
              <span className={cn(
                "text-sm font-medium transition-colors duration-300",
                isCompleted && step.color,
                isActive && step.color,
                isPending && "text-opnskin-text-secondary"
              )}>
                {step.label}
              </span>
            </div>
            
            {index < STEPS.length - 1 && (
              <div className={cn(
                "w-8 h-0.5 transition-all duration-300",
                isCompleted && step.bgColor,
                isPending && "bg-opnskin-bg-secondary"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
