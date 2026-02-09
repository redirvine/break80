"use client";

import { Tee } from "@/lib/types";
import { useAuth } from "./AuthProvider";
import TeeRow from "./TeeRow";

export default function TeeTable({ tees }: { tees: Tee[] }) {
  const { user } = useAuth();

  if (tees.length === 0) return null;

  return (
    <div className="mt-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="pb-1 font-medium">Tee</th>
            <th className="pb-1 font-medium">Yardage</th>
            <th className="pb-1 font-medium">Par</th>
            <th className="pb-1 font-medium">Slope</th>
            <th className="pb-1 font-medium">Rating</th>
            {user && <th className="pb-1 font-medium"></th>}
          </tr>
        </thead>
        <tbody>
          {tees.map((tee) => (
            <TeeRow key={tee.id} tee={tee} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
