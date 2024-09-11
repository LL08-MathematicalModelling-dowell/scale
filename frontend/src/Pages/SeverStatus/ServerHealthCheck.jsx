import { useState, useEffect } from "react";
import { getServerStatus, getAPIServerStatus, microServicesServerStatus, microServicesAPIServerStatus } from "../../services/api.services";
import { FaServer, FaDatabase, FaMicrochip } from "react-icons/fa";

function Healthcheck() {
    const [status, setStatus] = useState(null);
    const [apiStatus, setApiStatus] = useState(null);
    const [microServiceStatus, setMicroServiceStatus] = useState(null);
    const [microServiceApiStatus, setMicroServiceApiStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        Promise.all([getServerStatus(), getAPIServerStatus(), microServicesServerStatus(), microServicesAPIServerStatus()])
            .then(([serverRes, apiRes, microServiceRes, microServiceApiRes]) => {
                setStatus(serverRes.data);
                setApiStatus(apiRes.data);
                setMicroServiceStatus(microServiceRes.data);
                setMicroServiceApiStatus(microServiceApiRes.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching status:", error);
                setLoading(false);
            });

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col min-h-screen text-gray-800 bg-gradient-to-br from-gray-50 to-gray-100">
            <header className="py-8 bg-blue-700 shadow-lg">
                <h1 className="text-4xl font-bold text-center text-white">Health Dashboard</h1>
            </header>

            <main className="flex flex-col items-center justify-center flex-grow p-8 space-y-12">
                {loading ? (
                    <div className="flex items-center justify-center">
                        <div className="w-16 h-16 border-t-4 border-blue-600 border-opacity-50 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
                        
                        {status && (
                            <div className="p-6 transition-transform transform bg-white rounded-lg shadow-md hover:scale-105">
                                <div className="flex items-center mb-4">
                                    <FaServer className="text-3xl text-blue-600" />
                                    <h3 className="ml-4 text-2xl font-bold">Server Status</h3>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-gray-600">Server:</p>
                                    <p className={`${status.success ? 'text-green-500' : 'text-red-500'}`}>
                                        {status.success ? "Online" : "Offline"}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-gray-600">Status:</p>
                                    <p>{status.status}</p>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-gray-600">Version:</p>
                                    <p>{status.version}</p>
                                </div>
                                <p className="text-gray-500">{status.message}</p>
                                <div className="text-sm text-gray-400">
                                    <p>Current Time: {currentTime.toLocaleTimeString()}</p>
                                    <p>Server Time: {new Date(status.server_time).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        )}

                        {apiStatus && (
                            <div className="p-6 transition-transform transform bg-white rounded-lg shadow-md hover:scale-105">
                                <div className="flex items-center mb-4">
                                    <FaDatabase className="text-3xl text-blue-600" />
                                    <h3 className="ml-4 text-2xl font-bold">API Server Status</h3>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-gray-600">API Server:</p>
                                    <p className={`${apiStatus.success ? 'text-green-500' : 'text-red-500'}`}>
                                        {apiStatus.success ? "Online" : "Offline"}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-gray-600">Status:</p>
                                    <p>{apiStatus.status}</p>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-gray-600">Version:</p>
                                    <p>{apiStatus.version}</p>
                                </div>
                                <p className="text-gray-500">{apiStatus.message}</p>
                                <div className="text-sm text-gray-400">
                                    <p>Current Time: {currentTime.toLocaleTimeString()}</p>
                                    <p>Server Time: {new Date(apiStatus.server_time).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        )}

                        {microServiceStatus && (
                            <div className="p-6 transition-transform transform bg-white rounded-lg shadow-md hover:scale-105">
                                <div className="flex items-center mb-4">
                                    <FaServer className="text-3xl text-blue-600" />
                                    <h3 className="ml-4 text-2xl font-bold">Microservices Server Status</h3>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-gray-600">Microservices Server:</p>
                                    <p className={`${microServiceStatus.success ? 'text-green-500' : 'text-red-500'}`}>
                                        {microServiceStatus.success ? "Online" : "Offline"}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-gray-600">Status:</p>
                                    <p>{microServiceStatus.status}</p>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-gray-600">Version:</p>
                                    <p>{microServiceStatus.version}</p>
                                </div>
                                <p className="text-gray-500">{microServiceStatus.message}</p>
                                <div className="text-sm text-gray-400">
                                    <p>Current Time: {currentTime.toLocaleTimeString()}</p>
                                    <p>Server Time: {new Date(microServiceStatus.server_time).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        )}

                        {microServiceApiStatus && (
                            <div className="p-6 transition-transform transform bg-white rounded-lg shadow-md hover:scale-105">
                                <div className="flex items-center mb-4">
                                    <FaDatabase className="text-3xl text-blue-600" />
                                    <h3 className="ml-4 text-2xl font-bold">Microservices API Status</h3>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-gray-600">Microservices API Server:</p>
                                    <p className={`${microServiceApiStatus.success ? 'text-green-500' : 'text-red-500'}`}>
                                        {microServiceApiStatus.success ? "Online" : "Offline"}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-gray-600">Status:</p>
                                    <p>{microServiceApiStatus.status}</p>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-gray-600">Version:</p>
                                    <p>{microServiceApiStatus.version}</p>
                                </div>
                                <p className="text-gray-500">{microServiceApiStatus.message}</p>
                                <div className="text-sm text-gray-400">
                                    <p>Current Time: {currentTime.toLocaleTimeString()}</p>
                                    <p>Server Time: {new Date(microServiceApiStatus.server_time).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        )}

                        {microServiceStatus && (
                            <div className="p-6 transition-transform transform bg-white rounded-lg shadow-md lg:col-span-2 hover:scale-105">
                                <div className="flex items-center mb-4">
                                    <FaMicrochip className="text-3xl text-blue-600" />
                                    <h3 className="ml-4 text-2xl font-bold">Server Performance Metrics</h3>
                                </div>

                               
                                <div className="mb-4">
                                    <h4 className="mb-2 text-xl font-semibold">CPU Usage (Load Averages)</h4>
                                    <ul className="grid grid-cols-3 gap-4">
                                        {microServiceStatus.cpuUsage.map((cpu, index) => (
                                            <li key={index} className="p-4 text-center rounded-lg shadow-sm bg-gray-50">
                                                <span className="block text-xl font-bold text-gray-700">{cpu}</span>
                                                <span className="text-gray-600">Load</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                       
                                <div className="mb-4">
                                    <h4 className="mb-2 text-xl font-semibold">Memory Usage</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-lg shadow-sm bg-gray-50">
                                            <h5 className="text-lg font-semibold text-gray-700">Total Memory</h5>
                                            <p className="text-xl font-bold text-gray-700">{microServiceStatus.totalMemory}</p>
                                        </div>
                                        <div className="p-4 rounded-lg shadow-sm bg-gray-50">
                                            <h5 className="text-lg font-semibold text-gray-700">Free Memory</h5>
                                            <p className="text-xl font-bold text-gray-700">{microServiceStatus.freeMemory}</p>
                                        </div>
                                    </div>
                                </div>

                             
                                <div className="mb-4">
                                    <h4 className="mb-2 text-xl font-semibold">Heap Usage</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-lg shadow-sm bg-gray-50">
                                            <h5 className="text-lg font-semibold text-gray-700">Heap Total</h5>
                                            <p className="text-xl font-bold text-gray-700">{microServiceStatus.memoryUsage.heapTotal}</p>
                                        </div>
                                        <div className="p-4 rounded-lg shadow-sm bg-gray-50">
                                            <h5 className="text-lg font-semibold text-gray-700">Heap Used</h5>
                                            <p className="text-xl font-bold text-gray-700">{microServiceStatus.memoryUsage.heapUsed}</p>
                                        </div>
                                    </div>
                                </div>

                             
                                <div>
                                    <h4 className="mb-2 text-xl font-semibold">Uptime</h4>
                                    <p className="p-4 text-xl font-bold text-gray-700 rounded-lg shadow-sm bg-gray-50">{microServiceStatus.uptime}</p>
                                </div>
                            </div>
                        )}

                   
                        {!status && !apiStatus && !microServiceStatus && !microServiceApiStatus && (
                            <div className="col-span-2 text-xl text-center text-red-600">
                                Failed to fetch server or API status.
                            </div>
                        )}
                    </div>
                )}
            </main>

            <footer className="py-6 text-center text-white bg-blue-700 shadow-md">
                <p>&copy; 2024 uxlivinglab</p>
            </footer>
        </div>
    );
}

export default Healthcheck;
