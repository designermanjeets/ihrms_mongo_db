const PayStructure = require('../../../models/paystructure');
const PayHeads = require('../../../models/payheads');
const PayFormula = require('../../../models/payformula');
const async = require('async');
const { paramHandler } = require('../../../utils/paramhandler');
const excel_formula = require('excel-formula')

const salaryCalculateRequest = (_, args, { me, tenantid }) => new Promise(async (resolve, reject) => {

  try {

    let payheads_all = await PayHeads.find({});
    // console.log(payheads_all);
    const payheads_obj = {};
    payheads_all.forEach((payhead, idx) => payheads_obj[payhead.name] = payhead.name);
    console.log(payheads_obj)
   
    const paystructure = await PayStructure.findOne({ $or: [{ salaryStructure: args.paystructurename }] });
    const payheads = await PayHeads.find({ '_id': { $in: paystructure.payHeadIDs } });
    const IDsArr = [];
    payheads.forEach(x => x.computedFormula && IDsArr.push(x.computedFormula));
    let payformula = await PayFormula.find({ '_id': { $in: IDsArr } });
    const neweArr = [];
    payformula.map((u) => {
      formattedFormula = excel_formula.toJavaScript(u.formula);
      // console.log(formattedFormula)
      neweArr.push({ ...u._doc, ...{ 'excel_for': formattedFormula }})
    });

    // console.log(neweArr);

    neweArr.forEach((u) => {
       //  console.log(u.excel_for);
        // Object.keys(payheads_obj).forEach(key => {
        //   if(u.excel_for.i)
        // })

        u.excel_for = u.excel_for.replace(/[()]/g, '');
        u.excel_for = u.excel_for.replace('GrossSalary', '50000');
        console.log(eval(u.excel_for))
      // u.calculate = u.excel_for.replace('GrossSalary', '50000');
       //console.log(u.excel_for.replace('GrossSalary', '20000'));    
     });

    console.log(neweArr);

  }
  catch (e) {
    reject(e);
  }

 
});


module.exports = salaryCalculateRequest;
