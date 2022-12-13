const tagRepository = require('../repository/tagRepository');
let Validator = require('validatorjs');
const { getFirstError } = require('../config/validator');

exports.listTag = async(req, res) => {
    const data = await tagRepository.listTag(req.body);
    return res.send(data);
}

exports.addTag = async(req, res) => {
    let rules = { title: 'required', status: 'required' };
    const validation = new Validator(req.body, rules);
    if (validation.fails()) {
        return res.send({ status: 400, message: getFirstError(validation.errors) });
    } else {
        const data = await tagRepository.addTag(req.body);
        return res.send(data);
    }
}

exports.editTag = async(req, res) => {
    let rules = { id: 'required', title: 'required' };
    const validation = new Validator(req.body, rules);
    if (validation.fails()) {
        return res.send({ status: 400, message: getFirstError(validation.errors) });
    } else {
        const data = await tagRepository.editTag(req.body);
        return res.send(data);
    }
}


exports.deleteTag = async(req, res) => {
    let rules = { id: 'required' };
    const validation = new Validator(req.body, rules);
    if (validation.fails()) {
        return res.send({ status: 400, message: getFirstError(validation.errors) });
    } else {
        const data = await tagRepository.deleteTag(req.body);
        return res.send(data);
    }
}



exports.details = async(req, res) => {
    let rules = { id: 'required' };
    const validation = new Validator(req.body, rules);
    if (validation.fails()) {
        return res.send({ status: 400, message: getFirstError(validation.errors) });
    } else {
        const data = await tagRepository.details(req.body);
        return res.send(data);
    }
}