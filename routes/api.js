const express = require("express");
const router = express.Router();


// User Search api
const userController = require("../controllers/userController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const tagController = require("../controllers/tagController");
const authController = require("../controllers/authController");
router.post("/user/sign-up", authController.signup);
router.post("/user/login", authController.login);
router.post("/user-search", userController.list);
router.post("/user/add", userController.add);
router.post("/user/edit",  userController.edit);
router.post("/user/delete", userController.delete);
router.post("/user/details", userController.details);
router.post("/category", categoryController.listCategory);
router.post("/category/add", categoryController.addCategory);
router.post("/category/edit", categoryController.editCategory);
router.post("/category/delete", categoryController.deleteCategory);
router.post("/category/details", categoryController.details);
router.post("/product", productController.listProduct);
router.post("/product/add", productController.addProduct);
router.post("/product/edit", productController.editProduct);
router.post("/product/delete", productController.deleteProduct);
router.post("/product/details", productController.details);
router.post("/tag", tagController.listTag);
router.post("/tag/add", tagController.addTag);
router.post("/tag/edit", tagController.editTag);
router.post("/tag/delete", tagController.deleteTag);
router.post("/tag/details", tagController.details);





module.exports = router;
