const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../../data");
const FILE_PATH = path.join(DATA_DIR, "incidents.json");

class InMemoryIncidentRepository {
  constructor() {
    this.incidents = [];
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
        this.incidents = JSON.parse(raw);
      }
    } catch (err) {
      console.error("Failed to load incidents from disk:", err.message);
      this.incidents = [];
    }
  }

  _saveToStorage() {
    try {
      this._ensureStorageDir();
      fs.writeFileSync(FILE_PATH, JSON.stringify(this.incidents, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to save incidents to disk:", err.message);
    }
  }

  async create(incident) {
    const existingIndex = this.incidents.findIndex((inc) => inc.id === incident.id);
    if (existingIndex !== -1) {
      this.incidents[existingIndex] = { ...incident };
    } else {
      this.incidents.push(incident);
    }
    this._saveToStorage();
    return { ...incident };
  }

  async findAll() {
    return this.incidents.map((inc) => ({ ...inc }));
  }

  async findById(id) {
    const item = this.incidents.find((inc) => inc.id === id);
    return item ? { ...item } : null;
  }

  async deleteById(id) {
    const index = this.incidents.findIndex((inc) => inc.id === id);
    if (index !== -1) {
      const deleted = this.incidents.splice(index, 1)[0];
      this._saveToStorage();
      return { ...deleted };
    }
    return null;
  }

  async clear() {
    this.incidents = [];
    this._saveToStorage();
  }
}

module.exports = new InMemoryIncidentRepository();

