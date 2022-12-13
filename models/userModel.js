const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  name: { type: String, default: null },
  phone: { type: Number, default: null },
  email: { type: String, default: null },


  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },

  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },

  deleted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },

  deleted_at: { type: Date, default: null },

}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });


module.exports = mongoose.model('users', userSchema);