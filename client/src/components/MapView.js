import React, { useEffect, useRef, useState } from 'react';

const MapView = () => {
  const mapRef = useRef(null);
  const [items, setItems] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(5); // Radius in km
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // Load Google Maps script
  useEffect(() => {
    const loadMapScript = () => {
      const existingScript = document.getElementById('googleMaps');
      if (!existingScript) {
        const apiKey = 'AIzaSyBKxhggv1a7Y3h8yR37nRKQfFZ4EI8TMOc'; // Replace with your actual key
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.id = 'googleMaps';
        script.async = true;
        script.defer = true;
        script.onload = () => setMapLoaded(true);
        document.head.appendChild(script);
      } else {
        setMapLoaded(true);
      }
    };
    loadMapScript();
  }, []);

  // Get current user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  }, []);

  // Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/items');
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    fetchItems();
  }, []);

  // Haversine formula
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Render map and markers
  useEffect(() => {
    if (mapLoaded && mapRef.current && userLocation) {
      if (!mapInstance.current) {
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: userLocation,
          zoom: 14,
        });
      }

      const map = mapInstance.current;

      // Clear previous markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      const bounds = new window.google.maps.LatLngBounds();

      // Add user marker
      const userMarker = new window.google.maps.Marker({
        position: userLocation,
        map,
        title: 'You are here',
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        },
      });
      markersRef.current.push(userMarker);
      bounds.extend(userLocation);

      // Add item markers
      items.forEach((item) => {
        let loc = null;
        try {
          loc = JSON.parse(item.location); // location is a JSON string
        } catch (e) {
          console.warn('Invalid location format for item:', item.id);
        }

        if (loc?.lat && loc?.lng) {
          const distance = getDistance(userLocation.lat, userLocation.lng, loc.lat, loc.lng);
          if (distance <= radius) {
            const marker = new window.google.maps.Marker({
              position: { lat: loc.lat, lng: loc.lng },
              map,
              title: `${item.title} (${distance.toFixed(1)} km)`,
            });
            markersRef.current.push(marker);
            bounds.extend({ lat: loc.lat, lng: loc.lng });
          }
        }
      });

      map.fitBounds(bounds);
    }
  }, [mapLoaded, items, userLocation, radius]);

  return (
    <div style={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', background: '#fff', zIndex: 1 }}>
        <label>
          Search Radius: {radius} km
          <input
            type="range"
            min="0.5"
            max="20"
            step="0.5"
            value={radius}
            onChange={(e) => setRadius(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </label>
      </div>
      <div ref={mapRef} style={{ flexGrow: 1 }} />
    </div>
  );
};

export default MapView;