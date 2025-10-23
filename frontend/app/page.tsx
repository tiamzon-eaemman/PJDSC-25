"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Map, Shield, Users, AlertTriangle } from "lucide-react";

export default function Home() {
  const [promptEvent, setPromptEvent] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: any) => {
      e.preventDefault();
      setPromptEvent(e);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!promptEvent) return;
    promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">SAGIP</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <a href="/gis">GIS Dashboard</a>
              </Button>
              {promptEvent && !installed && (
                <Button onClick={handleInstall} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="h-4 w-4 mr-2" />
                  Install App
                </Button>
              )}
              {installed && (
                <span className="text-green-600 font-medium">✓ Installed</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Synchronizing Action through Geohazard Information Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering barangay-level LGUs with data-driven disaster risk reduction 
            through modern technical approaches and real-time coordination.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Map className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Geohazard Maps</CardTitle>
              <CardDescription>
                Interactive maps with flood, landslide, and storm surge data
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Evacuation Coordination</CardTitle>
              <CardDescription>
                Synchronize evacuees and rescuers with optimal routes
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <AlertTriangle className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Early Warning System</CardTitle>
              <CardDescription>
                Real-time alerts and priority-based evacuation planning
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Community Resilience</CardTitle>
              <CardDescription>
                Build stronger, more prepared communities
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-gray-600 mb-6">
            Install the SAGIP PWA for offline access and native app experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleInstall} 
              disabled={!promptEvent || installed}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              {installed ? "App Installed" : "Install PWA"}
            </Button>
            <Button variant="outline" asChild>
              <a href="/gis">View GIS Dashboard</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/install">Learn More</a>
            </Button>
          </div>
          {!promptEvent && !installed && (
            <p className="text-sm text-gray-500 mt-4">
              Tip: Open this site in Chrome/Edge on Android to see the install prompt
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              SAGIP - Synchronizing Action through Geohazard Information Platform
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Built with Next.js PWA for offline disaster management
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
