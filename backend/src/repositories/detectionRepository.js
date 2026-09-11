const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../../data");
const FILE_PATH = path.join(DATA_DIR, "detections.json");

class InMemoryDetectionRepository {
  constructor() {
    this.detections = [];
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
        this.detections = JSON.parse(raw);
      }
    } catch (err) {
      console.error("Failed to load detections from disk:", err.message);
      this.detections = [];
    }
  }

  _saveToStorage() {
    try {
      this._ensureStorageDir();
      fs.writeFileSync(FILE_PATH, JSON.stringify(this.detections, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to save detections to disk:", err.message);
    }
  }

  async create(detection) {
    const existingIndex = this.detections.findIndex((d) => d.id === detection.id);
    if (existingIndex !== -1) {
      this.detections[existingIndex] = { ...detection };
    } else {
      this.detections.push(detection);
    }
    this._saveToStorage();
    return { ...detection };
  }

  async findAll() {
    return this.detections.map((d) => ({ ...d }));
  }

  async findById(id) {
    const item = this.detections.find((d) => d.id === id);
    return item ? { ...item } : null;
  }

  async deleteById(id) {
    const index = this.detections.findIndex((d) => d.id === id);
    if (index !== -1) {
      const deleted = this.detections.splice(index, 1)[0];
      this._saveToStorage();
      return { ...deleted };
    }
    return null;
  }

  async clear() {
    this.detections = [];
    this._saveToStorage();
  }
}

// Export singleton instance for app runtime
module.exports = new InMemoryDetectionRepository();

