const { UserInputError } = require('apollo-server-express')
const User = require('../../../models/user')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const SALT_ROUNDS = 12;

const insertManyUsers = (_, { input }, { me, tenantid }) => new Promise(async (resolve, reject) => {
  try {
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
    await Promise.all(input.map(async delay => {
      await wait(delay)
      delay.password = await bcrypt.hash(delay.password?.toString() || '11', 10);
      delay.tenantid = tenantid;
    }))

    User.insertMany(input)
      .then((res) => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });

  } catch (e) {
    reject(e)
  }


})


module.exports = insertManyUsers