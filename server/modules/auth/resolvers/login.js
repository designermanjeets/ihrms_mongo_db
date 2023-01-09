const { AuthenticationError } = require('apollo-server-express');
const tokenUtil = require('../../../utils/token');
const User = require('../../../models/user');
const Role = require('../../../models/role');
const Designation = require('../../../models/designations');
const Tenant = require('../../../models/tenants');
const bcrypt = require('bcrypt');
const config = require('../../../config');
const mongoose = require('mongoose');

const login = async (_, args, { me, tenantid }) => {
  const user = await User.findOne({$or:[ { email: args.email},{username: args.email} ]})

  if (!user) {
    throw new AuthenticationError('User not found')
  }

  const isPasswordValid = await bcrypt.compare(args.password, user.password)

  if (!isPasswordValid) {
    throw new AuthenticationError('Incorrect password')
  }

  const token = tokenUtil.create(user);
  const refresh_token = tokenUtil.create(user);
  const role = await Role.findById(mongoose.Types.ObjectId(user.role));
  const designation = await Designation.findById(mongoose.Types.ObjectId(user.designationId));
  const tenants = await Tenant.find({ '_id': { $in: user.tenantAccess } });

  return {
    user: {
      ...user._doc,
      id: user._id,
      eCode: user.eCode,
    },
    designation,
    role,
    tenants,
    token,
    refresh_token,
    tokenExpiration: config.JWT_LIFE_TIME
  }
}

module.exports = login
