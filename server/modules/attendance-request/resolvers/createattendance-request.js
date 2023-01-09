const AttendanceRequest = require('../../../models/attendance-request');

const createAttendanceRequest = (_, args, { me, tenantid }) => new Promise(async (resolve, reject) => {
  try {
    const newEntity = await new AttendanceRequest({
      ...{
        ...args,
        user: args.userId,
        toManager: args.toManagerID,
        date: new Date(Date.now()),
        tenantid,
        audit: {
          created_at: new Date(),
          created_by: me?.user?.username
        }
      }
    });
    if(!newEntity) {
      reject(new Error('Unable to create AttendanceRequest!'));
    }
    
    await newEntity.save();
    AttendanceRequest.findById(newEntity._id)
      .populate(
        { 
          path: 'user', 
          select: ['email', 'username', 'eCode', 'role'], 
          populate: { path: 'role', select: 'role_name' }, 
          populate: { path: 'employeeShifts', select: 'name' }
        }
      )
      .populate('toManager', ['eCode', 'username', 'title'])
      .exec( async function (err, newEntity) {
        if (err) return reject(new Error('Unable to create AttendanceRequest!'));
        resolve(newEntity);
    });
    
  }
  catch (e) {
    reject(e);
  }
});

module.exports = createAttendanceRequest;

getFormattedDate = function (date) {
  const _date = new Date(date);
  const year = _date.getFullYear();
  const month = _date.getMonth() + 1;
  const day = _date.getDate();
  const time = _date.toTimeString();
  const dateString = (day <= 9 ? '0' + day : day) + '/' + (month <= 9 ? '0' + month : month) + '/' + year;
  return dateString;
}
