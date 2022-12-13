exports.getFirstError = obj => obj['errors'][Object.keys(obj['errors'])[0]][0];
let Validator = require("validatorjs");
exports.Validator = async function (body, rules, customErrorMessages = {}) {
  let validation = new Validator(body, rules, customErrorMessages);
  if (validation.fails()) {
    var obj = validation.errors.all();
    for (var key in obj) {
      return { status: 400, message: obj[key][0] };
    }
  } else {
    return { status: 200, message: null };
  }
};
