const db = require("../models");
const {
  keywordSearch,
  sortBy,
  aggregateKeywordSearch,
} = require("../helpers/search");
const { uploadSingle, deleteFile } = require("../helpers/upload");
const { ObjectId } = require("mongoose").Types;

exports.list = async (params) => {
  try {
    let productParamsArray = await getProductSearchParams(params);

    let categorySearchParams = {};
    if (ObjectId.isValid(params.product_category_id)) {
      // categorySearchParams["category_list"] = {};
      categorySearchParams["category_list.product_category_id"] = ObjectId(
        params.product_category_id
      );
    }

    if (typeof params.new_arrival == "boolean" && params.new_arrival) {
      params.sortByField = "created_at";
      params.sortByValue = -1;
      params.limit = 10;
      params.offset = 0;
    }

    const sortByField = { ...sortBy(params) };

    const productList = await db.product.aggregate([
      {
        $match: {
          $expr: {
            $and: [...productParamsArray],
          },
        },
      },

      {
        $lookup: {
          from: "product_ingredients",
          localField: "allergie_id",
          foreignField: "_id",
          as: "allergie_list",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$deleted_at", null] }, { $eq: ["$type", 1] }],
                },
              },
            },
            {
              $project: {
                title: 1,
                icon: 1,
                created_at: 1,
                image: {
                  $cond: {
                    if: "$image",
                    then: { $concat: [process.env.BASE_URL, "$image"] },
                    else: {
                      $concat: [
                        process.env.BASE_URL,
                        "uploads/default-image.png",
                      ],
                    },
                  },
                },
                type: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "product_ingredients",
          localField: "spice_level_id",
          foreignField: "_id",
          as: "spice_level_list",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$deleted_at", null] }, { $eq: ["$type", 2] }],
                },
              },
            },
            {
              $project: {
                title: 1,
                icon: 1,
                created_at: 1,
                image: {
                  $cond: {
                    if: "$image",
                    then: { $concat: [process.env.BASE_URL, "$image"] },
                    else: {
                      $concat: [
                        process.env.BASE_URL,
                        "uploads/default-image.png",
                      ],
                    },
                  },
                },
                type: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "product_ingredients",
          localField: "diet_id",
          foreignField: "_id",
          as: "diet_list",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$deleted_at", null] }, { $eq: ["$type", 3] }],
                },
              },
            },
            {
              $project: {
                title: 1,
                icon: 1,
                created_at: 1,
                image: {
                  $cond: {
                    if: "$image",
                    then: { $concat: [process.env.BASE_URL, "$image"] },
                    else: {
                      $concat: [
                        process.env.BASE_URL,
                        "uploads/default-image.png",
                      ],
                    },
                  },
                },
                type: 1,
              },
            },
          ],
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "created_by",
          foreignField: "_id",
          as: "created_by_name",
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
                name: 1,
                email: 1,
                created_at: 1,
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
                from: "product_categories",
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
        $match: { ...categorySearchParams },
      },
      {
        $project: {
          title: 1,
          slug: 1,
          price_point: 1,
          product_type: 1,
          sale_price: 1,
          regular_price: 1,
          short_description: 1,
          long_description: 1,
          ordering: 1,
          status: 1,
          featured: 1,
          created_at: 1,
          updated_at: 1,
          created_by: 1,
          in_stock: 1,
          sold_out_for_today: 1,
          has_spice_level: {
            $and: [
              { $isArray: "$spice_level_id" },
              { $gt: [{ $size: "$spice_level_id" }, 0] },
            ],
          },
          has_addon: {
            $and: [
              { $isArray: "$addon_id" },
              { $gt: [{ $size: "$addon_id" }, 0] },
            ],
          },
          image: {
            $cond: {
              if: "$image",
              then: { $concat: [process.env.BASE_URL, "$image"] },
              else: {
                $concat: [process.env.BASE_URL, "uploads/default-image.png"],
              },
            },
          },
          allergie_list: "$allergie_list",
          spice_level_list: "$spice_level_list",
          diet_list: "$diet_list",
          category_list: "$category_list.all_category_details",
          created_by_name: { $arrayElemAt: ["$created_by_name", 0] },
          addon_id: 1,
          plu_code: 1,
        },
      },
      { $sort: { ...sortByField } },
      {
        $group: {
          _id: null,
          data: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          count: 1,
          data: { $slice: ["$data", params.offset || 0, params.limit || 10] },
        },
      },
    ]);

    return {
      status: 200,
      message: "product list successfully fetched.",
      count: productList.length > 0 ? productList[0].count : 0,
      data: productList.length > 0 ? productList[0].data : [],
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.categoryWiseProductList = async (params) => {
  try {
    let productParamsArray = await getProductSearchParams(params);

    let categoryParams = { deleted_at: null, status: true };
    if (ObjectId.isValid(params.product_category_id))
      categoryParams._id = ObjectId(params.product_category_id);

    const sortByField = { ...sortBy(params) };

    const productList = await db.product_category.aggregate([
      {
        $match: { ...categoryParams },
      },
      {
        $lookup: {
          from: "product_assign_categories",
          localField: "_id",
          foreignField: "product_category_id",
          as: "product_assign_category",
          pipeline: [
            {
              $lookup: {
                from: "products",
                localField: "product_id",
                foreignField: "_id",
                as: "product_list",
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [...productParamsArray],
                      },
                    },
                  },
                  {
                    $lookup: {
                      from: "product_ingredients",
                      localField: "allergie_id",
                      foreignField: "_id",
                      as: "allergie_list",
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                { $eq: ["$deleted_at", null] },
                                { $eq: ["$type", 1] },
                              ],
                            },
                          },
                        },
                        {
                          $project: {
                            title: 1,
                            icon: 1,
                            created_at: 1,
                            image: {
                              $cond: {
                                if: "$image",
                                then: {
                                  $concat: [process.env.BASE_URL, "$image"],
                                },
                                else: {
                                  $concat: [
                                    process.env.BASE_URL,
                                    "uploads/default-image.png",
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
                      title: 1,
                      slug: 1,
                      product_type: 1,
                      price_point: 1,
                      sale_price: 1,
                      regular_price: 1,
                      short_description: 1,
                      long_description: 1,
                      ordering: 1,
                      status: 1,
                      featured: 1,
                      created_at: 1,
                      updated_at: 1,
                      in_stock: 1,
                      is_point_enable: 1,
                      plu_code: 1,
                      is_point_enable: 1,
                      has_spice_level: {
                        $and: [
                          { $isArray: "$spice_level_id" },
                          { $gt: [{ $size: "$spice_level_id" }, 0] },
                        ],
                      },
                      has_addon: {
                        $and: [
                          { $isArray: "$addon_id" },
                          { $gt: [{ $size: "$addon_id" }, 0] },
                        ],
                      },
                      image: {
                        $cond: {
                          if: "$image",
                          then: { $concat: [process.env.BASE_URL, "$image"] },
                          else: {
                            $concat: [
                              process.env.BASE_URL,
                              "uploads/default-image.png",
                            ],
                          },
                        },
                      },
                      allergie_list: "$allergie_list",
                    },
                  },
                ],
              },
            },
            {
              $project: { _id: 0, product_list: "$product_list", ordering: 1 },
            },
            { $sort: { ordering: params.product_ordering || 1 } },
            { $addFields: { product_details: "$$ROOT" } },
            {
              $project: {
                product_details: {
                  $cond: {
                    if: { $eq: [{ $size: "$product_list" }, 0] },
                    then: {},
                    else: { $arrayElemAt: ["$product_list", 0] },
                  },
                },
              },
            },
            { $replaceRoot: { newRoot: "$product_details" } },
          ],
        },
      },
      {
        $project: {
          title: 1,
          icon: 1,
          created_at: 1,
          image: {
            $cond: {
              if: "$image",
              then: {
                $concat: [process.env.BASE_URL, "$image"],
              },
              else: {
                $concat: [process.env.BASE_URL, "uploads/category-default.png"],
              },
            },
          },
          product_list: "$product_assign_category",
        },
      },
      { $sort: { ...sortByField } },
      {
        $group: {
          _id: null,
          data: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          count: 1,
          data: { $slice: ["$data", params.offset || 0, params.limit || 10] },
        },
      },
    ]);

    let data = [];
    if (productList.length > 0) {
      data = productList[0].data.map((cat) => {
        cat.product_list = cat.product_list.filter((pro) => "_id" in pro);
        return cat;
      });
    }

    return {
      status: 200,
      message: "product list successfully fetched.",
      count: productList.length > 0 ? productList[0].count : 0,
      data: data,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.adminCategoryWiseProductList = async (params) => {
  try {
    let productParamsArray = await getProductSearchParams(params);

    let categoryParams = { deleted_at: null, status: true };
    if (ObjectId.isValid(params.product_category_id))
      categoryParams._id = ObjectId(params.product_category_id);

    const count = await db.product_category
      .find({ ...categoryParams })
      .select("created_at")
      .count();

    const sortByField = { ...sortBy(params) };

    const productList = await db.product_category.aggregate([
      {
        $match: { ...categoryParams },
      },
      {
        $lookup: {
          from: "product_assign_categories",
          localField: "_id",
          foreignField: "product_category_id",
          as: "product_assign_category",
          pipeline: [
            {
              $lookup: {
                from: "products",
                localField: "product_id",
                foreignField: "_id",
                as: "product_list",
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [...productParamsArray],
                      },
                    },
                  },
                  {
                    $lookup: {
                      from: "product_assign_categories",
                      localField: "_id",
                      foreignField: "product_id",
                      as: "assign_category",
                      pipeline: [
                        {
                          $lookup: {
                            from: "product_categories",
                            localField: "product_category_id",
                            foreignField: "_id",
                            as: "category_list",
                            pipeline: [
                              {
                                $match: {
                                  $expr: {
                                    $and: [
                                      { $eq: ["$status", true] },
                                      { $eq: ["$deleted_at", null] },
                                    ],
                                  },
                                },
                              },
                              { $project: { title: 1 } },
                            ],
                          },
                        },
                        {
                          $project: {
                            category_list: {
                              $arrayElemAt: ["$category_list", 0],
                            },
                          },
                        },
                      ],
                    },
                  },
                  {
                    $lookup: {
                      from: "product_ingredients",
                      localField: "allergie_id",
                      foreignField: "_id",
                      as: "allergie_list",
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                { $eq: ["$deleted_at", null] },
                                { $eq: ["$type", 1] },
                              ],
                            },
                          },
                        },
                        {
                          $project: {
                            title: 1,
                            icon: 1,
                            created_at: 1,
                            image: {
                              $cond: {
                                if: "$image",
                                then: {
                                  $concat: [process.env.BASE_URL, "$image"],
                                },
                                else: {
                                  $concat: [
                                    process.env.BASE_URL,
                                    "uploads/default-image.png",
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
                      title: 1,
                      slug: 1,
                      product_type: 1,
                      price_point: 1,
                      sale_price: 1,
                      regular_price: 1,
                      short_description: 1,
                      long_description: 1,
                      ordering: 1,
                      status: 1,
                      featured: 1,
                      created_at: 1,
                      updated_at: 1,
                      in_stock: 1,
                      is_point_enable: 1,
                      plu_code: 1,
                      is_point_enable: 1,
                      has_spice_level: {
                        $and: [
                          { $isArray: "$spice_level_id" },
                          { $gt: [{ $size: "$spice_level_id" }, 0] },
                        ],
                      },
                      has_addon: {
                        $and: [
                          { $isArray: "$addon_id" },
                          { $gt: [{ $size: "$addon_id" }, 0] },
                        ],
                      },
                      image: {
                        $cond: {
                          if: "$image",
                          then: { $concat: [process.env.BASE_URL, "$image"] },
                          else: {
                            $concat: [
                              process.env.BASE_URL,
                              "uploads/default-image.png",
                            ],
                          },
                        },
                      },
                      category_list: "$assign_category.category_list",
                      allergie_list: "$allergie_list",
                    },
                  },
                ],
              },
            },
            {
              $project: { _id: 0, product_list: "$product_list", ordering: 1 },
            },
            { $sort: { ordering: params.product_ordering || 1 } },
            { $addFields: { product_details: "$$ROOT" } },
            {
              $project: {
                product_details: {
                  $cond: {
                    if: { $eq: [{ $size: "$product_list" }, 0] },
                    then: {},
                    else: { $arrayElemAt: ["$product_list", 0] },
                  },
                },
              },
            },
            { $replaceRoot: { newRoot: "$product_details" } },
          ],
        },
      },
      {
        $project: {
          title: 1,
          icon: 1,
          created_at: 1,
          image: {
            $cond: {
              if: "$image",
              then: {
                $concat: [process.env.BASE_URL, "$image"],
              },
              else: {
                $concat: [process.env.BASE_URL, "uploads/category-default.png"],
              },
            },
          },
          product_list: "$product_assign_category",
        },
      },
      { $sort: { ...sortByField } },
      { $skip: params.offset || 0 },
      { $limit: params.limit || 10 },
    ]);

    const data = productList.map((cat) => {
      cat.product_list = cat.product_list.filter((pro) => "_id" in pro);
      return cat;
    });

    return {
      status: 200,
      message: "product list successfully fetched.",
      data: data,
      count: count,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.create = async (params) => {
  try {
    const checkValidData = await checkForValidData(params);
    if (checkValidData.status == 400) return checkValidData;

    params = await processDataForInsert(params);

    let image;
    if (params.image) {
      const imageData = await uploadSingle(params, "image", {
        path: "product-images",
      });
      image = imageData.path;
    }

    const product = await new db.product({
      ...params,
      image,
      created_by: params.authUser ? params.authUser._id : null,
    }).save();

    if (
      params.product_category_id &&
      Array.isArray(params.product_category_id) &&
      params.product_category_id.length > 0
    ) {
      const productCategoryAssign = [];
      params.product_category_id.forEach((cat_id, i) => {
        productCategoryAssign.push({
          product_id: ObjectId(product._id),
          product_category_id: ObjectId(cat_id),
          ordering: i + 1,
        });
      });

      await db.product_assign_category.insertMany(productCategoryAssign);
    }

    return {
      status: 200,
      message: "Product successfully added.",
      data: product,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.details = async (params) => {
  try {
    if (!ObjectId.isValid(params.id))
      return { status: 400, message: "Product not found" };

    let finalParams = {
      deleted_at: null,
      _id: ObjectId(params.id),
    };

    const addonGroupAddonListPipelineLookup = {
      $lookup: {
        from: "addon_groups",
        localField: "addon_group_id",
        foreignField: "_id",
        as: "addon_group",
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
            $lookup: {
              from: "products",
              localField: "_id",
              foreignField: "addon_group_id",
              as: "addon_product_list",
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$deleted_at", null] },
                        { $eq: ["$status", 1] },
                        { $eq: ["$product_type", 2] },
                      ],
                    },
                  },
                },
                {
                  $project: {
                    title: 1,
                    price_point: 1,
                    product_type: 1,
                    is_variable: 1,
                    sale_price: 1,
                    regular_price: 1,
                    short_description: 1,
                    long_description: 1,
                    ordering: 1,
                    status: 1,
                    featured: 1,
                    updated_at: 1,
                    created_at: 1,
                    in_stock: 1,
                    addon_group_id: 1,
                    addon_max_qty_buy: 1,
                    addon_min_qty_buy: 1,
                    plu_code: 1,
                    image: {
                      $cond: {
                        if: "$image",
                        then: {
                          $concat: [process.env.BASE_URL, "$image"],
                        },
                        else: {
                          $concat: [
                            process.env.BASE_URL,
                            "uploads/default-image.png",
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
              title: 1,
              description: 1,
              created_at: 1,
              addon_product_list: "$addon_product_list",
            },
          },
        ],
      },
    };

    const productDetails = await db.product.aggregate([
      {
        $match: {
          ...finalParams,
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
                from: "product_categories",
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
                      created_at: 1,
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
                from: "addon_group_assigns",
                localField: "product_category_id",
                foreignField: "product_category_id",
                as: "category_assign_addon_group",
                pipeline: [
                  { $match: { $expr: { $eq: ["$type", 2] } } },
                  { ...addonGroupAddonListPipelineLookup },
                  {
                    $project: {
                      addon_group: { $arrayElemAt: ["$addon_group", 0] },
                    },
                  },
                ],
              },
            },
            {
              $project: {
                ordering: 1,
                all_category_details: {
                  $arrayElemAt: ["$all_category_details", 0],
                },
                assign_addon_group: {
                  $arrayElemAt: ["$category_assign_addon_group", 0],
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "product_ingredients",
          localField: "allergie_id",
          foreignField: "_id",
          as: "allergie_list",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$deleted_at", null] }, { $eq: ["$type", 1] }],
                },
              },
            },
            {
              $project: {
                title: 1,
                icon: 1,
                created_at: 1,
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
          from: "product_ingredients",
          localField: "spice_level_id",
          foreignField: "_id",
          as: "spice_level_list",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$deleted_at", null] }, { $eq: ["$type", 2] }],
                },
              },
            },
            {
              $project: {
                title: 1,
                icon: 1,
                created_at: 1,
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
        $lookup: {
          from: "product_ingredients",
          localField: "diet_id",
          foreignField: "_id",
          as: "diet",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$deleted_at", null] }, { $eq: ["$type", 3] }],
                },
              },
            },
            {
              $project: {
                title: 1,
                icon: 1,
                created_at: 1,
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
          from: "addon_group_assigns",
          localField: "_id",
          foreignField: "product_id",
          as: "product_assign_addon_group",
          pipeline: [
            {
              $match: { $expr: { $eq: ["$type", 1] } },
            },
            {
              ...addonGroupAddonListPipelineLookup,
            },
            {
              $project: {
                addon_group: { $arrayElemAt: ["$addon_group", 0] },
              },
            },
          ],
        },
      },

      {
        $project: {
          title: 1,
          slug: 1,
          price_point: 1,
          product_type: 1,
          sale_price: 1,
          regular_price: 1,
          short_description: 1,
          long_description: 1,
          ordering: 1,
          status: 1,
          featured: 1,
          created_at: 1,
          updated_at: 1,
          in_stock: 1,
          plu_code: 1,
          is_point_enable: 1,
          plu_code: 1,
          image: {
            $cond: {
              if: "$image",
              then: { $concat: [process.env.BASE_URL, "$image"] },
              else: {
                $concat: [process.env.BASE_URL, "uploads/default-image.png"],
              },
            },
          },
          category_list: "$category_list.all_category_details",
          allergie_list: "$allergie_list",
          spice_level_list: "$spice_level_list",
          diet_details: { $arrayElemAt: ["$diet", 0] },
          addon_group_list: {
            $concatArrays: [
              "$product_assign_addon_group.addon_group",
              "$category_list.assign_addon_group.addon_group",
            ],
          },
        },
      },
    ]);

    if (productDetails.length == 0)
      return { status: 400, message: "Product not found" };

    const set = new Set();
    const addonGroupList = [];
    productDetails[0].addon_group_list.forEach((group) => {
      if (!set.has(group._id.toString())) addonGroupList.push(group);
      set.add(group._id.toString());
    });

    productDetails[0]["addon_group_list"] = addonGroupList;

    return {
      status: 200,
      message: "Product details successfully fetched",
      data: productDetails[0],
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.edit = async (params) => {
  try {
    const checkValidData = await checkForValidData(params);
    if (checkValidData.status == 400) return checkValidData;

    let image;
    const checkDetails = await db.product
      .findOne({
        _id: params.id,
        deleted_at: null,
      })
      .select("image");

    if (!checkDetails) return { status: 400, message: "Product not found" };

    params = await processDataForInsert(params);

    if (params.image) {
      const imageData = await uploadSingle(params, "image", {
        path: "product-images",
      });
      image = imageData.path;
      deleteFile(checkDetails.image);
    }
    const updatedproduct = await db.product
      .findByIdAndUpdate(
        params.id,
        {
          ...params,
          image,
          updated_by: params.authUser ? params.authUser._id : null,
          updated_at: new Date(),
        },
        { new: true }
      )
      .lean();

    if (
      params.product_category_id &&
      Array.isArray(params.product_category_id) &&
      params.product_category_id.length > 0
    ) {
      const productCategoryAssign = [];
      params.product_category_id.forEach((cat_id, i) => {
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

exports.remove = async (params) => {
  try {
    const checkproduct = await db.product.findOne({
      _id: params.id,
      deleted_at: null,
    });

    if (!checkproduct) return { status: 400, message: "Product not found" };

    await db.product_assign_category.deleteMany({
      product_id: ObjectId(params.id),
    });

    const deleteProduct = await db.product
      .findByIdAndUpdate(params.id, {
        deleted_at: new Date(),
        deleted_by: params.authUser ? params.authUser._id : null,
      })
      .lean();
    return {
      status: 200,
      message: "Product delete Successfully",
      data: deleteProduct,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.statusChange = async (params) => {
  try {
    const checkStatus = await db.product.findOne({
      _id: ObjectId(params.id),
      deleted_at: null,
    });

    if (!checkStatus) return { status: 400, message: "Product not found" };
    const status = await db.product
      .findByIdAndUpdate(
        params.id,
        {
          ...params,
          updated_at: new Date(),
          updated_by: params.authUser ? params.authUser._id : null,
        },
        { new: true }
      )
      .select({
        title: 1,
        slug: 1,
        is_variable: 1,
        sale_price: 1,
        regular_price: 1,
        short_description: 1,
        long_description: 1,
        image: {
          $cond: {
            if: "$image",
            then: { $concat: [process.env.BASE_URL, "$image"] },
            else: {
              $concat: [process.env.BASE_URL, "uploads/menu-4.png"],
            },
          },
        },
        ordering: 1,
        status: 1,
        featured: 1,
        updated_at: 1,
        created_at: 1,
      })
      .lean();
    return {
      status: 200,
      message: "Status change successful.",
      data: { ...status },
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.stockChange = async (params) => {
  try {
    const checkStatus = await db.product.findOne({
      _id: ObjectId(params.id),
      deleted_at: null,
    });

    if (!checkStatus) return { status: 400, message: "Product not found" };
    const status = await db.product
      .findByIdAndUpdate(
        params.id,
        {
          is_stock: params.in_stock,
          updated_at: new Date(),
          updated_by: params.authUser ? params.authUser._id : null,
        },
        { new: true }
      )
      .select({
        title: 1,
        slug: 1,
        is_variable: 1,
        sale_price: 1,
        regular_price: 1,
        short_description: 1,
        long_description: 1,
        image: {
          $cond: {
            if: "$image",
            then: { $concat: [process.env.BASE_URL, "$image"] },
            else: {
              $concat: [process.env.BASE_URL, "uploads/menu-4.png"],
            },
          },
        },
        ordering: 1,
        status: 1,
        featured: 1,
        updated_at: 1,
        created_at: 1,
      })
      .lean();
    return {
      status: 200,
      message: "Status change successful.",
      data: { ...status },
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

const checkForValidData = async (params) => {
  if (Array.isArray(params.product_category_id)) {
    let productCategoryIds = [];
    params.product_category_id.forEach((el) => {
      if (ObjectId.isValid(el)) productCategoryIds.push(ObjectId(el));
    });

    const productCategoryCount = await db.product_category
      .find({ _id: { $in: productCategoryIds }, deleted_at: null })
      .select("created_at")
      .count();

    if (params.product_category_id.length != productCategoryCount)
      return { status: 400, message: "Some Selected category is invalid" };
  }

  if (Array.isArray(params.allergie_id)) {
    let allergieIds = [];
    params.allergie_id.forEach((el) => {
      if (ObjectId.isValid(el)) allergieIds.push(ObjectId(el));
    });

    const allergieListCount = await db.product_ingredient
      .find({ _id: { $in: allergieIds }, type: 1, deleted_at: null })
      .select("created_at")
      .count();
    if (params.allergie_id.length != allergieListCount)
      return { status: 400, message: "Some Selected allergie is invalid" };
  }

  if (params.diet_id) {
    const checkDietData = await db.product_ingredient
      .findOne({
        _id: ObjectId.isValid(params.diet_id) ? ObjectId(params.diet_id) : null,
        deleted_at: null,
      })
      .select("created_at");
    if (!checkDietData) return { status: 400, message: "Diet is invalid" };
  }

  if (Array.isArray(params.spice_level_id)) {
    let spiceLevelIds = [];
    params.spice_level_id.forEach((el) => {
      if (ObjectId.isValid(el)) spiceLevelIds.push(ObjectId(el));
    });

    const spiceLevelCount = await db.product_ingredient
      .find({
        _id: { $in: spiceLevelIds },
        type: 2,
        deleted_at: null,
      })
      .select("created_at")
      .count();

    if (spiceLevelCount != params.spice_level_id.length)
      return { status: 400, message: "Some Spice level is invalid" };
  }

  return { status: 200 };
};

const processDataForInsert = async (params) => {
  if (Array.isArray(params.allergie_id) && params.allergie_id.length > 0) {
    let allergieList = [];
    params.allergie_id.forEach((el) => {
      if (ObjectId.isValid(el)) allergieList.push(ObjectId(el));
    });
    params.allergie_id = allergieList;
  }

  if (
    Array.isArray(params.product_category_id) &&
    params.product_category_id.length > 0
  ) {
    let categoryList = [];
    params.product_category_id.forEach((el) => {
      if (ObjectId.isValid(el)) categoryList.push(ObjectId(el));
    });
    params.product_category_id = categoryList;
  } else delete params.product_category_id;

  if (
    Array.isArray(params.spice_level_id) &&
    params.spice_level_id.length > 0
  ) {
    let spiceLevelId = [];
    params.spice_level_id.forEach((el) => {
      if (ObjectId.isValid(el)) spiceLevelId.push(ObjectId(el));
    });
    params.spice_level_id = spiceLevelId;
  } else delete params.spice_level_id;

  if (Array.isArray(params.addon_id) && params.addon_id.length > 0) {
    let addonIds = [];
    params.addon_id.forEach((el) => {
      if (ObjectId.isValid(el)) addonIds.push(ObjectId(el));
    });
    params.addon_id = addonIds;
  } else delete params.addon_id;

  if (ObjectId.isValid(params.diet_id))
    params.diet_id = [ObjectId(params.diet_id)];

  return params;
};

const getProductSearchParams = async (params) => {
  let productParamsArray = [
    { $eq: ["$deleted_at", null] },
    { $eq: ["$status", params.status || 1] },
    { $eq: ["$product_type", params.product_type || 1] },
  ];

  if (typeof params.price_point == "boolean")
    productParamsArray.push({ $gt: ["$price_point", 0] });

  if (typeof params.featured === "boolean")
    productParamsArray.push({
      $eq: ["$featured", params.featured || false],
    });

  if (typeof params.in_stock === "boolean")
    productParamsArray.push({
      $eq: ["$in_stock", params.in_stock],
    });

  if (typeof params.sold_out_for_today === "boolean")
    productParamsArray.push({
      $eq: ["$sold_out_for_today", params.sold_out_for_today],
    });

  if (
    Array.isArray(params.spice_level_id) &&
    params.spice_level_id.length > 0
  ) {
    let spiceLevelIds = [];
    params.spice_level_id.forEach((el) => {
      if (ObjectId.isValid(el))
        spiceLevelIds.push({
          $in: [
            ObjectId(el),
            {
              $cond: {
                if: "$spice_level_id",
                then: "$spice_level_id",
                else: [],
              },
            },
          ],
        });
    });

    productParamsArray.push({ $or: [...spiceLevelIds] });
  }

  if (Array.isArray(params.addon_id) && params.addon_id.length > 0) {
    
    let allAddonId = [];

    params.addon_id.forEach((el) => {
      if (ObjectId.isValid(el))
        allAddonId.push({
          $in: [
            ObjectId(el),
            {
              $cond: {
                if: "$addon_id",
                then: "$addon_id",
                else: [],
              },
            },
          ],
        });
    });
    productParamsArray.push({ $or: [...allAddonId] });
  }

  if (ObjectId.isValid(params.diet_id))
    productParamsArray.push({ $eq: ["$diet_id", ObjectId(params.diet_id)] });

  // if (Array.isArray(params.diet_id) && params.diet_id.length > 0) {
  //   let allDietId = [];
  //   params.diet_id.forEach((el) => {
  //     if (ObjectId.isValid(el)) allDietId.push(ObjectId(el));
  //   });
  //   productParamsArray.push({
  //     $in: ["$diet_id", allDietId],
  //   });
  // }
  if (Array.isArray(params.allergie_id) && params.allergie_id.length > 0) {
    let allergieList = [];
    params.allergie_id.forEach((el) => {
      if (ObjectId.isValid(el))
        allergieList.push({
          $in: [
            ObjectId(el),
            { $cond: { if: "$allergie_id", then: "$allergie_id", else: [] } },
          ],
        });
    });

    productParamsArray.push({
      $not: [{ $or: [...allergieList] }],
    });
  }

  if (params.keyword) {
    productParamsArray.push({
      $or: [
        { ...aggregateKeywordSearch(params, "title") },
        { ...aggregateKeywordSearch(params, "short_description") },
        {
          $regexFind: {
            input: { $toString: "$regular_price" },
            regex: params.keyword,
            options: "i",
          },
        },
        {
          $regexFind: {
            input: { $toString: "$sale_price" },
            regex: params.keyword,
            options: "i",
          },
        },
        {
          $regexFind: {
            input: { $toString: "$price_point" },
            regex: params.keyword,
            options: "i",
          },
        },
      ],
    });
  }

  // console.log(productParamsArray);

  return productParamsArray;
};