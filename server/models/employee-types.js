const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const auditSchema = mongoose.Schema({
  created_at: Date,
  created_by: String,
  modified_at: Date,
  modified_by: String,
});

const employeeTypesSchema = new Schema({
  name: { type: String, required: true, immutable: true },
  status: { type: Boolean, default: true },
  comments: String,
  tenantid: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenants', required: true },
  audit: auditSchema,
}, { collection: 'EmployeeTypes' }, {timestamps: true});


module.exports = mongoose.model('EmployeeTypes', employeeTypesSchema);
