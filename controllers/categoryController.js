const categoryRepository = require('../repository/categoryRepository');
let Validator = require('validatorjs');
const { getFirstError } = require('../config/validator');

exports.listCategory = async(req, res) => {
    const data = await categoryRepository.listCategory(req.body);
    return res.send(data);
}

exports.addCategory = async(req, res) => {
    let rules = { category_type: 'required', name: 'required', status: 'required' };
    const validation = new Validator(req.body, rules);
    if (validation.fails()) {
        return res.send({ status: 400, message: getFirstError(validation.errors) });
    } else {
        const data = await categoryRepository.addCategory(req.body);
        return res.send(data);
    }
}

exports.editCategory = async(req, res) => {
    let rules = { id: 'required', name: 'required' };
    const validation = new Validator(req.body, rules);
    if (validation.fails()) {
        return res.send({ status: 400, message: getFirstError(validation.errors) });
    } else {
        const data = await categoryRepository.editCategory(req.body);
        return res.send(data);
    }
}


exports.deleteCategory = async(req, res) => {
    let rules = { id: 'required' };
    const validation = new Validator(req.body, rules);
    if (validation.fails()) {
        return res.send({ status: 400, message: getFirstError(validation.errors) });
    } else {
        const data = await categoryRepository.deleteCategory (req.body);
        return res.send(data);
    }
}



exports.details = async(req, res) => {
    let rules = { id: 'required' };
    const validation = new Validator(req.body, rules);
    if (validation.fails()) {
        return res.send({ status: 400, message: getFirstError(validation.errors) });
    } else {
        const data = await categoryRepository.details(req.body);
        return res.send(data);
    }
}