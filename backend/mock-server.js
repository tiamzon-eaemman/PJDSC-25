const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for Barangay Batong Malake, Los Baños, Laguna
const mockHazards = [
  {
    id: 1,
    type: "FLOOD",
    severity: 3,
    geometry: {
      type: "Polygon",
      coordinates: [[
        [121.24, 14.16],
        [121.245, 14.16],
        [121.245, 14.165],
        [121.24, 14.165],
        [121.24, 14.16]
      ]]
    },
    source: "UP_NOAH",
    confidence: 0.85,
    elevation: 15.5,
    affectedPopulation: 250
  },
  {
    id: 2,
    type: "LANDSLIDE",
    severity: 4,
    geometry: {
      type: "Polygon",
      coordinates: [[
        [121.235, 14.17],
        [121.242, 14.17],
        [121.242, 14.175],
        [121.235, 14.175],
        [121.235, 14.17]
      ]]
    },
    source: "UP_NOAH",
    confidence: 0.92,
    elevation: 45.2,
    affectedPopulation: 120
  },
  {
    id: 3,
    type: "FLOOD",
    severity: 2,
    geometry: {
      type: "Polygon",
      coordinates: [[
        [121.238, 14.162],
        [121.243, 14.162],
        [121.243, 14.167],
        [121.238, 14.167],
        [121.238, 14.162]
      ]]
    },
    source: "UP_NOAH",
    confidence: 0.78,
    elevation: 8.3,
    affectedPopulation: 80
  },
  {
    id: 4,
    type: "LANDSLIDE",
    severity: 3,
    geometry: {
      type: "Polygon",
      coordinates: [[
        [121.232, 14.168],
        [121.237, 14.168],
        [121.237, 14.173],
        [121.232, 14.173],
        [121.232, 14.168]
      ]]
    },
    source: "UP_NOAH",
    confidence: 0.88,
    elevation: 25.1,
    affectedPopulation: 150
  }
];

const mockEvacuationCenters = [
  {
    id: 1,
    name: "Batong Malake Elementary School",
    geometry: {
      type: "Point",
      coordinates: [121.24, 14.165]
    },
    capacity: 200,
    address: "Batong Malake, Los Baños, Laguna"
  },
  {
    id: 2,
    name: "UP Los Baños Gymnasium",
    geometry: {
      type: "Point",
      coordinates: [121.238, 14.168]
    },
    capacity: 300,
    address: "UP Los Baños, Los Baños, Laguna"
  },
  {
    id: 3,
    name: "Barangay Batong Malake Hall",
    geometry: {
      type: "Point",
      coordinates: [121.235, 14.162]
    },
    capacity: 150,
    address: "Batong Malake, Los Baños, Laguna"
  }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/hazards/geojson', (req, res) => {
  const features = mockHazards.map(hazard => ({
    type: "Feature",
    properties: {
      id: hazard.id,
      type: hazard.type,
      severity: hazard.severity,
      source: hazard.source,
      confidence: hazard.confidence,
      elevation: hazard.elevation,
      affectedPopulation: hazard.affectedPopulation
    },
    geometry: hazard.geometry
  }));

  res.json({
    type: "FeatureCollection",
    features: features
  });
});

app.get('/api/evacuation/geojson', (req, res) => {
  const features = mockEvacuationCenters.map(center => ({
    type: "Feature",
    properties: {
      id: center.id,
      name: center.name,
      capacity: center.capacity,
      address: center.address
    },
    geometry: center.geometry
  }));

  res.json({
    type: "FeatureCollection",
    features: features
  });
});

app.get('/api/hazards/stats', (req, res) => {
  const stats = {
    total: mockHazards.length,
    by_type: {
      FLOOD: mockHazards.filter(h => h.type === 'FLOOD').length,
      LANDSLIDE: mockHazards.filter(h => h.type === 'LANDSLIDE').length,
      STORM_SURGE: mockHazards.filter(h => h.type === 'STORM_SURGE').length,
      WIND: mockHazards.filter(h => h.type === 'WIND').length
    },
    by_severity: {
      severity_1: mockHazards.filter(h => h.severity === 1).length,
      severity_2: mockHazards.filter(h => h.severity === 2).length,
      severity_3: mockHazards.filter(h => h.severity === 3).length,
      severity_4: mockHazards.filter(h => h.severity === 4).length,
      severity_5: mockHazards.filter(h => h.severity === 5).length
    }
  };

  res.json(stats);
});

app.get('/api/barangays/geojson', (req, res) => {
  const barangays = [
    {
      id: 1,
      name: "Santa Cruz",
      municipality: "Santa Cruz",
      province: "Laguna",
      geometry: { type: "Point", coordinates: [121.2, 14.3] }
    },
    {
      id: 2,
      name: "Calamba",
      municipality: "Calamba",
      province: "Laguna", 
      geometry: { type: "Point", coordinates: [121.15, 14.25] }
    },
    {
      id: 3,
      name: "Los Baños",
      municipality: "Los Baños",
      province: "Laguna",
      geometry: { type: "Point", coordinates: [121.22, 14.18] }
    }
  ];

  const features = barangays.map(barangay => ({
    type: "Feature",
    properties: {
      id: barangay.id,
      name: barangay.name,
      municipality: barangay.municipality,
      province: barangay.province
    },
    geometry: barangay.geometry
  }));

  res.json({
    type: "FeatureCollection",
    features: features
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SAGIP Mock Backend running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET /api/health`);
  console.log(`   GET /api/hazards/geojson`);
  console.log(`   GET /api/evacuation/geojson`);
  console.log(`   GET /api/barangays/geojson`);
  console.log(`   GET /api/hazards/stats`);
});
