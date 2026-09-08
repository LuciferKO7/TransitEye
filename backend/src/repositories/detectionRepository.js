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
