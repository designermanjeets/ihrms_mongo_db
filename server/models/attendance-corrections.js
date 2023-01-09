const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const auditSchema = mongoose.Schema({
  created_at: Date,
  created_by: String,
  modified_at: Date,
  modified_by: String,
});

const attendanceCorrectionSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, immutable: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    eCode: { type: String },
    date: { type: Date, immutable: true, nullable: true },
    inTime: { type: Date, nullable: true },
    outTime: { type: Date, nullable: true },
    shiftName: { type: String },
    overTime: { type: Number },
    totalDayWorkingHours: { type: Number },
    comments: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Declined', 'Approved'],
      default: 'Pending',
    },
    toManagerID: { type: mongoose.Schema.Types.ObjectId },
    toManager: { type: Object, ref: 'Users' },
    audit: auditSchema,
    tenantid: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenants', required: true },
}, { collection: 'AttendanceCorrections' });


module.exports = mongoose.model('AttendanceCorrections', attendanceCorrectionSchema);
