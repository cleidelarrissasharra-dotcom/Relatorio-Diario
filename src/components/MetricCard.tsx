/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  id: string;
  title: string;
  value: string | number;
  icon: LucideIcon;
  description: string;
  colorClass: string; // e.g. text-blue-500, bg-blue-50
}

export default function MetricCard({
  id,
  title,
  value,
  icon: Icon,
  description,
  colorClass
}: MetricCardProps) {
  return (
    <div
      id={id}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-200/80 flex items-start justify-between"
    >
      <div className="space-y-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="text-3xl font-bold font-sans text-gray-800 tracking-tight">
          {value}
        </div>
        <p className="text-xs text-gray-500 font-sans">
          {description}
        </p>
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
