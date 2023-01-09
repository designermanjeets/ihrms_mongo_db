const getAttendances = require('./attendances')
const getAttendancesByDayWise = require('./getattendancebydaywise')
const getAttendancesByDayWiseAllUsers = require('./getattendancebydaywiseallusers')
const getAttendanceRequestsByDayWise = require('./getattendancerequestbydaywise')
const getAttendancesByDayWiseAvg = require('./getattendancebydaywiseavg')
const getAttendancesByDayWiseAllUsersAvg = require('./getattendancebydaywiseallusersavg')
const getAttendanceRequestsByDayWiseOverview = require('./getattendancerequestbydaywiseoverview')
const createAttendance = require('./createattendances')
const editAttendance= require('./editattendances')
const uploadFileAttendance = require('./fileuploadattendance')
const insertManyAttendances = require('./insertmanyattendance')

const resolvers = {
  Query: {
    getAttendances,
    getAttendancesByDayWise,
    getAttendanceRequestsByDayWise,
    getAttendancesByDayWiseAllUsers,
    getAttendancesByDayWiseAvg,
    getAttendancesByDayWiseAllUsersAvg,
    getAttendanceRequestsByDayWiseOverview,
  },
  Mutation: {
    createAttendance,
    editAttendance,
    uploadFileAttendance,
    insertManyAttendances
  }
}

module.exports = resolvers
