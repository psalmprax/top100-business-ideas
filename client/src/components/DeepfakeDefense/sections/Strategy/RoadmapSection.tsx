import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RoadmapSection() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Q1: MVP - Hardware Signer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default">In Progress</Badge>
              <span>Go Backend FIDO Server</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Planned</Badge>
              <span>Biometric Pulse Protocol</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Planned</Badge>
              <span>Hardware Challenge API</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Q2: Growth - ERP Wedge</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Backlog</Badge>
              <span>SAP SuccessFactors Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Backlog</Badge>
              <span>Workday SSO Connector</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Backlog</Badge>
              <span>Salesforce AppExchange Listing</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Q3: Scale - Immune System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Backlog</Badge>
              <span>Autonomous Threat Response</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Backlog</Badge>
              <span>Cross-Region Failover Mesh</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Backlog</Badge>
              <span>Quantum-Resistant Templates</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Q4: Enterprise Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Backlog</Badge>
              <span>On-Prem Air-Gap Deployment</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Backlog</Badge>
              <span>FedRAMP Authorization</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Backlog</Badge>
              <span>24/7 SOC Integration</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
