import React from "react";
import type { LucideIcon } from "lucide-react";

import styles from "@/styles/FeatureList.module.css";

export interface FeatureItem {
  title: string;
  desc: string;
  icon: LucideIcon;
}

const FeatureList = ({ features }: { features: FeatureItem[] }) => {
  return (
    <div className={styles.container}>
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div
            key={feature.title}
            className={`${styles.featureItem} ${index === 1
                ? styles.featureItemMiddle
                : ""
              }`}
          >
            <Icon className={styles.icon} />
            <h3 className={styles.title}>
              {feature.title}
            </h3>
            <p className={styles.desc}>
              {feature.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default FeatureList;
