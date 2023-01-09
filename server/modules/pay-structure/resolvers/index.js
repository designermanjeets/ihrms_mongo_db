const getPayStructures = require('./paystructures')
const createPayStructure = require('./createpaystructure')
const editPayStructure = require('./editpaystructures')
const salaryCalculateRequest= require('./salarycalculate')
const calculatePayStructure = require('./calculatepaystructure');

const resolvers = {
  Query: {
    getPayStructures,
  },
  Mutation: {
    createPayStructure,
    editPayStructure,
    salaryCalculateRequest,
    calculatePayStructure
  }
};

module.exports = resolvers;
