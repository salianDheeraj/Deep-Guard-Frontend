import React from "react";
import type { LucideIcon } from "lucide-react";

export interface FeatureItem {
  title: string;
  desc: string;
  icon: LucideIcon;
}

const FeatureList = ({ features }: { features: FeatureItem[] }) => {
  return (
    <div className="flex justify-between mt-12">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div
            key={feature.title}
            className={`flex flex-col items-center w-[30%] p-4 ${
              index === 1
                ? "border-l border-r border-gray-100 dark:border-gray-700"
                : ""
            }`}
          >
            <Icon className="w-6 h-6 text-indigo-500 mb-3" />
            <h3 className="font-semibold text-gray-800 dark:text-white text-center mb-1">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {feature.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default FeatureList;
