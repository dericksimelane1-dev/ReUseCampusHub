import React, { useEffect, useRef, useState } from 'react';

const MapView = () => {
  const mapRef = useRef(null);
  const [items, setItems] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(2); // Default radius in km

  // Load Google Maps script
  useEffect(() => {
    const loadMapScript = () => {
      const existingScript = document.getElementById('googleMaps');

      if (!existingScript) {
        const script = document.createElement('script');
        script.src =
          'https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY';
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

  // Get user's current location
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

  // Fetch items from backend
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

  // Haversine formula to calculate distance between two coordinates
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Initialize map and display markers
  useEffect(() => {
    if (mapLoaded && items.length > 0 && mapRef.current && userLocation) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: userLocation,
        zoom: 14,
      });

      const bounds = new window.google.maps.LatLngBounds();

      // User location marker
      new window.google.maps.Marker({
        position: userLocation,
        map,
        title: 'You are here',
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        },
      });
      bounds.extend(userLocation);

      // Item markers within radius
      items.forEach((item) => {
        try {
          const loc = JSON.parse(item.location);
          if (loc?.lat && loc?.lng) {
            const distance = getDistance(
              userLocation.lat,
              userLocation.lng,
              loc.lat,
              loc.lng
            );

            if (distance <= radius) {
              const position = { lat: loc.lat, lng: loc.lng };
              new window.google.maps.Marker({
                position,
                map,
                title: `${item.title} (${distance.toFixed(1)} km)`,
              });
              bounds.extend(position);
            }
          }
        } catch (e) {
          console.warn('Invalid location data for item:', item.id);
        }
      });

      map.fitBounds(bounds);
    }
  }, [mapLoaded, items, userLocation, radius]);

  return (
    <div>
      <div style={{ padding: '10px', background: '#fff', zIndex: 1 }}>
        <label>
          Search Radius: {radius} km
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={radius}
            onChange={(e) => setRadius(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </label>
      </div>
      <div ref={mapRef} style={{ height: '90vh', width: '100%' }} />
    </div>
  );
};

export default MapView;