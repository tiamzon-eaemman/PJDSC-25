'use client';

import React from "react";
import NavigationBar from "@/components/NavigationBar";

import { AlertTriangle, CloudRain, Shield } from "lucide-react";
import { useCurrentPlan } from '@/hooks/useApi';



export default function AlertsPage() {
  const { plan, loading } = useCurrentPlan();

  const alerts = React.useMemo(() => {
    if (!plan) return [];
    const base: Array<{id:string; type:string; title:string; message:string; timestamp:string; severity:string}> = [];
    if (plan.typhoon) {
      base.push({
        id: 'typhoon',
        type: 'weather',
        title: `${plan.typhoon.name} (Signal #${plan.typhoon.signal})`,
        message: `Wind ${plan.typhoon.wind_kmh}km/h, movement ${plan.typhoon.movement}`,
        timestamp: plan.updated_at || new Date().toISOString(),
        severity: plan.typhoon.signal >= 3 ? 'high' : plan.typhoon.signal >= 1 ? 'medium' : 'low',
      });
    }
    // Checklist items not completed could be shown as safety alerts
    (plan.checklist || []).filter(c => !c.completed).forEach(item => {
      base.push({
        id: `checklist-${item.id}`,
        type: 'safety',
        title: `Incomplete: ${item.text}`,
        message: 'Please complete preparedness item.',
        timestamp: plan.updated_at || new Date().toISOString(),
        severity: 'medium',
      });
    });
    return base;
  }, [plan]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-[#EF4444]";
      case "high":
        return "text-[#F97316]";
      case "medium":
        return "text-[#EAB308]";
      default:
        return "text-gray-400";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "emergency":
        return AlertTriangle;
      case "weather":
        return CloudRain;
      default:
        return Shield;
    }
  };

  const handleTabChange = (tabId: string) => {
    const routes: Record<string, string> = {
      alerts: "/",
      map: "/map",
      guide: "/info",
    };
    const target = routes[tabId] ?? "/";
    if (typeof window !== "undefined" && window.location.pathname !== target) {
      window.location.href = target;
    }
  };

  return (
    <main className="min-h-screen px-5 pb-20 pt-6 bg-[#0a0a0a] text-white">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-white">Emergency Alerts</h1>
          <p className="text-sm text-gray-400">
            Stay updated on important warnings and safety notifications.
          </p>
        </header>

        {/* Alert Cards */}
        <section className="space-y-4">
          {loading && (
            <div className="text-sm text-gray-400">Loading alerts...</div>
          )}
          {!loading && alerts.length === 0 && (
            <div className="text-sm text-gray-400">No active alerts.</div>
          )}
          {alerts.map((alert) => {
            const Icon = getIcon(alert.type);
            return (
              <div
                key={alert.id}
                className="p-4 bg-[#0E1A33] border border-[#1B2A4A] rounded-lg shadow-md hover:bg-[#13254A] transition-all"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-1.5 rounded-md bg-[#13254A] mt-0.5">
                    <Icon
                      className={`${getSeverityColor(alert.severity)}`}
                      size={18}
                      strokeWidth={2.2}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">
                      {alert.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-snug mt-1">
                      {alert.message}
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      {alert.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>

      {/* Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0">
        <NavigationBar
          activeTab="alerts"
          onTabChange={handleTabChange}
        />
      </div>
    </main>
  );
}
