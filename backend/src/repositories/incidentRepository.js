/**
 * Incident Repository
 *
 * Provides persistence for incidents / ANPR records.
 * Production/application runtime strictly requires Supabase/PostGIS.
 * In-memory repository is retained for explicit test usage only.
 *
 * Invariant: location JSONB is stored directly; the PostGIS `geom`
 * column is populated/updated automatically by a database trigger.
 * Repositories must NOT send `geom` in write payloads.
 */

const { supabase, supabaseEnabled } = require("../config/supabaseClient");

class InMemoryIncidentRepository {
  constructor() {
    this.incidents = [];
  }

  async create(incident) {
    this.incidents.push(incident);
    return { ...incident };
  }

  async findAll() {
    return this.incidents.map((inc) => ({ ...inc }));
  }

  async findById(id) {
    const item = this.incidents.find((inc) => inc.id === id);
    return item ? { ...item } : null;
  }

  async clear() {
    this.incidents = [];
  }
}

class SupabaseIncidentRepository {
  constructor(client = supabase) {
    if (!client) {
      throw new Error(
        "[TransitEye Configuration Error] Supabase is required for application runtime, " +
          "but the Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_SECRET_KEY in .env. " +
          "Silent in-memory fallback is disabled in application mode."
      );
    }
    this.client = client;
    this.table = "incidents";
  }

  async create(incident) {
    // Strip geom if present — PostgreSQL trigger computes geom from location
    const { geom, ...dbPayload } = incident;

    const { data, error } = await this.client
      .from(this.table)
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
      throw new Error(`[SupabaseIncidentRepository.create] Failed: ${error.message} (code: ${error.code})`);
    }

    return data;
  }

  async findAll() {
    const { data, error } = await this.client
      .from(this.table)
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      throw new Error(`[SupabaseIncidentRepository.findAll] Failed: ${error.message} (code: ${error.code})`);
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
      throw new Error(`[SupabaseIncidentRepository.findById] Failed: ${error.message} (code: ${error.code})`);
    }

    return data || null;
  }

  async clear() {
    throw new Error(
      "[SupabaseIncidentRepository.clear] clear() is disabled on Supabase repository " +
        "to prevent accidental deletion of database records. Clean up test records by specific ID."
    );
  }
}

// Select repository: In-memory only if explicitly requested via USE_IN_MEMORY_REPO=true
let repositoryInstance;
if (process.env.USE_IN_MEMORY_REPO === "true") {
  repositoryInstance = new InMemoryIncidentRepository();
} else {
  repositoryInstance = new SupabaseIncidentRepository();
}

module.exports = repositoryInstance;
module.exports.SupabaseIncidentRepository = SupabaseIncidentRepository;
module.exports.InMemoryIncidentRepository = InMemoryIncidentRepository;
