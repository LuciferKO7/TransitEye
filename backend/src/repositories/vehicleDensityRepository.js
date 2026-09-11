const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../../data");
const FILE_PATH = path.join(DATA_DIR, "vehicle_density.json");

class InMemoryVehicleDensityRepository {
  constructor() {
    this.records = [];
    this._loadFromStorage();
  }

  _ensureStorageDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  _loadFromStorage() {
    try {
      this._ensureStorageDir();
      if (fs.existsSync(FILE_PATH)) {
        const raw = fs.readFileSync(FILE_PATH, "utf8");
        this.records = JSON.parse(raw);
      }
    } catch (err) {
      console.error("Failed to load vehicle density records from disk:", err.message);
      this.records = [];
    }
  }

  _saveToStorage() {
    try {
      this._ensureStorageDir();
      fs.writeFileSync(FILE_PATH, JSON.stringify(this.records, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to save vehicle density records to disk:", err.message);
    }
  }

  async create(record) {
    const existingIndex = this.records.findIndex((r) => r.id === record.id);
    if (existingIndex !== -1) {
      this.records[existingIndex] = { ...record };
    } else {
      this.records.push(record);
    }
    this._saveToStorage();
    return { ...record };
  }

  async findAll() {
    return this.records.map((r) => ({ ...r }));
  }

  async findById(id) {
    const item = this.records.find((r) => r.id === id);
    return item ? { ...item } : null;
  }

  async deleteById(id) {
    const index = this.records.findIndex((r) => r.id === id);
    if (index !== -1) {
      const deleted = this.records.splice(index, 1)[0];
      this._saveToStorage();
      return { ...deleted };
    }
    return null;
  }

  async clear() {
    this.records = [];
    this._saveToStorage();
  }
}

module.exports = new InMemoryVehicleDensityRepository();

