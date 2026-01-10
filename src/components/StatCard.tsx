"use client";

import React, { FC } from 'react';
import type { ComponentType } from 'react';

import styles from '@/styles/StatCard.module.css';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  Icon: ComponentType<any>;
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
    /* Responsive Container: p-4 on mobile, p-6 on desktop */
    <div className={`${styles.card} p-4 md:p-6 flex flex-col justify-between h-full`}>
      
      <div className={styles.header}>
        {/* Responsive Title: text-sm on mobile, text-base on desktop */}
        <h3 className={`${styles.title} text-sm md:text-base font-medium text-gray-500 dark:text-gray-400`}>
          {title}
        </h3>
        
        {/* Responsive Icon Wrapper: w-8/h-8 on mobile, w-10/h-10 on desktop */}
        <div className={`${styles.iconWrapper} ${colorClass} p-2 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center`}>
          <Icon className={`${styles.icon} w-4 h-4 md:w-5 md:h-5`} />
        </div>
      </div>

      <div className="mt-2 md:mt-4">
        {/* Responsive Value: text-2xl on mobile, text-3xl on desktop */}
        <p className={`${styles.value} text-2xl md:text-3xl font-bold text-gray-900 dark:text-white`}>
          {value}
        </p>
        
        {/* Responsive Description: text-xs on mobile, text-sm on desktop */}
        <p className={`${styles.description} text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1`}>
          {description}
        </p>
      </div>
    </div>
  );
};

export default StatCard;