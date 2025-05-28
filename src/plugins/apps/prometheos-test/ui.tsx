import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { Plugin } from "../../../plugins/types";
// Import the prometheos-client library
import { services } from "../../../prometheos-client";
import { manifest } from "./manifest";

const PrometheosTestComponent: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [appId, setAppId] = useState<string>("notepad");
  const [notificationMessage, setNotificationMessage] = useState<string>(
    "Hello from PrometheOS Test!"
  );
  const [dialogTitle, setDialogTitle] = useState<string>("Test Dialog");
  const [dialogDescription, setDialogDescription] = useState<string>(
    "This is a test dialog from PrometheOS Test App"
  );
  const [eventId, setEventId] = useState<string>("");
  const [timeout, setTimeout] = useState<number>(5000);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const setButtonLoading = (buttonId: string, loading: boolean) => {
    setIsLoading((prev) => ({ ...prev, [buttonId]: loading }));
  };

  const handleLaunchApp = async () => {
    if (!appId.trim()) {
      addLog("❌ Error: App ID cannot be empty");
      return;
    }

    setButtonLoading("launch", true);
    try {
      addLog(`🚀 Launching app: ${appId}`);
      const result = await services.launchApp({ appId: appId.trim() });
      addLog(`✅ Launch result: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(
        `❌ Launch error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setButtonLoading("launch", false);
    }
  };

  const handleKillApp = async () => {
    if (!appId.trim()) {
      addLog("❌ Error: App ID cannot be empty");
      return;
    }

    setButtonLoading("kill", true);
    try {
      addLog(`🔴 Killing app: ${appId}`);
      const result = await services.killApp({ appId: appId.trim() });
      addLog(`✅ Kill result: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(
        `❌ Kill error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setButtonLoading("kill", false);
    }
  };

  const handleRestartApp = async () => {
    if (!appId.trim()) {
      addLog("❌ Error: App ID cannot be empty");
      return;
    }

    setButtonLoading("restart", true);
    try {
      addLog(`🔄 Restarting app: ${appId}`);
      const result = await services.restart({ appId: appId.trim() });
      addLog(`✅ Restart result: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(
        `❌ Restart error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setButtonLoading("restart", false);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationMessage.trim()) {
      addLog("❌ Error: Notification message cannot be empty");
      return;
    }

    setButtonLoading("notify", true);
    try {
      addLog(`📱 Sending notification: ${notificationMessage}`);
      const result = await services.notify({
        message: notificationMessage.trim(),
        type: "radix", // You can change this to 'sonner' if you prefer
      });
      addLog(`✅ Notification result: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(
        `❌ Notification error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setButtonLoading("notify", false);
    }
  };

  const handleOpenDialog = async () => {
    if (!dialogTitle.trim()) {
      addLog("❌ Error: Dialog title cannot be empty");
      return;
    }

    setButtonLoading("dialog", true);
    try {
      addLog(`🔔 Opening dialog: ${dialogTitle}`);
      const result = await services.openDialog({
        title: dialogTitle.trim(),
        description: dialogDescription.trim() || undefined,
        confirmLabel: "Yes",
        cancelLabel: "No",
      });
      addLog(`✅ Dialog result: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(
        `❌ Dialog error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setButtonLoading("dialog", false);
    }
  };

  const handleListEvents = async () => {
    setButtonLoading("listEvents", true);
    try {
      addLog(`📋 Listing available events...`);
      const result = await services.listEvents();
      addLog(`✅ Events result: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(
        `❌ List events error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setButtonLoading("listEvents", false);
    }
  };

  const handleWaitForEvent = async () => {
    if (!eventId.trim()) {
      addLog("❌ Error: Event ID cannot be empty");
      return;
    }

    setButtonLoading("waitEvent", true);
    try {
      addLog(`⏳ Waiting for event: ${eventId} (timeout: ${timeout}ms)`);
      const result = await services.waitForEvent({
        eventId: eventId.trim(),
        timeout: timeout,
      });
      addLog(`✅ Event wait result: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(
        `❌ Wait for event error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setButtonLoading("waitEvent", false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="p-4 h-full flex flex-col gap-4 overflow-hidden">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-purple-600">
          PrometheOS Test App
        </h1>
        <p className="text-sm text-muted-foreground">
          Test the prometheos-client library functionality
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* App Launcher Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🚀 App Launcher</CardTitle>
              <CardDescription>Launch and kill applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="appId">App ID</Label>
                <Input
                  id="appId"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="e.g., notepad, calculator, browser"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleLaunchApp}
                  disabled={isLoading.launch}
                  className="flex-1"
                >
                  {isLoading.launch ? "Launching..." : "Launch App"}
                </Button>
                <Button
                  onClick={handleKillApp}
                  disabled={isLoading.kill}
                  variant="destructive"
                  className="flex-1"
                >
                  {isLoading.kill ? "Killing..." : "Kill App"}
                </Button>
                <Button
                  onClick={handleRestartApp}
                  disabled={isLoading.restart}
                  variant="outline"
                  className="flex-1"
                >
                  {isLoading.restart ? "Restarting..." : "Restart App"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📱 Notifications</CardTitle>
              <CardDescription>Send notification messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="message">Message</Label>
                <Input
                  id="message"
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Enter notification message"
                />
              </div>
              <Button
                onClick={handleSendNotification}
                disabled={isLoading.notify}
                className="w-full"
              >
                {isLoading.notify ? "Sending..." : "Send Notification"}
              </Button>
            </CardContent>
          </Card>

          {/* Dialog Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔔 Dialog</CardTitle>
              <CardDescription>Open confirmation dialogs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="dialogTitle">Title</Label>
                <Input
                  id="dialogTitle"
                  value={dialogTitle}
                  onChange={(e) => setDialogTitle(e.target.value)}
                  placeholder="Dialog title"
                />
              </div>
              <div>
                <Label htmlFor="dialogDescription">Description</Label>
                <Input
                  id="dialogDescription"
                  value={dialogDescription}
                  onChange={(e) => setDialogDescription(e.target.value)}
                  placeholder="Dialog description (optional)"
                />
              </div>
              <Button
                onClick={handleOpenDialog}
                disabled={isLoading.dialog}
                className="w-full"
              >
                {isLoading.dialog ? "Opening..." : "Open Dialog"}
              </Button>
            </CardContent>
          </Card>

          {/* Events Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⏳ Events</CardTitle>
              <CardDescription>List and wait for events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleListEvents}
                disabled={isLoading.listEvents}
                className="w-full"
                variant="outline"
              >
                {isLoading.listEvents ? "Loading..." : "List Available Events"}
              </Button>

              <Separator />

              <div>
                <Label htmlFor="eventId">Event ID</Label>
                <Input
                  id="eventId"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  placeholder="e.g., plugin:openWindow"
                />
              </div>
              <div>
                <Label htmlFor="timeout">Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeout(Number(e.target.value))}
                  placeholder="5000"
                />
              </div>
              <Button
                onClick={handleWaitForEvent}
                disabled={isLoading.waitEvent}
                className="w-full"
              >
                {isLoading.waitEvent ? "Waiting..." : "Wait for Event"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Logs Section */}
      <Card className="flex-shrink-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">📋 Activity Logs</CardTitle>
            <Button onClick={clearLogs} variant="outline" size="sm">
              Clear Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={logs.join("\n")}
            readOnly
            className="h-32 font-mono text-sm resize-none"
            placeholder="Activity logs will appear here..."
          />
        </CardContent>
      </Card>
    </div>
  );
};

// Add a new test component that demonstrates the unified API
const UnifiedAPIDemo: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  };

  const runUnifiedAPIDemo = async () => {
    addResult("🚀 Starting Unified API Demo from TypeScript");

    try {
      // Test launcher API
      addResult("📱 Testing services.notify()...");
      await services.notify({
        message: "TypeScript Unified Client Test!",
        type: "radix",
      });
      addResult("✅ Launcher notification sent successfully");

      // Test dialog API
      addResult("💬 Testing services.openDialog()...");
      const dialogResult = await services.openDialog({
        title: "TypeScript Unified API Test",
        description: "This demonstrates the TypeScript side of the unified API",
        confirmLabel: "Awesome!",
        cancelLabel: "Close",
      });
      addResult(`✅ Dialog result: ${JSON.stringify(dialogResult)}`);

      // Test event API
      addResult("📋 Testing services.listEvents()...");
      const events = await services.listEvents();
      addResult(`✅ Events retrieved: ${JSON.stringify(events)}`);

      addResult("🎉 TypeScript Unified API Demo completed successfully!");
    } catch (error) {
      addResult(
        `❌ Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>🔗 Unified API Demo</CardTitle>
        <CardDescription>
          Demonstrates the unified PrometheOS client working in TypeScript
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={runUnifiedAPIDemo} className="w-full">
            🚀 Run TypeScript Unified API Demo
          </Button>

          {testResults.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Test Results:</h4>
              <div className="space-y-1 text-sm font-mono">
                {testResults.map((result, index) => (
                  <div key={index} className="text-xs">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PrometheosTestPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("PrometheOS Test plugin initialized");
  },
  render: () => {
    return (
      <div>
        <PrometheosTestComponent />
        <UnifiedAPIDemo />
      </div>
    );
  },
};

export default PrometheosTestPlugin;
