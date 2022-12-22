const authRepository = require("../repository/authRepository");
let Validator = require("validatorjs");

const { getFirstError } = require("../config/validator");

exports.signup = async (req, res) => {
  let rules = {
    name: "required",
    
    email: "required|email",
   
    password: "required|min:8",
  
  };
  let validation = new Validator(req.body, rules);
  if (validation.fails()) {
    return res.send({ status: 400, message: validation.errors.errors });
  } else {
    const data = await authRepository.signup(req.body);
    return res.send(data);
  }
};

exports.login = async (req, res) => {
  let rules = {
    email: "required|email",
    password: "required|min:7",
    
  };
  const validation = new Validator(req.body, rules);
  if (validation.fails()) {
    return res.send({ status: 400, message: getFirstError(validation.errors) });
  } else {
// console.log(req.body);
    const data = await authRepository.login(req.body);
   return res.send(data);
  }
};