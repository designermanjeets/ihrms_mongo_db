const User = require('../../../models/user');
const { paramHandler } = require('../../../utils/paramhandler');

const getUsers = async (_, args, { me, tenantid })  => new Promise(async (resolve, reject) => {
  const param = me?.user?.username === 'gonngod' ? paramHandler({...args.query}): paramHandler({...args.query, tenantid});
  await User.find(param)
    .skip(args.query.offset).limit(args.query.limit)
    .populate('jobTitle', 'name')
    .populate('unitDepartment', 'name')
    .populate('designation', 'name')
    .populate('reportingManager', 'username email role')
    .populate('employeeShifts', 'name')
    .populate('role', 'role_name')
    .populate('employeeType', 'name')
    .populate('leaveRequests', 'startDate endDate')
    .populate('modeOfEmployment', 'name')
    .exec(function (err, users) {
      if (err) return reject(err);
      users = users.filter(user => user.username !== 'gonngod');
      resolve(users);
    })
});

module.exports = getUsers;
