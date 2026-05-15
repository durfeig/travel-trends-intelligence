"use client";

import { COUNTRY_NAMES } from "@/lib/supabase";

interface Props {
  selected: string;
  onChange: (geo: string) => void;
}

export default function CountrySelector({ selected, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selected === ""
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        Todos los países
      </button>
      {Object.entries(COUNTRY_NAMES).map(([geo, name]) => (
        <button
          key={geo}
          onClick={() => onChange(geo)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === geo
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
