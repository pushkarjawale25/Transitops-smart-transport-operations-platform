const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const { authorize } = require("../middleware/roleMiddleware");

router.get(
    "/fleet",
    protect,
    authorize("Fleet Manager", "Super Admin"),
    (req, res) => {

        res.json({

            success: true,

            message: "Fleet Manager Dashboard",

            user: req.user

        });

    }
);

router.get(
    "/finance",
    protect,
    authorize("Financial Analyst", "Super Admin"),
    (req, res) => {

        res.json({

            success: true,

            message: "Finance Dashboard",

            user: req.user

        });

    }
);

router.get(
    "/driver",
    protect,
    authorize("Driver"),
    (req, res) => {

        res.json({

            success: true,

            message: "Driver Dashboard",

            user: req.user

        });

    }
);

router.get(
    "/safety",
    protect,
    authorize("Safety Officer", "Super Admin"),
    (req, res) => {

        res.json({

            success: true,

            message: "Safety Dashboard",

            user: req.user

        });

    }
);

module.exports = router;