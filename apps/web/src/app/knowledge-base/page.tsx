import { BookOpen } from "lucide-react";

export default function KnowledgeBasePage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
      </div>
      <div className="max-w-4xl">
        <p className="text-muted-foreground mb-4">
          Access documentation, guides, and resources for your organization.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Learn the basics of using the platform.
            </p>
            <div className="space-y-2">
              <div className="text-sm text-blue-600 hover:underline cursor-pointer">
                • Quick Start Guide
              </div>
              <div className="text-sm text-blue-600 hover:underline cursor-pointer">
                • Setup Instructions
              </div>
              <div className="text-sm text-blue-600 hover:underline cursor-pointer">
                • First Steps
              </div>
            </div>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">API Documentation</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Technical documentation for developers.
            </p>
            <div className="space-y-2">
              <div className="text-sm text-blue-600 hover:underline cursor-pointer">
                • REST API
              </div>
              <div className="text-sm text-blue-600 hover:underline cursor-pointer">
                • Authentication
              </div>
              <div className="text-sm text-blue-600 hover:underline cursor-pointer">
                • Examples
              </div>
            </div>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">FAQ</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Frequently asked questions and answers.
            </p>
            <div className="space-y-2">
              <div className="text-sm text-blue-600 hover:underline cursor-pointer">
                • Common Issues
              </div>
              <div className="text-sm text-blue-600 hover:underline cursor-pointer">
                • Troubleshooting
              </div>
              <div className="text-sm text-blue-600 hover:underline cursor-pointer">
                • Contact Support
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
