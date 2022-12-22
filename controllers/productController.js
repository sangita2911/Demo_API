const productRepository = require('../repository/productRepository');
let Validator = require('validatorjs');
const { getFirstError } = require('../config/validator');

exports.listProduct = async(req, res) => {
    const data = await productRepository.listProduct(req.body);
    return res.send(data);
}

exports.addProduct = async(req, res) => {
    let rules = { name: 'required', price: 'required'};
    const validation = new Validator(req.body, rules);
    if (validation.fails()) {
        return res.send({ status: 400, message: getFirstError(validation.errors) });
    } else {
        const data = await productRepository.addProduct(req.body);
        return res.send(data);
    }
}

exports.editProduct = async(req, res) => {
    let rules = { id: 'required', name: 'required' };
    const validation = new Validator(req.body, rules);
    if (validation.fails()) {
        return res.send({ status: 400, message: getFirstError(validation.errors) });
    } else {
        const data = await productRepository.editProduct(req.body);
        return res.send(data);
    }
}


exports.deleteProduct = async(req, res) => {
    let rules = { id: 'required' };
    const validation = new Validator(req.body, rules);
    if (validation.fails()) {
        return res.send({ status: 400, message: getFirstError(validation.errors) });
    } else {
        const data = await productRepository.deleteProduct(req.body);
        return res.send(data);
    }
}



exports.details = async(req, res) => {
    let rules = { id: 'required' };
    const validation = new Validator(req.body, rules);
    if (validation.fails()) {
        return res.send({ status: 400, message: getFirstError(validation.errors) });
    } else {
        const data = await productRepository.details(req.body);
        return res.send(data);
    }
}