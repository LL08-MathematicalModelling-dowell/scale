/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";


import Datacubeservices from '../../services/databaseservice';

const SimpleLocationMap = ({ workspaceId, scaleId, apiKey }) => {
  
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);


  const databaseName = "voc";
  const collectionName = "user_location_data";
  const limit = 1000;
  const offset = 0;

  useEffect(() => {
    const fetchData = async () => {
      console.log("workspaceId",workspaceId);
      console.log("scaleId",scaleId);
      console.log("apiKey",apiKey);
      
      
      if (!workspaceId || !scaleId || !apiKey) {
        setError("Missing required parameters");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const datacube = new Datacubeservices(apiKey);
        const filters = {
          workspaceId,
          event: "scanned",
          scaleId,
        };

        const result = await datacube.dataRetrieval(
          databaseName,
          collectionName,
          filters,
          limit,
          offset
        );

        console.log("here is log",result);
        
        setData(result.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [workspaceId, scaleId, apiKey]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBounds = () => {
    if (data.length === 0)
      return [
        [0, 0],
        [0, 0],
      ];
    const lats = data.map((loc) => loc.latitude);
    const lngs = data.map((loc) => loc.longitude);
    return [
      [Math.min(...lats) - 1, Math.min(...lngs) - 1],
      [Math.max(...lats) + 1, Math.max(...lngs) + 1],
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
        Error: {error}
      </div>
    );
  }

  // If no data, show an empty state
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-50 rounded-lg">
        <div className="text-center text-gray-500">
          <p>No location data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[400px] rounded-lg overflow-hidden">
      {/* The map component */}
      <MapContainer
        bounds={getBounds()}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {data.map((location) => (
          <Marker
            key={location._id}
            position={[location.latitude, location.longitude]}
          >
            <Popup className="custom-popup">
              <div className="bg-white p-3 rounded-lg shadow-lg">
                <h3 className="font-semibold text-blue-900 mb-2 text-sm">
                  Location Details
                </h3>
                <div className="space-y-1 text-xs">
                  <p className="text-gray-700">
                    <span className="font-medium">Latitude:</span>{" "}
                    {location.latitude.toFixed(6)}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Longitude:</span>{" "}
                    {location.longitude.toFixed(6)}
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    {formatDate(location.createdAt)}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default SimpleLocationMap;