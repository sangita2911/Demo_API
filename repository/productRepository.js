const db = require("../models");

const { keywordSearch } = require("../helpers/search");
const { ObjectId } = require("mongoose").Types;
const { uploadSingle, deleteFile } = require("../helpers/upload");

exports.listProduct = async (params) => {
  try {
    const finalParams = { ...keywordSearch(params, "name"), deleted_at: null };
    const productList = await db.product.aggregate([
      {
        $match: finalParams,
      },
      {
        $lookup: {
          from: "product_galleries",
          localField: "_id",
          foreignField: "product_id",
          as: "productGallery",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$deleted_at", null] }],
                },
              },
            },
            {
              $project: {
                image: {
                  $cond: {
                    if: "$image",
                    then: { $concat: [process.env.BASE_URL, "$image"] },
                    else: {
                      $concat: [
                        process.env.BASE_URL,
                        "uploads/default-100px.jpg",
                      ],
                    },
                  },
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "product_assign_categories",
          localField: "_id",
          foreignField: "product_id",
          as: "category_list",
          pipeline: [
            {
              $lookup: {
                from: "categories",
                localField: "product_category_id",
                foreignField: "_id",
                as: "all_category_details",
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$deleted_at", null] },
                          { $eq: ["$status", true] },
                        ],
                      },
                    },
                  },
                  {
                    $project: {
                      title: 1,
                      slug: 1,
                      icon: 1,
                      description: 1,
                      image: {
                        $cond: {
                          if: "$image",
                          then: { $concat: [process.env.BASE_URL, "$image"] },
                          else: {
                            $concat: [
                              process.env.BASE_URL,
                              "uploads/default-100px.jpg",
                            ],
                          },
                        },
                      },
                    },
                  },
                ],
              },
            },
            {
              $project: {
                ordering: 1,
                product_category_id: 1,
                all_category_details: {
                  $arrayElemAt: ["$all_category_details", 0],
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "product_tag_assigns",
          localField: "_id",
          foreignField: "product_id",
          as: "tag_list",
          pipeline: [
            {
              $lookup: {
                from: "tags",
                localField: "product_tag_id",
                foreignField: "_id",
                as: "all_tag_details",
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$status", true] }],
                      },
                    },
                  },
                  {
                    $project: {
                      title: 1,
                    },
                  },
                ],
              },
            },
            {
              $project: {
                ordering: 1,
                product_tag_id: 1,
                all_tag_details: {
                  $arrayElemAt: ["$all_tag_details", 0],
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          created_at: 1,
          updated_at: 1,
          image: {
            $cond: {
              if: "$image",
              then: {
                $concat: [process.env.BASE_URL, "$image"],
              },
              else: {
                $concat: [
                  process.env.FRONT_URL,
                  "uploads/product-images/no-img.png",
                ],
              },
            },
          },
          category_list: "$category_list.all_category_details",
          tag_list: "$tag_list.all_tag_details",
          productGallery: "$productGallery"
        },
      },
    ]);

    return {
      status: 200,

      message: "Product list successfully fetched.",

      data: productList,

      count: productList.length,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.addProduct = async (params) => {
  try {
    if (params.image) {
      const imageData = await uploadSingle(params, "image", {
        path: "product-images",
      });
      params.image = imageData.path;
    }

    const addProduct = new db.product({
      ...params,
    });

    const saveProduct = await addProduct.save();
    if (
      params.category_ids &&
      Array.isArray(params.category_ids) &&
      params.category_ids.length > 0
    ) {
      const productCategoryAssign = [];
      params.category_ids.forEach((cat_id, i) => {
        productCategoryAssign.push({
          product_id: ObjectId(saveProduct._id),
          product_category_id: ObjectId(cat_id),
          ordering: i + 1,
        });
      });

      await db.product_assign_category.insertMany(productCategoryAssign);
    }

    if (params.tags && Array.isArray(params.tags) && params.tags.length > 0) {
      const productTagAssign = [];
      params.tags.forEach((tag_id, i) => {
        productTagAssign.push({
          product_id: ObjectId(saveProduct._id),
          product_tag_id: ObjectId(tag_id),
          ordering: i + 1,
        });
      });

      await db.tagAssign.insertMany(productTagAssign);
    }
    return {
      status: 200,
      message: "Product successfully saved.",
      data: saveProduct,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.editProduct = async (params) => {
  try {
    const checkProduct = await db.product
      .findOne({
        _id: params.id,
      })
      .select("image");

    if (!checkProduct)
      return { status: 400, message: "This is not a valid product." };

    if (params.image) {
      const imageData = await uploadSingle(params, "image", {
        path: "product-images",
      });
      params.image = imageData.path;
      deleteFile(checkProduct.image);
    }

    const updatedproduct = await db.product
      .findByIdAndUpdate(
        params.id,
        {
          ...params,
        },
        { new: true }
      )
      .lean();

    if (
      params.category_ids &&
      Array.isArray(params.category_ids) &&
      params.category_ids.length > 0
    ) {
      const productCategoryAssign = [];
      params.category_ids.forEach((cat_id, i) => {
        productCategoryAssign.push({
          product_id: ObjectId(params.id),
          product_category_id: ObjectId(cat_id),
          ordering: i + 1,
        });
      });

      await db.product_assign_category.deleteMany({
        product_id: ObjectId(params.id),
      });
      await db.product_assign_category.insertMany(productCategoryAssign);
    }

    return {
      status: 200,
      message: "Product successfully updated.",
      data: updatedproduct,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.details = async (params) => {
  try {
    const finalParams = { _id: ObjectId(params.id) };
    const checkProduct = await db.product.aggregate([
      {
        $match: finalParams,
      },

      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          created_at: 1,
          updated_at: 1,
          image: {
            $cond: {
              if: "$image",
              then: {
                $concat: [process.env.BASE_URL, "$image"],
              },
              else: {
                $concat: [
                  process.env.FRONT_URL,
                  "uploads/product-images/no-img.png",
                ],
              },
            },
          },
        },
      },
    ]);
    if (!checkProduct)
      return { status: 400, message: "This is not a valid product." };

    return {
      status: 200,
      message: "Product details fetch successful.",
      data: checkProduct,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.deleteProduct = async (params) => {
  try {
    if (params.authUser && params.authUser.type != "admin") {
      const checkProduct = await db.product
        .findOne({
          _id: params.id,
          created_by: params.authUser._id,
        })
        .select("created_at");
      if (!checkProduct) {
        return {
          status: 400,
          message: "Product Not Match",
        };
      }
    }
    const checkProduct = await db.product.findOne({
      _id: params.id,
      deleted_at: null,
    });
    if (!checkProduct)
      return { status: 400, message: "This is not a valid product." };

    const deleteProduct = await db.product.findByIdAndUpdate(params.id, {
      deleted_at: new Date(),
      deleted_by: params.authUser ? params.authUser._id : null,
    });
    return {
      status: 200,
      message: "product successfully removed.",
      data: deleteProduct,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};
