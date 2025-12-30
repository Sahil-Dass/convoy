const React = require('react');
const { useEffect, useState, forwardRef, useRef } = require('react');
const { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, useMapEvents } = require('react-leaflet');
const { View, Text, TouchableOpacity, Share } = require('react-native');
const L = require('leaflet');

// --- Styles ---
const GlobalStyles = () => (
  <style>
    {`
      .leaflet-container { height: 100%; width: 100%; z-index: 1; }
      .leaflet-pane { z-index: 1 !important; }
      .custom-control {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        background: white;
        padding: 10px;
        border-radius: 20px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: row;
        gap: 10px;
      }
      .btn {
        padding: 8px 16px;
        border-radius: 15px;
        font-weight: bold;
        cursor: pointer;
        border: none;
      }
      .btn-primary { background: #007AFF; color: white; }
      .btn-danger { background: #FF3B30; color: white; }
      .btn-success { background: #34C759; color: white; }
    `}
  </style>
);

// --- Route Drawing Logic ---
const RouteBuilder = ({ isDrawing, waypoints, setWaypoints }) => {
  useMapEvents({
    click(e) {
      if (!isDrawing) return;
      // Add new point to route
      setWaypoints((prev) => [...prev, e.latlng]);
    },
  });

  // Render the path connection
  return waypoints.length > 1 ? (
    <Polyline positions={waypoints} color="#FF5733" weight={5} opacity={0.8} />
  ) : null;
};

// --- Interactive Map Component ---
const StravaMap = () => {
  const [waypoints, setWaypoints] = useState([]); // Stores [ {lat, lng}, ... ]
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Calculate total distance (Simple estimation)
  const getDistance = () => {
    if (waypoints.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = L.latLng(waypoints[i]);
      const p2 = L.latLng(waypoints[i+1]);
      total += p1.distanceTo(p2);
    }
    return (total / 1000).toFixed(2); // km
  };

  const handleShare = async () => {
    if (waypoints.length < 2) return alert("Draw a route first!");
    
    // Create a shareable link (Mock logic - assumes your app handles deep links)
    // In production, you would save 'waypoints' to DB and get an ID.
    const routeData = JSON.stringify(waypoints.map(p => ({ lat: p.lat, lng: p.lng })));
    const message = `Check out my motor ride! Distance: ${getDistance()}km. Route Data: ${routeData.substring(0, 50)}...`;
    
    // Web Share API
    if (navigator.share) {
      navigator.share({ title: 'My Moto Route', text: message }).catch(console.error);
    } else {
      alert("Route copied to clipboard! (Simulated Share)");
      console.log(routeData); // Dev check
    }
  };

  return (
    <View style={{ flex: 1, height: '100%', width: '100%' }}>
      <MapContainer 
        center={[28.6139, 77.2090]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Start Marker */}
        {waypoints.length > 0 && (
          <Marker position={waypoints[0]}><Popup>Start</Popup></Marker>
        )}

        {/* End Marker */}
        {waypoints.length > 1 && (
          <Marker position={waypoints[waypoints.length - 1]}><Popup>Finish</Popup></Marker>
        )}

        <RouteBuilder 
          isDrawing={isDrawing} 
          waypoints={waypoints} 
          setWaypoints={setWaypoints} 
        />
      </MapContainer>

      {/* Floating Controls (Strava Style) */}
      <View className="custom-control" style={{ position: 'absolute', bottom: 30, alignSelf: 'center', flexDirection: 'row', backgroundColor: 'white', padding: 10, borderRadius: 20, elevation: 5, gap: 10 }}>
        
        <button 
          className={isDrawing ? "btn btn-danger" : "btn btn-primary"}
          onClick={() => setIsDrawing(!isDrawing)}
        >
          {isDrawing ? "🛑 Stop Drawing" : "✏️ Draw Route"}
        </button>

        {waypoints.length > 0 && (
          <button className="btn btn-danger" onClick={() => setWaypoints([])}>
             Clear
          </button>
        )}

        <button className="btn btn-success" onClick={handleShare}>
           Share ({getDistance()} km)
        </button>
      </View>
    </View>
  );
};

// --- Export ---
const WebMap = forwardRef((props, ref) => {
  if (typeof window === 'undefined') return null;

  return (
    <View style={{ flex: 1, height: '100vh', width: '100%', overflow: 'hidden' }} ref={ref}>
      <GlobalStyles />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <StravaMap />
    </View>
  );
});

module.exports = {
  __esModule: true,
  default: WebMap,
  MapView: WebMap,
  Marker: () => null,
  Polyline: () => null,
  PROVIDER_GOOGLE: 'google',
  PROVIDER_DEFAULT: 'default',
};
