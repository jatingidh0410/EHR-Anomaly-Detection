import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, Play, Pause, RotateCcw } from "lucide-react";
import { api } from "../services/api";

interface Threat {
  id: string;
  threat_type: string;
  confidence: number;
  timestamp: string;
  severity: "low" | "medium" | "high";
}

const Monitoring: React.FC = () => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [error, setError] = useState<string>("");
  const [isPolling, setIsPolling] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Fetch threats with timeout and error handling
   */
  const fetchThreats = async (signal?: AbortSignal) => {
    try {
      setError("");

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout (10s)")), 10000)
      );

      // Race between API call and timeout
      const response = (await Promise.race([
        api.threats(),
        timeoutPromise,
      ])) as any;

      // Safe data check
      const data = Array.isArray(response.data) ? response.data : [];
      setThreats(data.slice(0, 50)); // Keep only recent 50
      setLastUpdate(new Date());
    } catch (err: any) {
      // Don't show error on abort
      if (err.name !== "AbortError") {
        setError(err.message || "Failed to fetch threats");
      }
    }
  };

  /**
   * Setup polling
   */
  /**
   * Setup polling (Recursive setTimeout)
   */
  useEffect(() => {
    let isMounted = true;
    let timerId: ReturnType<typeof setTimeout>;

    const poll = async () => {
      if (!isPolling || !isMounted) return;

      await fetchThreats();

      if (isPolling && isMounted) {
        timerId = setTimeout(poll, 3000);
        pollIntervalRef.current = timerId as any; 
      }
    };

    if (isPolling) {
      poll();
    }

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [isPolling]);

  /**
   * Handle visibility change (pause when tab hidden)
   */
  useEffect(() => {
    const handleVisibility = () => {
      setIsPolling(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  /**
   * Pause polling
   */
  const handlePause = () => {
    setIsPolling(false);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  /**
   * Resume polling
   */
  const handleResume = () => {
    setIsPolling(true);
  };

  /**
   * Manual refresh
   */
  const handleRefresh = async () => {
    await fetchThreats();
  };

  return (
    <div className="min-h-screen bg-navy-900 py-8">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-cyan-300 mb-2">
              Live Monitoring
            </h1>
            <p className="text-navy-300">
              Real-time threat detection and analysis
            </p>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3">
            {isPolling ? (
              <button
                onClick={handlePause}
                className="btn btn-outline flex items-center gap-2"
              >
                <Pause size={18} />
                Pause
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="btn btn-outline flex items-center gap-2"
              >
                <Play size={18} />
                Resume
              </button>
            )}
            <button
              onClick={handleRefresh}
              className="btn btn-outline flex items-center gap-2"
            >
              <RotateCcw size={18} />
              Refresh
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mb-6 p-4 bg-navy-800 rounded-lg border border-navy-600">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isPolling ? "bg-green-500 animate-pulse" : "bg-gray-500"
                }`}
              />
              <span className="text-navy-300 text-sm">
                {isPolling ? "Monitoring active" : "Paused"}
              </span>
            </div>
            <span className="text-navy-400 text-sm">
              {lastUpdate
                ? `Last update: ${lastUpdate.toLocaleTimeString()}`
                : "Waiting..."}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-6">
            <div className="flex gap-2">
              <AlertCircle size={20} />
              <div>
                <p className="font-semibold">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="text-sm underline mt-1 hover:no-underline"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Threats List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Detected Threats ({threats.length})</h2>
          </div>

          {threats.length === 0 ? (
            <div className="flex-center h-48 text-navy-400">
              <p>No threats detected in current session</p>
            </div>
          ) : (
            <div className="space-y-4">
              {threats.map((threat) => (
                <div
                  key={threat.id}
                  className="bg-navy-700 rounded-lg p-4 border-l-4 border-red-500"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-cyan-300 font-semibold">
                        {threat.threat_type}
                      </p>
                      <p className="text-navy-400 text-sm">ID: {threat.id}</p>
                    </div>
                    <span className="badge badge-error text-xs">
                      {threat.severity.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-navy-400 text-xs mb-1">Confidence</p>
                      <div className="w-full bg-navy-600 rounded-full h-2">
                        <div
                          className="bg-copper-500 h-full rounded-full"
                          style={{
                            width: `${threat.confidence * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-copper-400 ml-4 font-semibold">
                      {(threat.confidence * 100).toFixed(1)}%
                    </p>
                  </div>

                  <p className="text-navy-400 text-xs mt-3">
                    {new Date(threat.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
