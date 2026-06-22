/**
 * GraphQL Query Interface
 * Interactive GraphQL explorer for the AlphaHecta platform
 */

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Play, Copy, Database, BookOpen, History } from "lucide-react";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";

const SAMPLE_QUERIES = [
  {
    label: "All Agents",
    query: `query {
  agents {
    id
    name
    status
    daily_spend
    budget
  }
}`,
  },
  {
    label: "Compliance Checks",
    query: `query {
  complianceChecks {
    id
    type
    status
    score
    checked_at
  }
}`,
  },
  {
    label: "Deepfake Analyses",
    query: `query {
  deepfakeAnalyses {
    id
    media_type
    result
    confidence
    analysis_at
  }
}`,
  },
  {
    label: "User Stats",
    query: `query {
  trainingStats {
    total_modules
    total_enrolled
    completed
    completion_rate
  }
}`,
  },
];

export default function GraphQLInterface() {
  const [query, setQuery] = useState("");
  const [variables, setVariables] = useState("{}");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<
    Array<{ query: string; time: string }>
  >([]);

  const executeQuery = async () => {
    if (!query.trim()) {
      toast.error("Please enter a GraphQL query");
      return;
    }
    setIsLoading(true);
    try {
      let vars = {};
      try {
        vars = JSON.parse(variables);
      } catch {
        toast.error("Invalid JSON in variables");
        setIsLoading(false);
        return;
      }

      const res = await extendedApi.graphql(query, vars);
      setResult(JSON.stringify(res, null, 2));
      setHistory(prev =>
        [{ query, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 20)
      );
      toast.success("Query executed successfully");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Query failed";
      setResult(
        JSON.stringify({ error: message }, null, 2)
      );
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast.success("Result copied to clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-display-hero mb-2">GraphQL Explorer</h1>
          <p className="text-slate-400">
            Query the AlphaHecta platform using GraphQL
          </p>
        </div>

        <Tabs defaultValue="query" className="space-y-6">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="query">
              <Play className="w-4 h-4 mr-2" />
              Query
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="schema">
              <BookOpen className="w-4 h-4 mr-2" />
              Schema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="query" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Query Editor</CardTitle>
                    <CardDescription>Write your GraphQL query</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Query</Label>
                      <Textarea
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="font-mono text-sm bg-slate-900 border-slate-600 text-green-400 min-h-[200px]"
                        placeholder="query { ... }"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Variables (JSON)</Label>
                      <Textarea
                        value={variables}
                        onChange={e => setVariables(e.target.value)}
                        className="font-mono text-sm bg-slate-900 border-slate-600 text-blue-400 min-h-[80px]"
                        placeholder='{"key": "value"}'
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={executeQuery}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Play className="w-4 h-4 mr-2" />
                        )}
                        Execute
                      </Button>
                      {result && (
                        <Button variant="outline" onClick={copyResult}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {result && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Database className="w-5 h-5 text-emerald-400" />
                        Result
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="font-mono text-sm text-slate-300 bg-slate-900 p-4 rounded-lg overflow-auto max-h-[400px] whitespace-pre-wrap break-all">
                        {result}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Sample Queries</CardTitle>
                    <CardDescription>Click to load a query</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {SAMPLE_QUERIES.map(sq => (
                      <Button
                        key={sq.label}
                        variant="outline"
                        className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                        onClick={() => {
                          setQuery(sq.query);
                          setResult(null);
                        }}
                      >
                        {sq.label}
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Endpoint</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <code className="text-sm text-blue-400 bg-slate-900 px-3 py-2 rounded block">
                      /api/v1/graphql
                    </code>
                    <p className="text-xs text-slate-500 mt-2">
                      All queries are authenticated via JWT bearer token.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Query History</CardTitle>
                <CardDescription>Recent queries executed</CardDescription>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">
                    No queries yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {history.map((item, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-slate-700/30 border border-slate-600 cursor-pointer hover:bg-slate-700/50"
                        onClick={() => {
                          setQuery(item.query);
                          setResult(null);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <code className="text-sm text-blue-400 truncate max-w-[80%]">
                            {item.query.substring(0, 80)}...
                          </code>
                          <Badge variant="outline" className="text-xs">
                            {item.time}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schema">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Available Types</CardTitle>
                <CardDescription>GraphQL schema overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      type: "Agent",
                      fields: [
                        "id",
                        "name",
                        "status",
                        "daily_spend",
                        "budget",
                        "model",
                      ],
                    },
                    {
                      type: "ComplianceCheck",
                      fields: ["id", "type", "status", "score", "findings"],
                    },
                    {
                      type: "DeepfakeAnalysis",
                      fields: ["id", "media_type", "result", "confidence"],
                    },
                    {
                      type: "TrainingStats",
                      fields: [
                        "total_modules",
                        "total_enrolled",
                        "completed",
                        "completion_rate",
                      ],
                    },
                    {
                      type: "User",
                      fields: [
                        "id",
                        "email",
                        "name",
                        "role",
                        "allowedProducts",
                      ],
                    },
                    {
                      type: "Subscription",
                      fields: ["id", "plan", "status", "currentPeriodEnd"],
                    },
                  ].map(t => (
                    <div
                      key={t.type}
                      className="p-4 rounded-lg bg-slate-900 border border-slate-700"
                    >
                      <h3 className="text-sm font-semibold text-purple-400 mb-2">
                        {t.type}
                      </h3>
                      <div className="space-y-1">
                        {t.fields.map(f => (
                          <code
                            key={f}
                            className="text-xs text-slate-400 block"
                          >
                            {f}: String
                          </code>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
