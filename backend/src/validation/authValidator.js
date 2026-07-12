const { body } = require("express-validator");

exports.registerValidation = [

body("firstName")
.notEmpty()
.withMessage("First Name Required"),

body("lastName")
.notEmpty()
.withMessage("Last Name Required"),

body("email")
.isEmail()
.withMessage("Invalid Email"),

body("password")
.isLength({min:6})
.withMessage("Password Minimum 6 Characters"),

body("role")
.notEmpty()
.withMessage("Role Required")

];

exports.loginValidation=[

body("email")
.isEmail(),

body("password")
.notEmpty()

];
