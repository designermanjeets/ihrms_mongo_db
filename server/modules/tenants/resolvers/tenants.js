const { paramHandler } = require('../../../utils/paramhandler');
const Tenants = require('../../../models/tenants');
const { request } = require('../../../utils/context')

const getTenants = async (_, args, { me, tenantid })  => new Promise(async (resolve, reject) => {
  const param = paramHandler({...args.query}) // tenantid
  try {
    await Tenants.find(param)
      .skip(args.query.offset).limit(args.query.limit)
      .exec(async function (err, data) {
        if (err) return reject();
        if(me?.user?.username !== 'gonngod') {
          data = data.filter(res => res.name !== 'GONN');
        }
        resolve(data);
      })
  }
  catch (e) {
    reject(e);
  }
});

module.exports = getTenants;
