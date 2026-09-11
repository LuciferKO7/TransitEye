const express = require("express");
const router = express.Router();
const vehicleDensityController = require("../controllers/vehicleDensityController");
const validateVehicleDensity = require("../middleware/validateVehicleDensity");

// Ingestion, retrieval, and deletion routes for vehicle density
router.post("/", validateVehicleDensity, vehicleDensityController.createVehicleDensity);
router.get("/", vehicleDensityController.getVehicleDensity);
router.delete("/:id", vehicleDensityController.deleteVehicleDensity);

module.exports = router;
