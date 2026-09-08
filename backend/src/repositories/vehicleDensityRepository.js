/**
 * Vehicle Density Repository
 *
 * Provides persistence for traffic intelligence observations.
 * Production/application runtime strictly requires Supabase/PostGIS.
 * In-memory repository is retained for explicit test usage only.
 *
 * Invariant: location JSONB is stored directly; the PostGIS `geom`
 * column is populated/updated automatically by a database trigger.
 * Repositories must NOT send `geom` in write payloads.
 */

const { supabase, supabaseEnabled } = require("../config/supabaseClient");

class InMemoryVehicleDensityRepository {
  constructor() {
    this.records = [];
  }

  async create(record) {
    this.records.push(record);
    return { ...record };
  }

  async findAll() {
    return this.records.map((r) => ({ ...r }));
  }

  async findById(id) {
    const item = this.records.find((r) => r.id === id);
    return item ? { ...item } : null;
  }

  async clear() {
    this.records = [];
  }
}

class SupabaseVehicleDensityRepository {
  constructor(client = supabase) {
    if (!client) {
      throw new Error(
        "[TransitEye Configuration Error] Supabase is required for application runtime, " +
          "but the Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_SECRET_KEY in .env. " +
          "Silent in-memory fallback is disabled in application mode."
      );
    }
    this.client = client;
    this.table = "vehicle_density";
  }

  async create(record) {
    // Strip geom if present — PostgreSQL trigger computes geom from location
    const { geom, ...dbPayload } = record;

    const { data, error } = await this.client
      .from(this.table)
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
      throw new Error(`[SupabaseVehicleDensityRepository.create] Failed: ${error.message} (code: ${error.code})`);
    }

    return data;
  }

  async findAll() {
    const { data, error } = await this.client
      .from(this.table)
      .select("*")
      .order("recorded_at", { ascending: false });

    if (error) {
      throw new Error(`[SupabaseVehicleDensityRepository.findAll] Failed: ${error.message} (code: ${error.code})`);
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
      throw new Error(`[SupabaseVehicleDensityRepository.findById] Failed: ${error.message} (code: ${error.code})`);
    }

    return data || null;
  }

  async clear() {
    throw new Error(
      "[SupabaseVehicleDensityRepository.clear] clear() is disabled on Supabase repository " +
        "to prevent accidental deletion of database records. Clean up test records by specific ID."
    );
  }
}

// Select repository: In-memory only if explicitly requested via USE_IN_MEMORY_REPO=true
let repositoryInstance;
if (process.env.USE_IN_MEMORY_REPO === "true") {
  repositoryInstance = new InMemoryVehicleDensityRepository();
} else {
  repositoryInstance = new SupabaseVehicleDensityRepository();
}

module.exports = repositoryInstance;
module.exports.SupabaseVehicleDensityRepository = SupabaseVehicleDensityRepository;
module.exports.InMemoryVehicleDensityRepository = InMemoryVehicleDensityRepository;
