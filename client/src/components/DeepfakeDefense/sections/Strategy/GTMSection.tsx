import * as React from "react";

export function GTMSection() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="text-center p-4 rounded-lg bg-blue-500/10">
        <div className="text-2xl font-bold text-blue-500">40%</div>
        <div className="text-sm text-muted-foreground">Direct Outbound</div>
      </div>
      <div className="text-center p-4 rounded-lg bg-purple-500/10">
        <div className="text-2xl font-bold text-purple-500">35%</div>
        <div className="text-sm text-muted-foreground">Private Dinners</div>
      </div>
      <div className="text-center p-4 rounded-lg bg-green-500/10">
        <div className="text-2xl font-bold text-green-500">20%</div>
        <div className="text-sm text-muted-foreground">ERP Partners</div>
      </div>
      <div className="text-center p-4 rounded-lg bg-orange-500/10">
        <div className="text-2xl font-bold text-orange-500">5%</div>
        <div className="text-sm text-muted-foreground">Events</div>
      </div>
    </div>
  );
}
