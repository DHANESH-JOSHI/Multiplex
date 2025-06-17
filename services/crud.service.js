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

            return { suscess: true, message: "Record created successfully", data: newDocument };
        } catch (error) {
            throw new Error("Error creating record: " + error.message);
        }
    }

    // Get all documents with dynamic sorting & pagination
    async getAll(model, filter = {}, options = {}) {
        try {
            let {
                limit = 100,
                sortBy = "_id",
                sortOrder = "asc",
                cursor = null,
                populate = null,
                direction = "next",
                goTo = null,
                page = 1 // Add page option for regular pagination
            } = options;
    
            const cursorField = sortBy;
    
            if (!sortBy || typeof sortBy !== "string") {
                throw new Error("Invalid sorting field");
            }
    
            const baseSortOrder = sortOrder.toLowerCase() === "asc" ? 1 : -1;
            let effectiveSortOrder = baseSortOrder;
            let query = { ...filter };
    
            if (goTo === "first") {
                // First page — no cursor filter needed
            } else if (goTo === "last") {
                // Reverse sort to get last page
                effectiveSortOrder = baseSortOrder * -1;
            } else if (cursor) {
                if (direction === "next") {
                    query[cursorField] = {
                        [baseSortOrder === 1 ? "$gt" : "$lt"]: cursor
                    };
                } else if (direction === "previous") {
                    query[cursorField] = {
                        [baseSortOrder === 1 ? "$lt" : "$gt"]: cursor
                    };
                    effectiveSortOrder = baseSortOrder * -1;
                }
            } else if (page && page > 1) {
                // Paginate by page if cursor is not used
                const skip = (page - 1) * limit;
                query = { ...filter };
            }
    
            let dbQuery = model.find(query)
                .sort({ [cursorField]: effectiveSortOrder })
                .limit(parseInt(limit));
    
            if (populate) {
                if (Array.isArray(populate)) {
                    populate.forEach(p => dbQuery = dbQuery.populate(p));
                } else {
                    dbQuery = dbQuery.populate(populate);
                }
            }
    
            let records = await dbQuery;
    
            // Reverse only for "previous" and "goTo: last" to maintain display order
            if (direction === "previous" || goTo === "last") {
                records = records.reverse();
            }
    
            const totalCount = await model.countDocuments(filter);
            const pageCount = Math.ceil(totalCount / limit);
    
            if (records.length === 0) {
                return {
                    message: "No records found.",
                    data: [],
                    totalCount,
                    pageCount,
                    currentPage: page,
                    nextCursor: null,
                    prevCursor: null
                };
            }
    
            // Set cursors from the first and last record
            const nextCursor = records.length > 0 ? records[records.length - 1]._id : null;
            const prevCursor = records.length > 0 ? records[0]._id : null;
    
            let currentPage = page;
            if (cursor) {
                let cursorQuery = { ...filter };
                const comparisonOperator = baseSortOrder === 1 ? "$lt" : "$gt";
                cursorQuery[cursorField] = { [comparisonOperator]: cursor };
                const recordsBefore = await model.countDocuments(cursorQuery);
                currentPage = Math.floor(recordsBefore / limit) + 1;
            } else if (goTo === "last") {
                currentPage = pageCount;
            }
    
            return {
                message: "Records fetched successfully",
                data: records,
                totalCount,
                pageCount,
                currentPage,
                nextCursor,
                prevCursor
            };
        } catch (error) {
            throw new Error("Error fetching records: " + error.message);
        }
    }

    async getAllPages(model, filter = {}, options = {}) {
        try {
            let {
                limit = 12,
                sortBy = "_id",
                sortOrder = "asc",
                page = 1,
                populate = null
            } = options;

            if (!sortBy || typeof sortBy !== "string") {
                throw new Error("Invalid sorting field");
            }

            const sortDirection = sortOrder.toLowerCase() === "asc" ? 1 : -1;
            const skip = (page - 1) * limit;

            let dbQuery = model.find(filter)
                .sort({ [sortBy]: sortDirection })
                .skip(skip)
                .limit(parseInt(limit));

            if (populate) {
                if (Array.isArray(populate)) {
                    populate.forEach(p => dbQuery = dbQuery.populate(p));
                } else {
                    dbQuery = dbQuery.populate(populate);
                }
            }

            const records = await dbQuery;
            const totalCount = await model.countDocuments(filter);
            const pageCount = Math.ceil(totalCount / limit);

            return {
                message: "Records fetched successfully",
                data: records,
                totalCount,
                pageCount,
                currentPage: page,
                hasNextPage: page < pageCount,
                hasPreviousPage: page > 1,
            };

        } catch (error) {
            throw new Error("Error fetching records: " + error.message);
        }
    }




    // Get a single document by ID
    async getById(model, idField, id, populateOptions) {
        try {
            const query = mongoose.Types.ObjectId.isValid(id)
                ? { [idField]: id }
                : { [idField]: parseInt(id) };

            let dbQuery = model.findOne(query);

            // ✅ Only apply populate if it exists and is valid
            if (populateOptions && typeof populateOptions === "object") {
                dbQuery = dbQuery.populate(populateOptions);
            }

            const record = await dbQuery;

            if (!record) {
                throw new Error("Record not found.");
            }

            return { message: "Record fetched successfully", data: record };
        } catch (error) {
            throw new Error("Error fetching record: " + error.message);
        }
    }

    async getByIdAllNest(model, idField, id, populateOptions) {
        try {
            const query = mongoose.Types.ObjectId.isValid(id)
            ? { [idField]: id }
            : { [idField]: parseInt(id) };

            let dbQuery = model.findOne(query);

            if (populateOptions) {
            dbQuery = dbQuery.populate(populateOptions);
            }

            const record = await dbQuery;

            if (!record) {
            throw new Error("Record not found.");
            }

            return { message: "Record fetched successfully", data: record };
        } catch (error) {
            throw new Error("Error fetching record: " + error.message);
        }
    }


    async getManyByField(model, field, value, populateOptions) {
        const query = { [field]: value };

        let dbQuery = model.find(query);
        if (populateOptions && typeof populateOptions === "object") {
            dbQuery = dbQuery.populate(populateOptions);
        }

        const records = await dbQuery;
        if (!records.length) {
            throw new Error("No records found.");
        }
        return { message: "Records fetched successfully", data: records };
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
