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
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <div className={`${styles.iconWrapper} ${colorClass}`}>
          <Icon className={styles.icon} />
        </div>
      </div>
      <p className={styles.value}>{value}</p>
      <p className={styles.description}>{description}</p>
    </div>
  );
};

export default StatCard;