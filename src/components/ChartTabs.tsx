"use client";

import { useState } from "react";
import ScoreChart from "./ScoreChart";
import HandicapChart from "./HandicapChart";
import { Round } from "@/lib/types";

interface ChartTabsProps {
  rounds: Round[];
}

const tabs = ["Score Progress", "Handicap Index"] as const;
type Tab = (typeof tabs)[number];

export default function ChartTabs({ rounds }: ChartTabsProps) {
  const [active, setActive] = useState<Tab>("Score Progress");

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              active === tab
                ? "bg-green-600 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {active === "Score Progress" ? (
        <ScoreChart rounds={rounds} />
      ) : (
        <HandicapChart rounds={rounds} />
      )}
    </div>
  );
}
