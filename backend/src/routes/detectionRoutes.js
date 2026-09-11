const express = require("express");
const router = express.Router();
const detectionController = require("../controllers/detectionController");
const validateDetection = require("../middleware/validateDetection");

// Ingestion, retrieval, and deletion routes for detections
router.post("/", validateDetection, detectionController.createDetection);
router.get("/", detectionController.getDetections);
router.delete("/:id", detectionController.deleteDetection);

module.exports = router;
