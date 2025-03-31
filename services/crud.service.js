const mongoose = require("mongoose");

class CRUDService {
    // Create a new document
    async create(model, data) {
        try {
            if (!data || typeof data !== "object") {
                throw new Error("Invalid data provided for creation.");
            }

            const newDocument = new model(data);
            await newDocument.validate(); // Run schema validations
            await newDocument.save();

            return { message: "Record created successfully", data: newDocument };
        } catch (error) {
            throw new Error("Error creating record: " + error.message);
        }
    }

    // Get all documents
    async getAll(model, filter = {}) {
        try {
            const records = await model.find(filter);
            return { message: "Records fetched successfully", data: records };
        } catch (error) {
            throw new Error("Error fetching records: " + error.message);
        }
    }

    // Get a single document by ID
    async getById(model, idField, id) {
        try {
            let query = mongoose.Types.ObjectId.isValid(id) 
                ? { [idField]: id } 
                : { [idField]: parseInt(id) };

            const record = await model.findOne(query);
            if (!record) {
                throw new Error("Record not found.");
            }

            return { message: "Record fetched successfully", data: record };
        } catch (error) {
            throw new Error("Error fetching record: " + error.message);
        }
    }

    // Update a document by ID
    async update(model, idField, id, updateData) {
        try {
            let query = mongoose.Types.ObjectId.isValid(id) 
                ? { [idField]: id } 
                : { [idField]: parseInt(id) };

            const updatedRecord = await model.findOneAndUpdate(query, updateData, { new: true, runValidators: true });
            if (!updatedRecord) {
                throw new Error("Record not found.");
            }

            return { message: "Record updated successfully", data: updatedRecord };
        } catch (error) {
            throw new Error("Error updating record: " + error.message);
        }
    }

    // Delete a document by ID
    async delete(model, idField, id) {
        try {
            let query = mongoose.Types.ObjectId.isValid(id) 
                ? { [idField]: id } 
                : { [idField]: parseInt(id) };

            const deletedRecord = await model.findOneAndDelete(query);
            if (!deletedRecord) {
                throw new Error("Record not found.");
            }

            return { message: "Record deleted successfully" };
        } catch (error) {
            throw new Error("Error deleting record: " + error.message);
        }
    }
}

module.exports = new CRUDService();
