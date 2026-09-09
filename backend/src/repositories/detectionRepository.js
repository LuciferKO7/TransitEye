/**
 * Detection Repository
 *
 * Provides persistence for detection observations.
 * Production/application runtime strictly requires Supabase/PostGIS.
 * In-memory repository is retained for explicit test usage only.
 *
 * Invariant: location JSONB is stored directly; the PostGIS `geom`
 * column is populated/updated automatically by a database trigger.
 * Repositories must NOT send `geom` in write payloads.
 */

const { supabase, supabaseEnabled } = require("../config/supabaseClient");

function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

class InMemoryDetectionRepository {
  constructor() {
    this.detections = [];
  }

  async create(detection) {
    this.detections.push(detection);
    return { ...detection };
  }

  async findAll() {
    return this.detections.map((d) => ({ ...d }));
  }

  async findById(id) {
    const item = this.detections.find((d) => d.id === id);
    return item ? { ...item } : null;
  }

  async findConsensusCandidate({
    type,
    subtype,
    segment_id = null,
    latitude = null,
    longitude = null,
    windowHours = 24.0,
    maxDistanceMeters = 30.0,
  }) {
    const cutoff = new Date(Date.now() - windowHours * 3600 * 1000);
    const candidates = this.detections.filter((d) => {
      if (d.type !== type || d.subtype !== subtype) return false;
      if (!["pending", "confirmed"].includes(d.status)) return false;
      if (new Date(d.timestamp) < cutoff) return false;

      // Segment match
      if (segment_id && d.segment_id === segment_id) return true;

      // Proximity match
      if (
        latitude !== null &&
        longitude !== null &&
        d.location &&
        d.location.latitude != null &&
        d.location.longitude != null
      ) {
        const dist = haversineDistanceMeters(
          latitude,
          longitude,
          d.location.latitude,
          d.location.longitude
        );
        return dist <= maxDistanceMeters;
      }

      return false;
    });

    if (candidates.length === 0) return null;
    return { ...candidates[0] };
  }

  async update(id, updates) {
    const idx = this.detections.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    this.detections[idx] = { ...this.detections[idx], ...updates };
    return { ...this.detections[idx] };
  }

  async clear() {
    this.detections = [];
  }
}

class SupabaseDetectionRepository {
  constructor(client = supabase) {
    if (!client) {
      throw new Error(
        "[TransitEye Configuration Error] Supabase is required for application runtime, " +
          "but the Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_SECRET_KEY in .env. " +
          "Silent in-memory fallback is disabled in application mode."
      );
    }
    this.client = client;
    this.table = "detections";
  }

  async create(detection) {
    // Strip geom if present — PostgreSQL trigger computes geom from location
    const { geom, ...dbPayload } = detection;

    const { data, error } = await this.client
      .from(this.table)
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
      throw new Error(`[SupabaseDetectionRepository.create] Failed: ${error.message} (code: ${error.code})`);
    }

    return data;
  }

  async findAll() {
    const { data, error } = await this.client
      .from(this.table)
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      throw new Error(`[SupabaseDetectionRepository.findAll] Failed: ${error.message} (code: ${error.code})`);
    }

    return data || [];
  }

  async findById(id) {
    const { data, error } = await this.client
      .from(this.table)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`[SupabaseDetectionRepository.findById] Failed: ${error.message} (code: ${error.code})`);
    }

    return data || null;
  }

  async findConsensusCandidate({
    type,
    subtype,
    segment_id = null,
    latitude = null,
    longitude = null,
    windowHours = 24.0,
    maxDistanceMeters = 30.0,
  }) {
    const { data, error } = await this.client.rpc("find_consensus_detection", {
      p_type: type,
      p_subtype: subtype,
      p_segment_id: segment_id || null,
      p_lat: latitude !== null && latitude !== undefined ? Number(latitude) : null,
      p_lon: longitude !== null && longitude !== undefined ? Number(longitude) : null,
      p_window_hours: Number(windowHours),
      p_max_distance_meters: Number(maxDistanceMeters),
    });

    if (error) {
      throw new Error(
        `[SupabaseDetectionRepository.findConsensusCandidate] RPC failed: ${error.message} (code: ${error.code})`
      );
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Return the closest matching candidate record
    return data[0];
  }

  async update(id, updates) {
    // Strip geom if present — PostgreSQL trigger computes geom from location
    const { geom, ...dbPayload } = updates;

    const { data, error } = await this.client
      .from(this.table)
      .update(dbPayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(
        `[SupabaseDetectionRepository.update] Failed: ${error.message} (code: ${error.code})`
      );
    }

    return data;
  }

  async clear() {
    throw new Error(
      "[SupabaseDetectionRepository.clear] clear() is disabled on Supabase repository " +
        "to prevent accidental deletion of database records. Clean up test records by specific ID."
    );
  }
}

// Select repository: In-memory only if explicitly requested via USE_IN_MEMORY_REPO=true
let repositoryInstance;
if (process.env.USE_IN_MEMORY_REPO === "true") {
  repositoryInstance = new InMemoryDetectionRepository();
} else {
  repositoryInstance = new SupabaseDetectionRepository();
}

module.exports = repositoryInstance;
module.exports.SupabaseDetectionRepository = SupabaseDetectionRepository;
module.exports.InMemoryDetectionRepository = InMemoryDetectionRepository;
