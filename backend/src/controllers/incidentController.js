const incidentService = require("../services/incidentService");

/**
 * Controller for handling incident / ANPR HTTP requests.
 */

exports.createIncident = async (req, res, next) => {
  try {
    const created = await incidentService.createIncident(req.body);
    return res.status(201).json({
      success: true,
      message: "Incident accepted and recorded",
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

exports.getIncidents = async (req, res, next) => {
  try {
    const incidents = await incidentService.getAllIncidents();
    return res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteIncident = async (req, res, next) => {
  try {
    const deleted = await incidentService.deleteIncident(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Incident record not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Incident record deleted",
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};
