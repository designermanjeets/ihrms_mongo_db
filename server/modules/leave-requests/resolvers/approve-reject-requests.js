const LeaveRequest = require('../../../models/leave-requests');
const generateAuditTrail = require('../../../utils/audit-trails');
const approveRejectLeaveRequest = (_, args, { me, tenantid }) => new Promise(async (resolve, reject) => {
  try {
    const entity = await LeaveRequest.findOne(
      {
        $and: [
          { userID: args.userID },
          { _id: args._id },
          { tenantid }
          // {
          //   $or: [
          //     { startDate: { $lte: new Date(args.startDate) }, endDate: { $gte: new Date(args.endDate) } },
          //     { startDate: { $gt: new Date(args.startDate) }, endDate: { $lt: new Date(args.endDate) } }
          //   ]
          // }
        ]
      }
    );
    if (!entity) {
      generateAuditTrail(null, null, me, tenantid, 'Leave Request', 'Find Leave Request', 'approveReject','Failed',args, 'Leave Request  Does Not exist');
      reject(new Error('Leave Request Does Not Exist!'));
    } else {
      LeaveRequest.findByIdAndUpdate(entity._id, {
        $set: {
          ...args,
          tenantid,
          audit: {
            ...entity.audit,
            modified_at: new Date(),
            modified_by: me?.user?.username
          }
        }
      }, { new: true, useFindAndModify: false }, (err, newEntity) => {
        if(newEntity) {
          generateAuditTrail(null, newEntity._doc, me, tenantid, 'Leave Request', 'Find Leave Request', 'approveReject','Success',args, 'Leave Request  updated');
          LeaveRequest.findById(newEntity._id)
            .populate('user', ['eCode', 'username', 'title'])
            .populate('leaveType', ['name', 'days', 'carryForward', 'carryForwardDays', 'countWeekends'])
            .populate('toManager', ['eCode', 'username', 'title'])
            .exec(async function (err, newEntity) {
              generateAuditTrail(null, null, me, tenantid, 'Leave Request', 'Find Leave Request', 'approveReject','Failed',args, 'Unable to update Leave Request');
              if (err) return reject(new Error('Unable to update Leave Request!'));
              resolve(newEntity);
            });
        } else {
          reject(new Error('Unable to update Leave Request!'));
        }
      });
    }
  }
  catch (e) {
    reject(e);
  }
});

module.exports = approveRejectLeaveRequest;
