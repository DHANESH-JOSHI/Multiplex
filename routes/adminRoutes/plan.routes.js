const express = require("express");
const router = express.Router();
const {
    addPlan,
    getAllPlans,
    getPlanById,
    getPlansByCountry,
    updatePlan,
    deletePlan
} = require("../../controllers/adminController/plan.controller");

router.post("/plans", addPlan);
router.get("/plans", getAllPlans);
router.get("/plans/", getPlanById);
router.get('/plans/country/', getPlansByCountry);
router.put("/plans/", updatePlan);
router.delete("/plans/", deletePlan);

module.exports = router;