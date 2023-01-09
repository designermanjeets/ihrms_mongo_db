const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const auditSchema = mongoose.Schema({
  created_at: Date,
  created_by: String,
  modified_at: Date,
  modified_by: String,
});

const leaveRequestSchema = new Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, immutable: true },
  user: { type: Object, ref: 'Users' },
  startDate: { type: Date, required: true, immutable: true },
  endDate: { type: Date, required: true, immutable: true },
  days: { type: Number, default: 0, immutable: true },
  leaveTypeID: { type: mongoose.Schema.Types.ObjectId, immutable: true },
  leaveType: { type: Object, immutable: true, ref: 'LeaveTypes' },
  toManagerID: { type: mongoose.Schema.Types.ObjectId },
  toManager: { type: Object, ref: 'Users' },
  status: {
    type: String,
    enum: ['Pending', 'Declined', 'Approved'],
    default: 'Pending',
  },
  comments: String,
  tenantid: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenants', required: true },
  audit: auditSchema,
}, { collection: 'LeaveRequests' }, { timestamps: true } );


module.exports = mongoose.model('LeaveRequests', leaveRequestSchema);
