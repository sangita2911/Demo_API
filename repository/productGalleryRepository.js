const db = require("../models");

const { keywordSearch } = require("../helpers/search");
const { ObjectId } = require("mongoose").Types;
const { uploadSingle, deleteFile } = require("../helpers/upload");

exports.addgallery = async (params) => {
  try {
    if (params.images) {
      const imageData = await uploadSingle(params, "image", {
        path: "product-gallery",
      });
      params.image = imageData.path;
    }

    if (
      params.images &&
      Array.isArray(params.images) &&
      params.images.length > 0
    ) {
      const productGalleries = [];
      params.images.forEach(async (item, i) => {
        const imageData = await uploadSingle(item, "image", {
          path: "product-gallery",
        });
        productGalleries.push({
          product_id: ObjectId(params.product_id),
          image: imageData.path,
          ordering: i + 1,
        });
      });

      await db.productgalleries.deleteMany({
        product_id: ObjectId(params.id),
      });
      await db.productgalleries.insertMany(productGalleries);
    }

    const saveGallery = await addGallery.save();

    return {
      status: 200,
      message: "Product Gallery successfully saved.",
      data: saveGallery,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};
