const mongoose = require("mongoose");

function toObjectId(id) {
    return id ? new mongoose.Types.ObjectId(id) : null;

}
module.exports = toObjectId;
