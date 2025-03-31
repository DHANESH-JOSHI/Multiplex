const mongoose = require("mongoose");

class CRUDService {
    // 📌 Create a new document
    async create(model, data) {
        try {
            if (!data || typeof data !== "object") {
                throw new Error("Invalid data provided for creation.");
            }

            const newDocument = new model(data);
            await newDocument.validate(); // Schema validations
            await newDocument.save();

            return { message: "Record created successfully", data: newDocument };
        } catch (error) {
            throw new Error("Error creating record: " + error.message);
        }
    }

    // Get all documents with dynamic sorting & pagination
    async getAll(model, filter = {}, options = {}) {
        try {
            let { limit = 10, sortBy = "createdAt", sortOrder = "desc", cursorField = "_id", cursor = null } = options;

            // Validate Sorting Field
            if (!sortBy || typeof sortBy !== "string") {
                throw new Error("Invalid sorting field");
            }

            // Validate Sorting Order
            sortOrder = sortOrder.toLowerCase() === "asc" ? 1 : -1;

            // Sliding Window Pagination Logic
            let query = filter;
            if (cursor) {
                query[cursorField] = { [sortOrder === 1 ? "$gt" : "$lt"]: cursor };
            }

            const records = await model.find(query)
                .sort({ [sortBy]: sortOrder }) // Dynamic Sorting
                .limit(parseInt(limit));

            // Next Cursor for Pagination
            const nextCursor = records.length > 0 ? records[records.length - 1][cursorField] : null;

            return {
                message: "Records fetched successfully",
                data: records,
                nextCursor
            };
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

    //  Delete a document by ID
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
