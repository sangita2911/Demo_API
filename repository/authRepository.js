
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");
exports.signup = async (params) => {
    try {
      
  
      const checkUser = await db.user
        .findOne({
          email: { $regex: new RegExp("^" + params.email.toLowerCase(), "i") },
        })
        .select("created_at");
      if (checkUser) {
        return {
          status: 400,
          message: { email: [`${params.email} is already taken.`] },
        };
      }
      let reg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      if (!reg.test(params.password)) {
        return {
          status: 400,
          message: {
            password: [
              "Minimum eight characters, at least one letter, one number and one special character",
            ],
          },
        };
      }
      const salt = bcrypt.genSaltSync(12);
      const password = bcrypt.hashSync(params.password, salt);

      const user = new db.user({
        ...params,
        password
      });
      const newUser = await user.save();
      return {
        status: 200,
        message: "User successfully created. Please check your email.",
        data: newUser,
      };
    } catch (err) {
      return { status: 400, message: err.message };
    }
  };

  exports.login = async (params) => {
    try {
   
     
      //console.log(modId);
      const checkUser = await db.user
        .findOne({
          email: { $regex: new RegExp("^" + params.email.toLowerCase(), "i") },
          role_id: "user",
        })
        .select("password");
      if (!checkUser) {
        return {
          status: 400,
          message: `${params.email} is not registered with us.`,
        };
      }
      const comparePassword = bcrypt.compareSync(
        params.password,
        checkUser.password
      );
      if (!comparePassword) {
        return { status: 400, message: "Inconnect password, please try again." };
      }
      const updateUser = await db.user
        .findByIdAndUpdate(
          checkUser._id,
          {
            last_login: new Date(),
          },
          { new: true }
        )
        .select(
          `-name
          -password 
        -created_at 
        -updated_at 
        -deleted_at`
        )
        .lean();
  
      const userRes = {
        ...updateUser,
      };
  
      const accessToken = jwt.sign(userRes, process.env.JWT_SECRET_KEY, {
        expiresIn: "24h",
      });
  
      return {
        status: 200,
        message: `Hey ${updateUser.name}, welcome back. You've successfully logged in.`,
        data: {
          ...userRes,
          access_token: accessToken,
        },
      };
    } catch (err) {
      // console.log(err);
      return { status: 400, message: err.message };
    }
  };

