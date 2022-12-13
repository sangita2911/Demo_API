const slugify = require("slugify");
const db = require("../models");
const crypto = require("crypto");

exports.search = (params) => {
  let finalParams = { deleted_at: null };

  if (params.keyword) {
    finalParams.name = { $regex: params.keyword, $options: "i" };
  }

  if (params.date && params.date.e) {
    finalParams.created_at = {
      $gte: new Date(params.date.e[0]),
      $lte: new Date(params.date.e[1] ? params.date.e[1] : params.date.e[0]),
    };
  }

  return finalParams;
};

exports.sortBy = (params) => {
  let sort = { created_at: -1 };
  let fields = params.sortByField;
  if (params.sortByField) {
    if (params.sortByField == "name") {
      sort = { name: params.sortByValue };
    } else if (params.sortByField == "created_at") {
      sort = { created_at: params.sortByValue };
    } else {
      sort = { [fields]: params.sortByValue };
    }
  }
  return sort;
};

exports.createSlug = async ({ tableName, title, field = "slug" }) => {
  let slug = slugify(title.toLowerCase(), {
    replacement: "-",
    remove: /[*+~.()'"!:@]/g,
  });

  let finalParams = {
    [field]: slug,
    deleted_at: null,
  };

  let checkData = await db[tableName]
    .findOne({ ...finalParams })
    .select("created_at");

  if (checkData) {
    slug += crypto.randomBytes(5).toString("hex");
    slug = await this.createSlug({ tableName, title: slug, field });
  }

  return slug;
};