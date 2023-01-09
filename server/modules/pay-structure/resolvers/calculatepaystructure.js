const { paramHandler } = require('../../../utils/paramhandler');
const PayStructure = require('../../../models/paystructure');
const { request } = require('../../../utils/context');
const formula = require('excel-formula');

function calculateValMap(name, valMap, depth = 0) {
  console.log('cvm', name, depth);
  // Check if the value is available then return the value
  if (valMap[name] && valMap[name].value !== '') {
    console.log('cvm', name, 'value found returned');
    return valMap[name].value;
  } else if (depth >= Object.keys(valMap).length) {
    console.log('cvm', name, 'depth exceeded returned');
    return '';
  }
  // Else let's see if all the dependents are computed
  const valObj = valMap[name];
  let hasVal = true;
  if (valObj.formula !== null) {
    // Perform computation
    let jsEq = formula.toJavaScript(valObj.formula);
    valObj.dependents.forEach((dep) => {
      console.log('cvm::deps', dep);
      let repVal = '';
      if (valMap[dep] && valMap[dep].value !== '') {
        console.log('cvm::deps', dep, 'value found');
        repVal = valMap[dep].value;
      } else {
        console.log('cvm::deps', dep, 'value not found looping now');
        repVal = calculateValMap(dep, valMap, ++depth);
      }
      if (repVal !== '') {
        jsEq = jsEq.replaceAll(dep, repVal);
      } else {
        hasVal = false;
      }
    });
    if (hasVal) {
      try {
        console.log('cvm::updated eq', jsEq);
        const res = eval(jsEq);
        valMap[name].value = res.toString();
        return res;
      } catch (err) {
        console.log('cvm', name, 'eval error returned', err);
        return '';
      }
    }
  }
  console.log('cvm', name, 'formula not found returned');
  return valObj.value || '';
}

const calculatePayStructure = async (_, args, { mez, tenantidz }) =>
  new Promise(async (resolve, reject) => {
    console.log(args)
    let me = mez;
    let tenantid = tenantidz;
    const param =
      me?.user?.username === 'gonngod'
        ? paramHandler({ ...args.query })
        : paramHandler({ ...args.query, tenantid });
    try {
      console.log('calculatePayStructure', args, param);
      const ps = await PayStructure.findOne({
        $or: [ { _id: args.input.salaryStructure }, { salaryStructure: args.input.salaryStructure } ]
      })
        .populate('payHeads')
        .populate({
          path: 'payHeads',
          populate: [{ path: 'computedFormula' }],
        });
      const valMap = {};
      if(!ps) 
        return reject(new Error('PayStructure Not Found!'))
      ps.payHeads.forEach((ph) => {
        let fr = ph.computedFormula?.formula;
        console.log('PayHead', ph.name);
        console.log('Formula', fr);
        if (fr) {
          let tokens = formula.getTokens(fr);
          console.log('---');
          console.log('getTokens', tokens);
          console.log('---');
          let ops = tokens.filter(
            (t) => t.type === 'operand' && t.subtype === 'range'
          );
          console.log('operands', ops);
          const ob = {
            value: '',
            name: ph.name,
            formula: fr,
            dependents: ops.map((op) => op.value),
          };
          valMap[ph.name] = ob;
          console.log('---');
        } else {
          // check if the value is provided in the input args
          let inpVal = args.input.payHeads.filter((h) => h.name === ph.name);
          if (inpVal.length > 0) {
            valMap[ph.name] = {
              value: inpVal[0].value,
              name: ph.name,
              formula: null,
              dependents: [],
            };
          }
        }
        console.log('======');
      });

      Object.keys(valMap).forEach((key) => {
        const k = calculateValMap(key, valMap, 0);
      });
      console.log('valueMap::After', valMap);

      resolve({
        _id: ps._id,
        username: args.input?.username,
        salaryStructure: ps.salaryStructure,
        calculatedPayHeads: ps.payHeads.map((p) => {
          return {
            _id: p._id,
            name: p.name,
            calculatedValue: valMap[p.name]?.value || '',
          };
        }),
      });
    } catch (e) {
      reject(e);
    }
  });

module.exports = calculatePayStructure;
