import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Metrics() {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    axios.get('http://localhost:5000/api/metrics')
      .then(res => setMetrics(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Platform Usage Metrics</h2>
      <pre>{JSON.stringify(metrics, null, 2)}</pre>
    </div>
  );
}