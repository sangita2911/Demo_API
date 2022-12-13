const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    type: { type: String, default: "in"},
    unit: {type: Number, default: 0},
    remaining_unit: {type: Number, default: 0},
    product_id: {type: mongoose.Schema.Types.ObjectId, ref: 'products', default: null},
    created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", default: null},
    updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", default: null},
    deleted_by: {type: mongoose.Schema.Types.ObjectId,ref: "users",default: null},
    deleted_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("stock", stockSchema);