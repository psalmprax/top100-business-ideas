import { Link } from "wouter";
import {
  Briefcase,
  Download,
  Smartphone,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";

export function WorkflowHeader({
  isDemo,
  onDownloadPDF,
  onDelegateTask,
  sdkZip,
}: {
  isDemo: boolean;
  onDownloadPDF: (filename: string, content: string) => void;
  onDelegateTask: () => void;
  sdkZip: string;
}) {
  return (
    <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {isDemo && (
              <Link href="/">
                <Button variant="ghost" size="sm">
                  ← Back
                </Button>
              </Link>
            )}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-product-title text-white text-xl">
                  WorkflowBot <span>PRO</span>
                </h1>
                <p className="text-feature text-muted-foreground">
                  Autonomous Freelance Engine
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex border-indigo-200"
              onClick={() => onDownloadPDF("workflowbot-sdk-v1.zip", sdkZip)}
            >
              <Download className="w-4 h-4 mr-2 text-indigo-600" />
              SDK
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex border-indigo-200"
              onClick={() => onDownloadPDF("workflowbot-assistant.apk", sdkZip)}
            >
              <Smartphone className="w-4 h-4 mr-2 text-indigo-600" />
              App
            </Button>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-caption-premium h-9 px-6 shadow-lg shadow-indigo-600/20"
              onClick={onDelegateTask}
            >
              <Plus className="w-4 h-4 mr-2" /> Delegate Task
            </Button>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
