import { AdvisoryGroup } from "@/lib/types";
import AdvisoryCard from "./AdvisoryCard";

interface AdvisorySectionProps {
  group: AdvisoryGroup;
}

export default function AdvisorySection({ group }: AdvisorySectionProps) {
  return (
    <div className="mb-6">
      <h2 className="text-white text-lg font-semibold mb-3">
        {group.date}
      </h2>
      <div className="space-y-3">
        {group.advisories.map((advisory) => (
          <AdvisoryCard key={advisory.id} advisory={advisory} />
        ))}
      </div>
    </div>
  );
}
