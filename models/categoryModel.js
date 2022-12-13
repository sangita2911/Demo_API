const mongoose = require('mongoose');



const categorySchema = new mongoose.Schema({

  name: { type: String, default: null },

  category_type: { type: String, default: null },

  status: { type: Boolean, default: null },

  image: { type: String, default: null },

  slug: { type: String, default: null },

  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', default: null },

  deleted_at: { type: Date, default: null },

  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },

  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },

  deleted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null }

}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });



module.exports = mongoose.model('categories', categorySchema);