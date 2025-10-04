const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LoginPermissionSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true},
    emailVerification: { type: Boolean, default: true },
    googleAuthVerification: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('loginPermission', LoginPermissionSchema);
