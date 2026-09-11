const express = require("express");
const router = express.Router();
const incidentController = require("../controllers/incidentController");
const validateIncident = require("../middleware/validateIncident");

// Ingestion, retrieval, and deletion routes for incidents / ANPR
router.post("/", validateIncident, incidentController.createIncident);
router.get("/", incidentController.getIncidents);
router.delete("/:id", incidentController.deleteIncident);

module.exports = router;
