import { useState, useEffect } from "react";
import { getServerStatus, getAPIServerStatus } from "../../services/api.services";

function Healthcheck() {
    const [status, setStatus] = useState(null);
    const [apiStatus, setApiStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date()); // Current time state
  
    useEffect(() => {
        // Update current time every second
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
  
        // Fetch server and API status on component mount
        Promise.all([getServerStatus(), getAPIServerStatus()])
            .then(([serverRes, apiRes]) => {
                setStatus(serverRes.data);
                setApiStatus(apiRes.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching status:", error);
                setLoading(false);
            });
  
        // Clear interval on component unmount
        return () => clearInterval(interval);
    }, []);
  
    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <header className="bg-blue-600 text-white py-4 shadow-lg">
                <h1 className="text-4xl font-bold text-center">Server Status</h1>
            </header>
  
            <main className="flex-grow flex flex-col items-center justify-center p-6">
                {loading ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-blue-600 border-opacity-50"></div>
                    </div>
                ) : (
                    <div className="w-full max-w-4xl p-6 bg-white shadow-lg rounded-lg">
                        <h2 className="text-3xl font-semibold mb-6 text-center">
                            Server Details
                        </h2>
                        <div className="space-y-4">
                            {/* Server Status */}
                            {status && (
                                <div className="p-4 bg-gray-50 border rounded-lg">
                                    <h3 className="text-2xl font-medium mb-2">Server Status</h3>
                                    <p className="mb-2">
                                        <span className="font-semibold">Server:</span>{" "}
                                        {status.success ? (
                                            <span className="text-green-600">Online</span>
                                        ) : (
                                            <span className="text-red-600">Offline</span>
                                        )}
                                    </p>
                                    <p className="mb-2">
                                        <span className="font-semibold">Status:</span>{" "}
                                        {status.message}
                                    </p>
                                    <p className="mb-2">
                                        <span className="font-semibold">Current Time:</span>{" "}
                                        {currentTime.toLocaleTimeString()}
                                    </p>
                                </div>
                            )}
                            {/* API Status */}
                            {apiStatus && (
                                <div className="p-4 bg-gray-50 border rounded-lg">
                                    <h3 className="text-2xl font-medium mb-2">API Status</h3>
                                    <p className="mb-2">
                                        <span className="font-semibold">API Server:</span>{" "}
                                        {apiStatus.success ? (
                                            <span className="text-green-600">Online</span>
                                        ) : (
                                            <span className="text-red-600">Offline</span>
                                        )}
                                    </p>
                                    <p className="mb-2">
                                        <span className="font-semibold">Message:</span>{" "}
                                        {apiStatus.message}
                                    </p>
                                </div>
                            )}
                            {/* Error Message */}
                            {!status && !apiStatus && (
                                <p className="text-red-600 text-center">Failed to fetch server status.</p>
                            )}
                        </div>
                    </div>
                )}
            </main>
  
            <footer className="bg-blue-600 text-white py-4 text-center shadow-lg">
                <p>&copy; 2024 uxlivinglab</p>
            </footer>
        </div>
    );
}

export default Healthcheck;
