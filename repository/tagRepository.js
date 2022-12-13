const db = require("../models");

const { keywordSearch } = require("../helpers/search");
const { ObjectId } = require("mongoose").Types;

exports.listTag = async (params) => {
  try {
    const finalParams = { ...keywordSearch(params, "name"),deleted_at: null };
    const tagList = await db.tag.aggregate([
      {
        $match: finalParams,
      },

      {
        $project: {
          _id: 1,
          title: 1,
          status: 1,
        },
      }
    ]);

    return {
      status: 200,

      message: "Tag list successfully fetched.",

      data: tagList,

      count: tagList.length,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.addTag = async (params) => {
  try {


    const addTag = new db.tag({
      ...params
    });

    const saveTag = await addTag.save();
    return {
      status: 200,
      message: "Tag successfully saved.",
      data: saveTag,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.editTag = async (params) => {
  try {
    const checkTag = await db.tag
      .findOne({
        _id: params.id
      }).select("image");

    if (!checkTag)
      return { status: 400, message: "This is not a valid tag." };





    const updatedTag = await db.tag
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
      message: "Tag successfully updated.",
      data: updatedTag,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.details = async (params) => {
  try {
    const finalParams = { _id: ObjectId(params.id) };
    const checkTag = await db.tag.aggregate([
      {
        $match: finalParams,
      },

      {
        $project: {
          _id: 1,
          title: 1,
          status: 1,
        },
      },
    ]);
    if (!checkTag)
      return { status: 400, message: "This is not a valid tag." };

    return {
      status: 200,
      message: "Tag details fetch successful.",
      data: checkTag,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.deleteTag = async (params) => {
  try {
    if (params.authUser && params.authUser.type != "admin") {
      const checkTag = await db.tag
        .findOne({
          _id: params.id,
          created_by: params.authUser._id,
        })
        .select("created_at");
      if (!checkTag) {
        return {
          status: 400,
          message: "Tag Not Match",
        };
      }
    }
    const checkTag = await db.tag.findOne({
      _id: params.id,
      deleted_at: null,
    });
    if (!checkTag)
      return { status: 400, message: "This is not a valid tag." };

    const deleteTag = await db.tag.findByIdAndUpdate(params.id, {
      deleted_at: new Date(),
      deleted_by: params.authUser ? params.authUser._id : null,
    });
    return {
      status: 200,
      message: "tag successfully removed.",
      data: deleteTag,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};
