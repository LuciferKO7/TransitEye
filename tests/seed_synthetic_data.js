/**
 * TransitEye Synthetic Test Dataset Seeder & Safe Cleanup Utility
 *
 * Grounded in existing backend API contracts:
 * - POST /api/detections
 * - POST /api/incidents
 * - POST /api/vehicle-density
 * - DELETE /api/detections/:id
 * - DELETE /api/incidents/:id
 * - DELETE /api/vehicle-density/:id
 *
 * Mandatory Deletion Rule:
 * Cleanup requires exact interactive confirmation phrase "my keychain".
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const REGISTRY_PATH = path.join(__dirname, '.synthetic_registry.json');

// ── Synthetic Dataset Definitions ──────────────────────────────────────────

const SYNTHETIC_DETECTIONS = [
  // Road Defects (6 items)
  {
    id: 'synth-det-rd-001',
    type: 'road_defect',
    subtype: 'pothole',
    confidence: 0.94,
    severity: 'critical',
    location: { latitude: 28.6139, longitude: 77.2090, altitude: 216.5, speed: 32.0, heading: 178.5, accuracy: 2.1 },
    segment_id: 'SEG-DEL-RING-101',
    status: 'pending',
    confirmed_by_count: 3,
    bus_id: 'BUS-DEL-101',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    thumbnail_url: 'https://storage.transiteye.city/evidence/thumbnails/pothole_001.jpg',
    metadata: { synthetic: true, test_data: true, estimated_depth_cm: 12.0, bbox: [100, 200, 300, 400] }
  },
  {
    id: 'synth-det-rd-002',
    type: 'road_defect',
    subtype: 'severe_cracking',
    confidence: 0.88,
    severity: 'high',
    location: { latitude: 28.6250, longitude: 77.2150, altitude: 214.0, speed: 28.5, heading: 45.0, accuracy: 1.8 },
    segment_id: 'SEG-DEL-CP-005',
    status: 'pending',
    confirmed_by_count: 2,
    bus_id: 'BUS-DEL-102',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    thumbnail_url: 'https://storage.transiteye.city/evidence/thumbnails/crack_002.jpg',
    metadata: { synthetic: true, test_data: true, crack_length_m: 3.5 }
  },
  {
    id: 'synth-det-rd-003',
    type: 'road_defect',
    subtype: 'rutting',
    confidence: 0.79,
    severity: 'medium',
    location: { latitude: 28.5800, longitude: 77.2300, altitude: 210.0, speed: 45.0, heading: 120.0, accuracy: 2.5 },
    segment_id: 'SEG-DEL-NH48-002',
    status: 'in_review',
    confirmed_by_count: 1,
    bus_id: 'BUS-DEL-103',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    thumbnail_url: 'https://storage.transiteye.city/evidence/thumbnails/rutting_003.jpg',
    metadata: { synthetic: true, test_data: true }
  },
  {
    id: 'synth-det-rd-004',
    type: 'road_defect',
    subtype: 'unpaved_edge',
    confidence: 0.72,
    severity: 'low',
    location: { latitude: 28.5350, longitude: 77.2580, altitude: 208.0, speed: 50.0, heading: 90.0, accuracy: 3.0 },
    segment_id: 'SEG-DEL-OKHLA-018',
    status: 'resolved',
    confirmed_by_count: 4,
    bus_id: 'BUS-DEL-104',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    thumbnail_url: null, // Fallback test: no thumbnail
    metadata: { synthetic: true, test_data: true }
  },
  {
    id: 'synth-det-rd-005',
    type: 'road_defect',
    subtype: 'pothole',
    confidence: 0.91,
    severity: 'high',
    location: { latitude: 28.6400, longitude: 77.2200 }, // Missing optional location fields fallback test
    segment_id: 'SEG-DEL-RING-104',
    status: 'pending',
    confirmed_by_count: 2,
    bus_id: 'BUS-DEL-101',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    thumbnail_url: 'https://storage.transiteye.city/evidence/thumbnails/pothole_005.jpg',
    metadata: { synthetic: true, test_data: true }
  },
  {
    id: 'synth-det-rd-006',
    type: 'road_defect',
    subtype: 'manhole_depression',
    confidence: 0.82,
    severity: 'medium',
    location: { latitude: 28.5950, longitude: 77.2050, speed: 25.0 },
    segment_id: 'SEG-DEL-CP-002',
    status: 'rejected',
    confirmed_by_count: 1,
    bus_id: 'BUS-DEL-105',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    thumbnail_url: 'https://storage.transiteye.city/evidence/thumbnails/manhole_006.jpg',
    metadata: { synthetic: true, test_data: true }
  },

  // Waterlogging (4 items)
  {
    id: 'synth-det-wl-001',
    type: 'waterlogging',
    subtype: 'water_accumulation',
    confidence: 0.89,
    severity: 'critical',
    location: { latitude: 28.5355, longitude: 77.2588, altitude: 208.0, speed: 15.0, heading: 85.0, accuracy: 3.4 },
    segment_id: 'SEG-DEL-OKHLA-018',
    status: 'pending',
    confirmed_by_count: 3,
    bus_id: 'BUS-DEL-104',
    timestamp: new Date(Date.now() - 2400000).toISOString(),
    thumbnail_url: 'https://storage.transiteye.city/evidence/thumbnails/waterlog_001.jpg',
    metadata: { synthetic: true, test_data: true, estimated_coverage_pct: 65.0, passable_lanes: 1 }
  },
  {
    id: 'synth-det-wl-002',
    type: 'waterlogging',
    subtype: 'localized_flooding',
    confidence: 0.85,
    severity: 'high',
    location: { latitude: 28.6100, longitude: 77.2350, speed: 12.0 },
    segment_id: 'SEG-DEL-RING-108',
    status: 'pending',
    confirmed_by_count: 2,
    bus_id: 'BUS-DEL-106',
    timestamp: new Date(Date.now() - 5400000).toISOString(),
    thumbnail_url: 'https://storage.transiteye.city/evidence/thumbnails/waterlog_002.jpg',
    metadata: { synthetic: true, test_data: true, estimated_coverage_pct: 40.0 }
  },
  {
    id: 'synth-det-wl-003',
    type: 'waterlogging',
    subtype: 'blocked_drain',
    confidence: 0.76,
    severity: 'medium',
    location: { latitude: 28.6500, longitude: 77.1900 },
    segment_id: 'SEG-DEL-KAROL-003',
    status: 'confirmed',
    confirmed_by_count: 2,
    bus_id: 'BUS-DEL-107',
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    thumbnail_url: null,
    metadata: { synthetic: true, test_data: true }
  },
  {
    id: 'synth-det-wl-004',
    type: 'waterlogging',
    subtype: 'water_accumulation',
    confidence: 0.68,
    severity: 'low',
    location: { latitude: 28.5600, longitude: 77.1700 },
    segment_id: 'SEG-DEL-RKPURAM-012',
    status: 'resolved',
    confirmed_by_count: 1,
    bus_id: 'BUS-DEL-102',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    thumbnail_url: 'https://storage.transiteye.city/evidence/thumbnails/waterlog_004.jpg',
    metadata: { synthetic: true, test_data: true }
  },

  // VRU Safety (4 items)
  {
    id: 'synth-det-vru-001',
    type: 'vru_safety',
    subtype: 'pedestrian_near_miss',
    confidence: 0.96,
    severity: 'critical',
    location: { latitude: 28.6328, longitude: 77.2197, altitude: 214.2, speed: 18.5, heading: 290.0, accuracy: 1.8 },
    segment_id: 'SEG-DEL-CP-005',
    status: 'pending',
    confirmed_by_count: 2,
    bus_id: 'BUS-DEL-108',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    thumbnail_url: 'https://storage.transiteye.city/evidence/thumbnails/vru_001.jpg',
    metadata: { synthetic: true, test_data: true, distance_to_bus_m: 1.8, time_to_collision_sec: 0.9 }
  },
  {
    id: 'synth-det-vru-002',
    type: 'vru_safety',
    subtype: 'cyclist_vulnerability',
    confidence: 0.87,
    severity: 'high',
    location: { latitude: 28.6180, longitude: 77.2050, speed: 22.0 },
    segment_id: 'SEG-DEL-RING-102',
    status: 'pending',
    confirmed_by_count: 1,
    bus_id: 'BUS-DEL-101',
    timestamp: new Date(Date.now() - 4800000).toISOString(),
    thumbnail_url: 'https://storage.transiteye.city/evidence/thumbnails/vru_002.jpg',
    metadata: { synthetic: true, test_data: true }
  },
  {
    id: 'synth-det-vru-003',
    type: 'vru_safety',
    subtype: 'jaywalking_hazard',
    confidence: 0.81,
    severity: 'medium',
    location: { latitude: 28.5700, longitude: 77.2400 },
    segment_id: 'SEG-DEL-LAJPAT-009',
    status: 'in_review',
    confirmed_by_count: 1,
    bus_id: 'BUS-DEL-103',
    timestamp: new Date(Date.now() - 21600000).toISOString(),
    thumbnail_url: 'https://storage.transiteye.city/evidence/thumbnails/vru_003.jpg',
    metadata: { synthetic: true, test_data: true }
  },
  {
    id: 'synth-det-vru-004',
    type: 'vru_safety',
    subtype: 'pedestrian_near_miss',
    confidence: 0.74,
    severity: 'low',
    location: { latitude: 28.5200, longitude: 77.2100 },
    segment_id: 'SEG-DEL-SAKET-014',
    status: 'resolved',
    confirmed_by_count: 1,
    bus_id: 'BUS-DEL-105',
    timestamp: new Date(Date.now() - 345600000).toISOString(),
    thumbnail_url: null,
    metadata: { synthetic: true, test_data: true }
  }
];

const SYNTHETIC_INCIDENTS = [
  {
    id: 'synth-inc-001',
    plate_text: 'DL01AB1234',
    plate_confidence: 0.96,
    trigger_reason: 'reckless_overtake', // High severity trigger -> CRITICAL heuristic
    location: { latitude: 28.6289, longitude: 77.2065, altitude: 215.0, speed: 12.0, heading: 45.0, accuracy: 1.5, address: 'Connaught Place Outer Circle, New Delhi' },
    clip_url: 'https://storage.transiteye.city/evidence/clips/inc_synth_001.mp4',
    bus_id: 'BUS-DEL-103',
    timestamp: new Date(Date.now() - 1500000).toISOString(),
    metadata: { synthetic: true, test_data: true, vehicle_type: 'private_suv', obstruction_duration_sec: 42 }
  },
  {
    id: 'synth-inc-002',
    plate_text: 'DL03CD5678',
    plate_confidence: 0.92,
    trigger_reason: 'bus_lane_violation', // High OCR confidence >= 0.8 -> CONFIRMED heuristic
    location: { latitude: 28.6140, longitude: 77.2100, address: 'Ring Road near ITO Flyover' },
    clip_url: 'https://storage.transiteye.city/evidence/clips/inc_synth_002.mp4',
    bus_id: 'BUS-DEL-101',
    timestamp: new Date(Date.now() - 3000000).toISOString(),
    metadata: { synthetic: true, test_data: true, vehicle_type: 'sedan' }
  },
  {
    id: 'synth-inc-003',
    plate_text: 'HR26EF9012',
    plate_confidence: 0.88,
    trigger_reason: 'red_light', // CRITICAL trigger
    location: { latitude: 28.5810, longitude: 77.2310, address: 'Barapullah Corridor Junction' },
    clip_url: 'https://storage.transiteye.city/evidence/clips/inc_synth_003.mp4',
    bus_id: 'BUS-DEL-102',
    timestamp: new Date(Date.now() - 5000000).toISOString(),
    metadata: { synthetic: true, test_data: true }
  },
  {
    id: 'synth-inc-004',
    plate_text: 'UP16GH3456',
    plate_confidence: 0.62, // Lower confidence < 0.8 -> UNVERIFIED heuristic
    trigger_reason: 'speeding',
    location: { latitude: 28.5360, longitude: 77.2590, address: 'Okhla Industrial Estate Road' },
    clip_url: null, // Fallback test: no video clip
    bus_id: 'BUS-DEL-104',
    timestamp: new Date(Date.now() - 9000000).toISOString(),
    metadata: { synthetic: true, test_data: true }
  },
  {
    id: 'synth-inc-005',
    plate_text: 'DL02JK7890',
    plate_confidence: 0.95,
    trigger_reason: 'wrong_way', // CRITICAL trigger
    location: { latitude: 28.6410, longitude: 77.2210, address: 'Minto Bridge Underpass' },
    clip_url: 'https://storage.transiteye.city/evidence/clips/inc_synth_005.mp4',
    bus_id: 'BUS-DEL-108',
    timestamp: new Date(Date.now() - 12000000).toISOString(),
    metadata: { synthetic: true, test_data: true }
  },
  {
    id: 'synth-inc-006',
    plate_text: 'UNKNOWN', // Unrecognized plate test
    plate_confidence: 0.45,
    trigger_reason: 'pedestrian_hazard',
    location: { latitude: 28.5710, longitude: 77.2410, address: 'Lajpat Nagar Central Market' },
    clip_url: null,
    bus_id: 'BUS-DEL-105',
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    metadata: { synthetic: true, test_data: true }
  },
  {
    id: 'synth-inc-007',
    plate_text: 'DL05LM4321',
    plate_confidence: 0.91,
    trigger_reason: 'no_helmet',
    location: { latitude: 28.5210, longitude: 77.2110, address: 'Saket Press Enclave Road' },
    clip_url: 'https://storage.transiteye.city/evidence/clips/inc_synth_007.mp4',
    bus_id: 'BUS-DEL-106',
    timestamp: new Date(Date.now() - 25000000).toISOString(),
    metadata: { synthetic: true, test_data: true }
  },
  {
    id: 'synth-inc-008',
    plate_text: 'DL08NP8765',
    plate_confidence: 0.94,
    trigger_reason: 'signal_jump', // CRITICAL trigger
    location: { latitude: 28.6510, longitude: 77.1910, address: 'Karol Bagh Metro Crossing' },
    clip_url: 'https://storage.transiteye.city/evidence/clips/inc_synth_008.mp4',
    bus_id: 'BUS-DEL-107',
    timestamp: new Date(Date.now() - 35000000).toISOString(),
    metadata: { synthetic: true, test_data: true }
  }
];

const SYNTHETIC_VEHICLE_DENSITY = [
  {
    id: 'synth-vd-001',
    segment_id: 'SEG-DEL-RING-101',
    vehicle_count: 68,
    class_breakdown: { car: 35, bus: 8, truck: 4, motorcycle: 15, auto_rickshaw: 6 },
    bus_id: 'BUS-DEL-101',
    recorded_at: new Date(Date.now() - 900000).toISOString(),
    location: { latitude: 28.6145, longitude: 77.2098, speed: 12.0 },
    metadata: { synthetic: true, test_data: true, congestion_level: 'severe', sampling_window_sec: 30 }
  },
  {
    id: 'synth-vd-002',
    segment_id: 'SEG-DEL-CP-005',
    vehicle_count: 45,
    class_breakdown: { car: 22, bus: 5, truck: 2, motorcycle: 11, auto_rickshaw: 5 },
    bus_id: 'BUS-DEL-102',
    recorded_at: new Date(Date.now() - 1800000).toISOString(),
    location: { latitude: 28.6260, longitude: 77.2160, speed: 18.0 },
    metadata: { synthetic: true, test_data: true, congestion_level: 'heavy', sampling_window_sec: 30 }
  },
  {
    id: 'synth-vd-003',
    segment_id: 'SEG-DEL-NH48-002',
    vehicle_count: 28,
    class_breakdown: { car: 14, bus: 4, truck: 1, motorcycle: 6, auto_rickshaw: 3 },
    bus_id: 'BUS-DEL-103',
    recorded_at: new Date(Date.now() - 3600000).toISOString(),
    location: { latitude: 28.5810, longitude: 77.2310, speed: 35.0 },
    metadata: { synthetic: true, test_data: true, congestion_level: 'moderate', sampling_window_sec: 30 }
  },
  {
    id: 'synth-vd-004',
    segment_id: 'SEG-DEL-OKHLA-018',
    vehicle_count: 15,
    class_breakdown: { car: 7, bus: 2, truck: 1, motorcycle: 3, auto_rickshaw: 2 },
    bus_id: 'BUS-DEL-104',
    recorded_at: new Date(Date.now() - 5400000).toISOString(),
    location: { latitude: 28.5360, longitude: 77.2590, speed: 45.0 },
    metadata: { synthetic: true, test_data: true, congestion_level: 'low', sampling_window_sec: 30 }
  },
  {
    id: 'synth-vd-005',
    segment_id: 'SEG-DEL-RING-104',
    vehicle_count: 52,
    class_breakdown: { car: 26, bus: 6, truck: 3, motorcycle: 12, auto_rickshaw: 5 },
    bus_id: 'BUS-DEL-101',
    recorded_at: new Date(Date.now() - 600000).toISOString(),
    location: { latitude: 28.6410, longitude: 77.2210, speed: 14.0 },
    metadata: { synthetic: true, test_data: true, congestion_level: 'heavy', sampling_window_sec: 30 }
  }
];

// ── HTTP Helper Functions ──────────────────────────────────────────────────

async function postRecord(endpoint, payload) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(`POST ${endpoint} failed: ${data.error || res.statusText} - ${JSON.stringify(data.details || [])}`);
  }
  return data.data;
}

async function getRecords(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(`GET ${endpoint} failed: ${data.error || res.statusText}`);
  }
  return data.data || [];
}

async function deleteRecord(endpoint, id) {
  const res = await fetch(`${BASE_URL}${endpoint}/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(`DELETE ${endpoint}/${id} failed: ${data.error || res.statusText}`);
  }
  return data.data;
}

// ── Command Handlers ───────────────────────────────────────────────────────

async function seedData() {
  console.log('=== Seeding TransitEye Synthetic Test Dataset ===\n');

  // Verify health first
  try {
    const hRes = await fetch(`${BASE_URL}/api/health`);
    const hData = await hRes.json();
    if (!hRes.ok || hData.status !== 'healthy') {
      throw new Error(`Backend health check failed: ${JSON.stringify(hData)}`);
    }
    console.log(`[OK] Backend connected at ${BASE_URL}`);
  } catch (err) {
    console.error(`[ERROR] Backend unreachable at ${BASE_URL}. Ensure backend is running.`);
    process.exit(1);
  }

  const existingDetections = await getRecords('/api/detections');
  const existingIncidents = await getRecords('/api/incidents');
  const existingDensity = await getRecords('/api/vehicle-density');

  const existingDetIds = new Set(existingDetections.map((d) => d.id));
  const existingIncIds = new Set(existingIncidents.map((i) => i.id));
  const existingVdIds = new Set(existingDensity.map((v) => v.id));

  const seededRegistry = {
    detections: [],
    incidents: [],
    vehicleDensity: [],
    seededAt: new Date().toISOString(),
  };

  // 1. Seed Detections
  console.log('\n[1/3] Seeding Detections...');
  for (const det of SYNTHETIC_DETECTIONS) {
    const isUpdate = existingDetIds.has(det.id);
    const result = await postRecord('/api/detections', det);
    seededRegistry.detections.push(result.id);
    const prefix = isUpdate ? '  ~ Upserted Detection' : '  + Seeded Detection';
    console.log(`${prefix} [${result.id}] | ${result.type} (${result.severity}) | Status: ${result.status}`);
  }

  // 2. Seed Incidents
  console.log('\n[2/3] Seeding ANPR Incidents...');
  for (const inc of SYNTHETIC_INCIDENTS) {
    const isUpdate = existingIncIds.has(inc.id);
    const result = await postRecord('/api/incidents', inc);
    seededRegistry.incidents.push(result.id);
    const prefix = isUpdate ? '  ~ Upserted Incident' : '  + Seeded Incident';
    console.log(`${prefix} [${result.id}] | Plate: ${result.plate_text} (${Math.round(result.plate_confidence * 100)}%) | Trigger: ${result.trigger_reason}`);
  }

  // 3. Seed Vehicle Density
  console.log('\n[3/3] Seeding Vehicle Density Observations...');
  for (const vd of SYNTHETIC_VEHICLE_DENSITY) {
    const isUpdate = existingVdIds.has(vd.id);
    const result = await postRecord('/api/vehicle-density', vd);
    seededRegistry.vehicleDensity.push(result.id);
    const prefix = isUpdate ? '  ~ Upserted Density' : '  + Seeded Density';
    console.log(`${prefix} [${result.id}] | Vehicles: ${result.vehicle_count} | Congestion: ${result.metadata?.congestion_level}`);
  }

  // Save registry
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(seededRegistry, null, 2), 'utf8');

  console.log('\n======================================================');
  console.log(`SUCCESSFULLY SEEDED SYNTHETIC DATASET:`);
  console.log(`  - Detections:       ${seededRegistry.detections.length} records`);
  console.log(`  - Incidents:        ${seededRegistry.incidents.length} records`);
  console.log(`  - Vehicle Density:  ${seededRegistry.vehicleDensity.length} records`);
  console.log(`Registry saved to: ${REGISTRY_PATH}`);
  console.log('======================================================\n');
}

async function verifyData() {
  console.log('=== Verifying Active TransitEye Telemetry Data ===\n');

  const detections = await getRecords('/api/detections');
  const incidents = await getRecords('/api/incidents');
  const density = await getRecords('/api/vehicle-density');

  console.log(`Active Detections: ${detections.length}`);
  const synthDet = detections.filter((d) => d.metadata?.synthetic || d.id.startsWith('synth-'));
  console.log(`  - Synthetic: ${synthDet.length} | Non-synthetic: ${detections.length - synthDet.length}`);

  console.log(`\nActive ANPR Incidents: ${incidents.length}`);
  const synthInc = incidents.filter((i) => i.metadata?.synthetic || i.id.startsWith('synth-'));
  console.log(`  - Synthetic: ${synthInc.length} | Non-synthetic: ${incidents.length - synthInc.length}`);

  console.log(`\nActive Vehicle Density Observations: ${density.length}`);
  const synthVd = density.filter((v) => v.metadata?.synthetic || v.id.startsWith('synth-'));
  console.log(`  - Synthetic: ${synthVd.length} | Non-synthetic: ${density.length - synthVd.length}`);

  console.log('\n======================================================\n');
}

async function cleanupData() {
  console.log('=== TransitEye Synthetic Test Dataset Cleanup ===\n');

  // Identify synthetic records
  const detections = await getRecords('/api/detections');
  const incidents = await getRecords('/api/incidents');
  const density = await getRecords('/api/vehicle-density');

  let registryIds = { detections: [], incidents: [], vehicleDensity: [] };
  if (fs.existsSync(REGISTRY_PATH)) {
    try {
      registryIds = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    } catch {
      // fallback
    }
  }

  const detToDelete = detections.filter(
    (d) => registryIds.detections?.includes(d.id) || d.metadata?.synthetic || d.id.startsWith('synth-')
  );
  const incToDelete = incidents.filter(
    (i) => registryIds.incidents?.includes(i.id) || i.metadata?.synthetic || i.id.startsWith('synth-')
  );
  const vdToDelete = density.filter(
    (v) => registryIds.vehicleDensity?.includes(v.id) || v.metadata?.synthetic || v.id.startsWith('synth-')
  );

  const totalToDelete = detToDelete.length + incToDelete.length + vdToDelete.length;

  console.log(`Identified synthetic records for cleanup:`);
  console.log(`  - Synthetic Detections:       ${detToDelete.length} of ${detections.length} total`);
  console.log(`  - Synthetic ANPR Incidents:   ${incToDelete.length} of ${incidents.length} total`);
  console.log(`  - Synthetic Vehicle Density: ${vdToDelete.length} of ${density.length} total`);
  console.log(`  - Total synthetic records:   ${totalToDelete}\n`);

  if (totalToDelete === 0) {
    console.log('No synthetic records found to delete.');
    if (fs.existsSync(REGISTRY_PATH)) {
      fs.unlinkSync(REGISTRY_PATH);
    }
    return;
  }

  // Confirmation Phrase Check (from CLI arg or interactive prompt)
  let answer = process.argv[3];

  if (!answer) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    answer = await new Promise((resolve) => {
      rl.question('Type "my keychain" to delete all synthetic TransitEye test data: ', (ans) => {
        rl.close();
        resolve(ans);
      });
    });
  }

  // Strict exact phrase verification
  if (answer !== 'my keychain') {
    console.error('\n[DELETION ABORTED] Incorrect confirmation phrase.');
    console.error(`Received: "${answer}". Required exact phrase: "my keychain".`);
    process.exit(1);
  }

  console.log('\nConfirmation phrase verified. Executing deletion of synthetic test data...\n');

  let deletedDet = 0;
  for (const item of detToDelete) {
    await deleteRecord('/api/detections', item.id);
    deletedDet++;
    console.log(`  - Deleted synthetic detection: [${item.id}]`);
  }

  let deletedInc = 0;
  for (const item of incToDelete) {
    await deleteRecord('/api/incidents', item.id);
    deletedInc++;
    console.log(`  - Deleted synthetic incident: [${item.id}]`);
  }

  let deletedVd = 0;
  for (const item of vdToDelete) {
    await deleteRecord('/api/vehicle-density', item.id);
    deletedVd++;
    console.log(`  - Deleted synthetic vehicle density record: [${item.id}]`);
  }

  if (fs.existsSync(REGISTRY_PATH)) {
    fs.unlinkSync(REGISTRY_PATH);
  }

  console.log('\n======================================================');
  console.log('CLEANUP SUMMARY:');
  console.log(`  - Synthetic Detections deleted:       ${deletedDet}`);
  console.log(`  - Synthetic Incidents deleted:        ${deletedInc}`);
  console.log(`  - Synthetic Vehicle Density deleted:  ${deletedVd}`);
  console.log(`  - Non-synthetic records touched:      0`);
  console.log('======================================================\n');
}

// ── Entry Point ─────────────────────────────────────────────────────────────

async function main() {
  const arg = (process.argv[2] || 'seed').toLowerCase();
  try {
    if (arg === 'seed') {
      await seedData();
    } else if (arg === 'cleanup' || arg === 'clean') {
      await cleanupData();
    } else if (arg === 'verify') {
      await verifyData();
    } else {
      console.log(`Usage: node tests/seed_synthetic_data.js [seed | cleanup | verify]`);
    }
  } catch (err) {
    console.error(`\n[FATAL ERROR] Command failed:`, err.message);
    process.exit(1);
  }
}

main();
