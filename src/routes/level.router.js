const { Router } = require("express");
const {
  addAdditionalSections,
  createLevel,
  deleteLevel,
  deleteSection,
  updateLevelDetails,
  updateSectionDetails,
  getLevel,
} = require("../controllers/level.cotroller.js");
const { verifyJwt } = require("../middlewares/auth.middlewares.js");
const router = Router();

router.route("/create-level").post(verifyJwt, createLevel);
router.route("/add-section").post(verifyJwt, addAdditionalSections);
router.route("/delete-level/:levelId").delete(verifyJwt, deleteLevel);
router.route("/update-level/:levelId").patch(verifyJwt, updateLevelDetails);
router.route("/delete-section/:sectionId").delete(verifyJwt, deleteSection);
router
  .route("/update-section/:sectionId")
  .patch(verifyJwt, updateSectionDetails);
router.route("/get-Level").get(getLevel);

module.exports = router;
