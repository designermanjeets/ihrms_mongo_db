const getLeaveRequests = require('./leave-requests')
const createLeaveRequest = require('./createleave-requests')
const editLeaveRequest = require('./editleave-requests')
const approveRejectLeaveRequest = require('./approve-reject-requests')

const resolvers = {
  Query: {
    getLeaveRequests
  },
  Mutation: {
    createLeaveRequest,
    editLeaveRequest,
    approveRejectLeaveRequest
  }
}

module.exports = resolvers
