import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function ComplianceScoreCard({
  score,
  title,
}: {
  score: number;
  title: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-stat text-white tabular-nums">{score}%</div>
        <div className="text-stat-label mt-0.5">{title}</div>
        <Progress value={score} className="mt-2 h-2" />
      </CardContent>
    </Card>
  );
}
