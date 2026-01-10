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
    /* Responsive Grid:
       - grid-cols-1 (Mobile): Stack vertically
       - md:grid-cols-3 (Desktop): 3 columns side-by-side
       - gap-6: Consistent spacing
    */
    <div className={`${styles.container} grid grid-cols-1 md:grid-cols-3 gap-6`}>
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div
            key={feature.title}
            className={`${styles.featureItem} flex flex-col items-center text-center p-4`}
          >
            {/* Icon Wrapper */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-slate-800 rounded-full">
              <Icon className={`${styles.icon} w-6 h-6 md:w-8 md:h-8 text-blue-600 dark:text-cyan-400`} />
            </div>
            
            <h3 className={`${styles.title} text-lg md:text-xl font-bold mb-2 text-gray-900 dark:text-white`}>
              {feature.title}
            </h3>
            
            <p className={`${styles.desc} text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed`}>
              {feature.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default FeatureList;