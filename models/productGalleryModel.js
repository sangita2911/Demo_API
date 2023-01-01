const mongoose = require("mongoose");

const GallerySchema = new mongoose.Schema(
  {
    title: { type: String, default: null },
    image: { type: String, default: null },
    ordering: { type: Number, default: 0 },

    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      default: null,
    },
    status: { type: Boolean, default: true },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    deleted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("product_galleries", GallerySchema);
