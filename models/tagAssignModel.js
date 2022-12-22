const mongoose = require("mongoose");

const productTagAssignSchema = new mongoose.Schema({
  token:{type:String,default:null},
  product_id:{type: mongoose.Schema.Types.ObjectId, ref: 'products', default: null },
  product_tag_id:{type: mongoose.Schema.Types.ObjectId, ref: 'tag', default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('product_tag_assigns', productTagAssignSchema);