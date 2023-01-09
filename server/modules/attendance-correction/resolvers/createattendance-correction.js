const AttendanceCorrection = require('../../../models/attendance-corrections');

const createAttendanceCorrection = (_, args, { me, tenantid }) => new Promise(async (resolve, reject) => {
  try {
    const newEntity = await new AttendanceCorrection({
      ...{
        ...args,
        user: args.userId,
        toManager: args.toManagerID,
        tenantid,
        audit: {
          created_at: new Date(),
          created_by: me?.user?.username
        }
      }
    });
    if(!newEntity) {
      reject(new Error('Unable to create Attendance Correction!'));
    }
    
    await newEntity.save();
    AttendanceCorrection.findById(newEntity._id)
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
        if (err) return reject(new Error('Unable to create Attendance Correction!'));
        resolve(newEntity);
    });
    
  }
  catch (e) {
    reject(e);
  }
});

module.exports = createAttendanceCorrection;

getFormattedDate = function (date) {
  const _date = new Date(date);
  const year = _date.getFullYear();
  const month = _date.getMonth() + 1;
  const day = _date.getDate();
  const time = _date.toTimeString();
  const dateString = (day <= 9 ? '0' + day : day) + '/' + (month <= 9 ? '0' + month : month) + '/' + year;
  return dateString;
}
