import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export const IntegrationsDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Integrations
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Calendar Integrations</DialogTitle>
          <DialogDescription>
            Connect your favorite calendar services for bi-directional sync.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-red-600">G</span>
                </div>
                <div>
                  <h4 className="font-medium">Gmail Calendar</h4>
                  <p className="text-sm text-muted-foreground">
                    Sync with Google Calendar
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">O</span>
                </div>
                <div>
                  <h4 className="font-medium">Outlook</h4>
                  <p className="text-sm text-muted-foreground">
                    Sync with Microsoft Outlook
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
