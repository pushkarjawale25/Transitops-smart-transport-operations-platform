const express = require("express");

const router = express.Router();

const auth = require("../controllers/authcontroller");

const { protect } = require("../middleware/authmiddleware");

const { registerValidation, loginValidation } = require("../validation/authValidator");

const { validate } = require("../middleware/validationMiddleware");

router.post(
    "/register",
    registerValidation,
    validate,
    auth.register
);

router.post(
    "/login",
    loginValidation,
    validate,
    auth.login
);

router.get("/me", protect, auth.me);

router.post("/logout", protect, auth.logout);

module.exports = router;