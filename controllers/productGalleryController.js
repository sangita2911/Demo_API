const productGalleryRepository = require('../repository/productGalleryRepository');
let Validator = require('validatorjs');
const { getFirstError } = require('../config/validator');

exports.addgallery = async(req, res) => {
    let rules = { product_id: 'required' };
    const validation = new Validator(req.body, rules);
    if (validation.fails()) {
        return res.send({ status: 400, message: getFirstError(validation.errors) });
    } else {
        const data = await productGalleryRepository.addgallery(req.body);
        return res.send(data);
    }
}
