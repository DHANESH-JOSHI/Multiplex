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
router.get("/plans/:id", getPlanById);
router.get('/plans/country/:country', getPlansByCountry);
router.put("/plans/:id", updatePlan);
router.delete("/plans/:id", deletePlan);

module.exports = router;