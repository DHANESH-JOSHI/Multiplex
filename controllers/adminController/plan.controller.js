const axios = require("axios");
const PlanSchema = require("../../models/plan.model");

// Add a new plan
exports.addPlan = async (req, res) => {
    try {
        const { plan_id, name, day, screens, price, status, country } = req.body;

        if (!plan_id || !name || !price || status === undefined) {
            return res.status(400).json({ message: "plan_id, name, price and status are required" });
        }

        const existingPlan = await PlanSchema.findOne({ plan_id });
        if (existingPlan) {
            return res.status(409).json({ message: "Plan with this plan_id already exists" });
        }

        const newPlan = new PlanSchema(req.body);

        await newPlan.save();
        res.status(201).json({ message: "Plan added successfully", data: newPlan });
    } catch (error) {
        res.status(500).json({ message: "Error adding plan", error: error.message });
    }
};

// Get all plans
exports.getAllPlans = async (req, res) => {
    try {
        const plans = await PlanSchema.find();
        res.status(200).json({ message: "Plans retrieved successfully", data: plans });
    } catch (error) {
        res.status(500).json({ message: "Error fetching plans", error: error.message });
    }
};

// Get single plan by ID
exports.getPlanById = async (req, res) => {
    try {
        const plan = await PlanSchema.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
        }
        res.status(200).json({ message: "Plan retrieved successfully", data: plan });
    } catch (error) {
        res.status(500).json({ message: "Error fetching plan", error: error.message });
    }
};

// Update plan by ID
exports.updatePlan = async (req, res) => {
    try {
        const updatedPlan = await PlanSchema.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPlan) {
            return res.status(404).json({ message: "Plan not found" });
        }
        res.status(200).json({ message: "Plan updated successfully", data: updatedPlan });
    } catch (error) {
        res.status(500).json({ message: "Error updating plan", error: error.message });
    }
};

// Delete plan by ID
exports.deletePlan = async (req, res) => {
    try {
        const deletedPlan = await PlanSchema.findByIdAndDelete(req.params.id);
        if (!deletedPlan) {
            return res.status(404).json({ message: "Plan not found" });
        }
        res.status(200).json({ message: "Plan deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting plan", error: error.message });
    }
};
