const LeaveRequest = require('../../../models/leave-requests');
const User = require('../../../models/user');
const mongoose = require('mongoose');
const generateAuditTrail = require('../../../utils/audit-trails');
const createLeaveRequest = (_, args, { me, tenantid }) => new Promise(async (resolve, reject) => {
  try {
    const entity = await LeaveRequest.findOne(
      {
        $and: [
          { userID: args.userID },
          { leaveTypeID: args.leaveTypeID },
          { tenantid },
          {
            $or: [
              { startDate: { $lte: new Date(args.startDate) }, endDate: { $gte: new Date(args.endDate) } },
              { startDate: { $gt: new Date(args.startDate) }, endDate: { $lt: new Date(args.endDate) } }
            ]
          }
        ]
      }
    );
    if (entity || entity?.length) {
      generateAuditTrail(null, null, me, tenantid, 'Leave Request', 'Find Leave Request', 'Create','Failed',args, 'Leave Request  already exist');
      reject(new Error('Leave Request already exist!'));
    } else {
      const newEntity = await new LeaveRequest({
        ...{
          ...args,
          tenantid,
          user: args.userID,
          leaveType: args.leaveTypeID,
          toManager: args.toManagerID,
          audit: {
            created_at: new Date(),
            created_by: me?.user?.username
          }
        }
      });
      if(!newEntity) {
        generateAuditTrail(null, null, me, tenantid, 'Leave Request', 'Find Leave Request', 'Create','Failed',args, 'Unable to create Leave Request');
        reject(new Error('Unable to create Leave Request!'));
      }
      generateAuditTrail(null, newEntity._doc, me, tenantid, 'Leave Request', 'Find Leave Request', 'Create','Success',args, 'Leave Request created');
      await newEntity.save();

      // User.findById(newEntity.userID)
      //   .exec( async function (err, user) {
      //     if (err) return reject(new Error('User Does Not Exists!'));
      //     user?.leaveRequests.push(newEntity._id);
      //     user?.leaveRequestsId.push(newEntity._id);
      //     await user.save();
      // });

      LeaveRequest.findById(newEntity._id)
        .populate('user', 'username email role eCode')
        .populate('toManager', 'username email role eCode')
        .populate('leaveType', 'name days _id' )
        .exec( async function (err, newEntity) {
          if (err) return reject(new Error('Unable to create Leave Request!'));
          resolve(newEntity);
      });
    }
  }
  catch (e) {
    reject(e);
  }
});

module.exports = createLeaveRequest;
