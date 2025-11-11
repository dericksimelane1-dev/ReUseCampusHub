import React, { useEffect, useRef } from 'react';

const MapPicker = ({ setLocation }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const initMap = () => {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: -25.7676, lng: 29.4648 }, // Middelburg
        zoom: 13,
      });

      map.addListener('click', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setLocation({ lat, lng });

        if (markerRef.current) {
          markerRef.current.setMap(null);
        }

        markerRef.current = new window.google.maps.Marker({
          position: { lat, lng },
          map,
        });
      });
    };

    const loadGoogleMapsScript = () => {
  const existingScript = document.getElementById('googleMaps');

  if (!existingScript) {
    console.log('ENV:', process.env);
    const apiKey = 'AIzaSyBKxhggv1a7Y3h8yR37nRKQfFZ4EI8TMOc';
    console.log('Google Maps API Key:', apiKey); // ✅ Add this line here

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.id = 'googleMaps';
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.head.appendChild(script);
  } else {
    initMap();
  }
};

    if (!window.google || !window.google.maps) {
      loadGoogleMapsScript();
    } else {
      initMap();
    }
  }, [setLocation]);

  return <div ref={mapRef} style={{ height: '300px', width: '100%' }} />;
};

export default MapPicker;
