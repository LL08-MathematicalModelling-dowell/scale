import { MapContainer, TileLayer } from 'react-leaflet';
import {HeatmapLayer} from 'react-leaflet-heatmap-layer-v3';
import 'leaflet/dist/leaflet.css';

const LikertMapReport = ({ locations }) => {
  return (
    <div className="w-full">
      <MapContainer
        center={[0, 0]} // Adjust center coordinates as per your requirement
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '500px', width: '100%' }}
      >
        <HeatmapLayer
          // Configuration for heatmap
          fitBoundsOnLoad
          fitBoundsOnUpdate
          points={locations}
          longitudeExtractor={(point) => point.lng}
          latitudeExtractor={(point) => point.lat}
          intensityExtractor={(point) => point.intensity || 1}
        />
        <TileLayer
          url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    </div>
  );
};

export default LikertMapReport;
