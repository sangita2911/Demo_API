const mongoose = require("mongoose");

const productAssignCategorySchema = new mongoose.Schema(
  {
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "products", default: null },
    product_category_id: { type: mongoose.Schema.Types.ObjectId, ref: "categories", default: null },
    ordering: { type: Number, default: 0 }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model( "product_assign_categories", productAssignCategorySchema);