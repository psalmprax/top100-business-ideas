/**
 * Governance Audit Hub
 * Audit trails, approval workflows and governance controls
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Scale,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Users,
  Shield,
} from "lucide-react";
import { extendedApi } from "@/lib/api";
import { toast } from "sonner";

interface ApprovalRequest {
  id: string;
  title: string;
  requester: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reasoning?: string;
  quorum_required: number;
  approvals_received: number;
}

interface AuditLog {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  outcome: "success" | "failure" | "pending";
  details: string;
}

interface GovernanceStats {
  total_audits: number;
  pending_approvals: number;
  compliance_rate: number;
  quorum_achievement: number;
}

export default function GovernanceDashboard() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<GovernanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: "",
    reasoning: "",
    quorum: 2,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [requestsData, logsData, statsData] = await Promise.all([
        extendedApi.governance.getAuditQuorum(),
        extendedApi.governance.getAuditLogs(),
        extendedApi.governance.getGovernanceStats(),
      ]);
      setRequests(requestsData.requests || []);
      setAuditLogs(logsData || []);
      setStats(statsData);
    } catch (err) {
      toast.error("Failed to load governance data");
    } finally {
      setIsLoading(false);
    }
  }

  async function createRequest() {
    try {
      await extendedApi.governance.createApprovalRequest(newRequest);
      toast.success("Approval request created");
      setShowNewRequestDialog(false);
      setNewRequest({ title: "", reasoning: "", quorum: 2 });
      loadData();
    } catch (err) {
      toast.error("Failed to create request");
    }
  }

  async function processApproval(requestId: string, approved: boolean) {
    try {
      await extendedApi.governance.processApproval(
        requestId,
        approved,
        "Processed via dashboard"
      );
      toast.success(`Request ${approved ? "approved" : "rejected"}`);
      loadData();
    } catch (err) {
      toast.error("Failed to process approval");
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Governance Audit Hub</h1>
          <p className="text-muted-foreground">
            Approval workflows and audit trails
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog
            open={showNewRequestDialog}
            onOpenChange={setShowNewRequestDialog}
          >
            <DialogTrigger asChild>
              <Button>
                <FileCheck className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Approval Request</DialogTitle>
                <DialogDescription>
                  Submit a new request for governance approval
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Request Title</Label>
                  <Input
                    value={newRequest.title}
                    onChange={e =>
                      setNewRequest({ ...newRequest, title: e.target.value })
                    }
                    placeholder="e.g., Deploy model v2.3 to production"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reasoning</Label>
                  <Textarea
                    value={newRequest.reasoning}
                    onChange={e =>
                      setNewRequest({
                        ...newRequest,
                        reasoning: e.target.value,
                      })
                    }
                    placeholder="Explain why this change is required..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Required Quorum</Label>
                  <Select
                    value={newRequest.quorum.toString()}
                    onValueChange={v =>
                      setNewRequest({ ...newRequest, quorum: parseInt(v) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 approval</SelectItem>
                      <SelectItem value="2">2 approvals</SelectItem>
                      <SelectItem value="3">3 approvals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setShowNewRequestDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={createRequest}>Submit Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_audits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {stats?.pending_approvals}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Compliance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {stats?.compliance_rate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Quorum Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.quorum_achievement.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="approvals">
        <TabsList>
          <TabsTrigger value="approvals">Approval Requests</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="quorum">Quorum Status</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approval Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quorum</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map(request => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.title}
                      </TableCell>
                      <TableCell>{request.requester}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            request.status === "approved"
                              ? "default"
                              : request.status === "rejected"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {request.approvals_received}/{request.quorum_required}
                      </TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => processApproval(request.id, true)}
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => processApproval(request.id, false)}
                            >
                              <XCircle className="w-3 h-3 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {log.action}
                      </TableCell>
                      <TableCell>{log.actor}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.outcome === "success"
                              ? "default"
                              : log.outcome === "failure"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {log.outcome}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {log.details}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
