const db = require("../models");

const { keywordSearch } = require("../helpers/search");
const { ObjectId } = require("mongoose").Types;
const { uploadSingle } = require("../helpers/upload");

exports.listProduct = async (params) => {
    try {
        const finalParams = { ...keywordSearch(params, "name"), deleted_at: null };
        const productList = await db.product.aggregate([
            {
                $match: finalParams,
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ["$deleted_at", null] }] } } },
                        {
                            $project: {
                                name: 1,
                                category_type: 1,

                                image: {
                                    $cond: {
                                        if: "$image",
                                        then: {
                                            $concat: [
                                                process.env.BASE_URL,
                                                "$image",
                                            ],
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
                                $and: [
                                
                                  { $eq: ["$status", true] },
                                ],
                              },
                            },
                          },
                          {
                            $project: {
                              title: 1
                             
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
                    tags: 1,
                    created_at: 1,
                    updated_at:1,
                    image: {
                        $cond: {
                            if: "$image",
                            then: {
                                $concat: [
                                    process.env.BASE_URL,
                                    "$image",
                                ],
                            },
                            else: {
                                $concat: [
                                    process.env.FRONT_URL,
                                    "uploads/product-images/no-img.png",
                                ],
                            },
                        },
                    },
                     category: "$category",
                    tag_list: "$tag_list.all_tag_details"
                },
            }
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
            const imageData = await uploadSingle(
                params,
                "image",
                {
                    path: "product-images",
                },

            );
            params.image = imageData.path;
        }

        const addProduct = new db.product({
            ...params,

        });



        const saveProduct = await addProduct.save();
        if (params.sku) {
           
            const stk = await new db.stock({
                product_id: saveProduct._id,
                unit: params.sku,
                remaining_unit: params.sku
            }).save();
            
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
                _id: params.id
            }).select("image");

        if (!checkProduct)
            return { status: 400, message: "This is not a valid product." };





        const updatedproduct = await db.product
            .findByIdAndUpdate(
                params.id,
                {
                    ...params
                },
                { new: true }
            )
            .lean();

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
                    updated_at:1,
                    image: {
                        $cond: {
                            if: "$image",
                            then: {
                                $concat: [
                                    process.env.BASE_URL,
                                    "$image",
                                ],
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
