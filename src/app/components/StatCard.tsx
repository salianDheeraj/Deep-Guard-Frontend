// src/app/components/StatCard.tsx
"use client";

import React, { FC } from 'react';
import type { ComponentType } from 'react'; // Correct for React component type

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  Icon: ComponentType<any>; // Type for a React component
  colorClass: string;
}

const StatCard: FC<StatCardProps> = ({
  title,
  value,
  description,
  Icon,
  colorClass,
}) => {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
        <div className={`rounded-lg p-2 ${colorClass}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
};

export default StatCard;