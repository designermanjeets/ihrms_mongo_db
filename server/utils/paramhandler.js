const mongoose = require('mongoose'); // ES5 or below

const paramHandler= (qry)  => {
  let param = {};
  if(qry.argument && qry.query) param= {[qry.argument]: {'$regex':qry.query}}
  if(qry.dates){
    if(qry.dates.gte) {
      let gte = new Date(qry.dates.gte);
      param = {
        ...param, 
        'startDate': { $gte: gte }, // For Leave Requets
        'date': { $gte: gte.setDate(gte.getDate() - 1 ) } // For Attendance etc
      }
    }
    if(qry.dates.lt) {
      let lt = new Date(qry.dates.lt);
      param = {
        ...param, 
        'endDate': { $lt: lt }, // For Leave Requets
        'date': { $lt: lt.setDate(lt.getDate() - 1 ) } // For Attendance etc
      }
    }
  }
  if(qry.id) { param._id = qry.id }
  if(qry.departmentId) { param.departmentId = qry.departmentId; param.unitDepartmentId = qry.departmentId }
  if(qry.tenantid) { param.tenantid = qry.tenantid }
  if(qry.userID) { param.userId = qry.userID }
  return param
};

module.exports = { paramHandler };
