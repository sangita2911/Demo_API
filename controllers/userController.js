const userRepository = require('../repository/userRepository');

let Validator = require('validatorjs');

const { getFirstError } = require('../config/validator');



exports.list = async (req, res) => {

    const data = await userRepository.list(req.body);

    return res.send(data);

}

exports.add = async (req, res) => {
    let rules = { name: 'required', email: 'required' };
    const validation = new Validator(req.body, rules);
    if (validation.fails()) {
        return res.send({ status: 400, message: getFirstError(validation.errors) });
    } else {
        const data = await userRepository.add(req.body);
        return res.send(data);
    }
}

exports.edit = async (req, res) => {
    let rules = { name: 'required', email: 'required' };
    const validation = new Validator(req.body, rules);
    if (validation.fails()) {
        return res.send({ status: 400, message: getFirstError(validation.errors) });
    } else {
        const data = await userRepository.edit(req.body);
        return res.send(data);
    }
}

exports.details = async (req, res) => {
    let rules = { id: 'required' };
    const validation = new Validator(req.body, rules);
    if (validation.fails()) {
        return res.send({ status: 400, message: getFirstError(validation.errors) });
    } else {
        const data = await userRepository.details(req.body);
        return res.send(data);
    }
}

exports.delete = async (req, res) => {
    let rules = { id: 'required' };
    const validation = new Validator(req.body, rules);
    if (validation.fails()) {
        return res.send({ status: 400, message: getFirstError(validation.errors) });
    } else {
        const data = await userRepository.delete(req.body);
        return res.send(data);
    }
}


