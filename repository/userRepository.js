const db = require("../models");

const { keywordSearch } = require("../helpers/search");
const { ObjectId } = require("mongoose").Types;

exports.list = async (params) => {
  try {
    const finalParams = { ...keywordSearch(params, "name"), deleted_at: null };
    const userList = await db.user.aggregate([
      {
        $match: finalParams,
      },

      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1
        },
      }
    ]);

    return {
      status: 200,

      message: "User list successfully fetched.",

      data: userList,

      count: userList.length,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.add = async (params) => {
  try {


    const addUser = new db.user({
      ...params
    });

    const saveUser = await addUser.save();
    return {
      status: 200,
      message: "User successfully saved.",
      data: saveUser,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.edit = async (params) => {
  try {
    const checkUser = await db.user
      .findOne({
        _id: params.id
      }).select("image");

    if (!checkUser)
      return { status: 400, message: "This is not a valid user." };





    const updatedUser = await db.user
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
      message: "User successfully updated.",
      data: updatedUser,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.details = async (params) => {
  try {
    const finalParams = { _id: ObjectId(params.id) };
    const checkUser = await db.user.aggregate([
      {
        $match: finalParams,
      },

      {
        $project: {
          _id: 1,
          type: 1,
          name: 1,
          email: 1,
          created_at: 1,
          image: {
            $cond: {
              if: "$image",
              then: {
                $concat: [
                  process.env.BASE_URL,
                  "uploads/profile-images/256/",
                  "$image",
                ],
              },
              else: {
                $concat: [
                  process.env.FRONT_URL,
                  "uploads/profile-images/no-img.png",
                ],
              },
            },
          },
        },
      },
    ]);
    if (!checkUser)
      return { status: 400, message: "This is not a valid user." };

    return {
      status: 200,
      message: "User details fetch successful.",
      data: checkUser,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};

exports.delete = async (params) => {
  try {
    if (params.authUser && params.authUser.type != "admin") {
      const checkUser = await db.user
        .findOne({
          _id: params.id,
          created_by: params.authUser._id,
        })
        .select("created_at");
      if (!checkUser) {
        return {
          status: 400,
          message: "User Not Match",
        };
      }
    }
    const checkUser = await db.user.findOne({
      _id: params.id,
      deleted_at: null,
    });
    if (!checkUser)
      return { status: 400, message: "This is not a valid user." };

    const deleteUser = await db.user.findByIdAndUpdate(params.id, {
      deleted_at: new Date(),
      deleted_by: params.authUser ? params.authUser._id : null,
    });
    return {
      status: 200,
      message: "User successfully removed.",
      data: deleteUser,
    };
  } catch (err) {
    return { status: 400, message: err.message };
  }
};
