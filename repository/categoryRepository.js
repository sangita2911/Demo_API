const db = require("../models");
const { keywordSearch } = require("../helpers/search");
const { ObjectId } = require("mongoose").Types;
const slugify = require("slugify");
var crypto = require("crypto");
const { uploadSingle, deleteFile } = require("../helpers/upload");

exports.listCategory = async (params) => {
  try {
    let finalParams = { ...keywordSearch(params, "title"), deleted_at: null };
    if (typeof params.status == "boolean") {
      finalParams.status = params.status;
    }

    const ListCount = await db.category
      .find({ ...finalParams })
      .select("created_at")
      .count();
    const List = await db.category
      .find({ ...finalParams })
      .skip(params.offset || 0)
      .limit(params.limit || 10)
      .select({
        title: 1,
        slug: 1,
        name: 1,
        category_type: 1,
        parent_id: 1,
        status: 1,
        image: {
          $cond: {
            if: "$image",
            then: { $concat: [process.env.BASE_URL, "$image"] },
            else: { $concat: [process.env.BASE_URL, "uploads/noimage.jpg"] },
          },
        },
      });
    return {
      status: 200,
      message: "Product category list successfully fetched.",
      data: List,
      count: ListCount,
    };
  } catch (err) {
    console.log(err);
    return { status: 400, message: err.message };
  }
};
exports.addCategory = async function (params) {
  try {
    if (params.image) {
      const imageData = await uploadSingle(params, "image", {
        path: "product-category",
      });
      params.image = imageData.path;
    }

    let slug = await createSlug(params.name);

    const category = new db.category({
      ...params,
      slug,
    });
    const newproduct_category = await category.save();
    const updatedproduct_category = await db.category.findOne({
      _id: newproduct_category._id,
      deleted_at: null,
    });
    return {
      status: 200,
      message: "Product category successfully added.",
      data: updatedproduct_category,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.details = async (params) => {
  try {
    const details = await db.category
      .findOne({
        deleted_at: null,
        _id: params.id,
      })
      .select({
        title: 1,
        slug: 1,
        category_type: 1,
        parent_id: 1,
        status: 1,
        image: {
          $cond: {
            if: "$image",
            then: { $concat: [process.env.BASE_URL, "$image"] },
            else: { $concat: [process.env.BASE_URL, "uploads/noimage.jpg"] },
          },
        },
      });
    return {
      status: 200,
      message: "Product category Details successfully fetched.",
      data: details,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.editCategory = async function (params) {
  try {
    const checkData = await db.category.findOne({
      _id: ObjectId(params.id),
      deleted_at: null,
    });
    if (!checkData) return { status: 400, message: "Category not found" };

    if (params.image) {
      const imageData = await uploadSingle(params, "image", {
        path: "category",

      });
      params.image = imageData.path;
      deleteFile(checkData.image);
    }
    let slug = await createSlug(params.name);

    const updatedproduct_category = await db.category
      .findByIdAndUpdate(
        params.id,
        {
          ...params,
          slug,
        },
        { new: true }
      )
      .lean();
    return {
      status: 200,
      message: "Product category successfully updated.",
      data: updatedproduct_category,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.deleteCategory = async (params) => {
  try {
    const checkproduct_category = await db.category.findOne({
      _id: ObjectId(params.id),
      deleted_at: null,
    });

    if (!checkproduct_category) {
      return {
        status: 400,
        message: "Invalid cannot be deleted.",
      };
    }
    const deleteData = await db.category
      .findByIdAndUpdate(params.id, {
        deleted_at: new Date(),
      })
      .lean();
    return { status: 200, message: "Successfully remove.", data: deleteData };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};





const createSlug = async (title) => {
  let slug = slugify(title.toLowerCase(), {
    replacement: "-",
    remove: /[*+~.()'"!:@]/g,
  });

  let checkData = await db.category
    .findOne({
      slug: slug,
      deleted_at: null,
    })
    .select("created_at");

  if (checkData) {
    slug += crypto.randomBytes(5).toString("hex");
    slug = await createSlug(slug);
  }

  return slug;
};