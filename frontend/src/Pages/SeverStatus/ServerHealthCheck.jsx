import { useState, useEffect } from "react";
import { getServerStatus, getAPIServerStatus } from "../../services/api.services";
import { FaServer, FaDatabase } from "react-icons/fa"; // Icons for server and API

function Healthcheck() {
    const [status, setStatus] = useState(null);
    const [apiStatus, setApiStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

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

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <header className="bg-blue-700 text-white py-8 shadow-lg">
                <h1 className="text-5xl font-extrabold text-center">Health Dashboard</h1>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center p-8">
                {loading ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-blue-600 border-opacity-50"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
                        {/* Server Status Card */}
                        {status && (
                            <div className="p-8 bg-white shadow-lg rounded-lg transform transition-all duration-300 hover:scale-105">
                                <div className="flex items-center mb-4">
                                    <FaServer className="text-blue-600 text-3xl mr-4" />
                                    <h3 className="text-2xl font-bold">Server Status</h3>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-lg font-semibold">Server:</p>
                                    <p className={`text-lg ${status.success ? 'text-green-600' : 'text-red-600'}`}>
                                        {status.success ? "Online" : "Offline"}
                                    </p>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-lg font-semibold">Status:</p>
                                    <p className="text-lg">{status.status}</p>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-lg font-semibold">Version:</p>
                                    <p className="text-lg">{status.version}</p>
                                </div>
                                <p className="text-gray-600 mt-4">{status.message}</p>
                                <div className="mt-4 text-gray-500 text-sm">
                                    <p>
                                        <span className="font-semibold">Current Time:</span> {currentTime.toLocaleTimeString()}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Server Time:</span> {new Date(status.server_time).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* API Server Status Card */}
                        {apiStatus && (
                            <div className="p-8 bg-white shadow-lg rounded-lg transform transition-all duration-300 hover:scale-105">
                                <div className="flex items-center mb-4">
                                    <FaDatabase className="text-blue-600 text-3xl mr-4" />
                                    <h3 className="text-2xl font-bold">API Server Status</h3>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-lg font-semibold">API Server:</p>
                                    <p className={`text-lg ${apiStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                                        {apiStatus.success ? "Online" : "Offline"}
                                    </p>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-lg font-semibold">Status:</p>
                                    <p className="text-lg">{apiStatus.status}</p>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-lg font-semibold">Version:</p>
                                    <p className="text-lg">{apiStatus.version}</p>
                                </div>
                                <p className="text-gray-600 mt-4">{apiStatus.message}</p>
                                <div className="mt-4 text-gray-500 text-sm">
                                    <p>
                                        <span className="font-semibold">Current Time:</span> {currentTime.toLocaleTimeString()}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Server Time:</span> {new Date(apiStatus.server_time).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {!status && !apiStatus && (
                            <div className="text-red-600 text-center text-xl col-span-2">
                                Failed to fetch server or API status.
                            </div>
                        )}
                    </div>
                )}
            </main>

            <footer className="bg-blue-700 text-white py-4 text-center shadow-lg">
                <p>&copy; 2024 uxlivinglab</p>
            </footer>
        </div>
    );
}

export default Healthcheck;
