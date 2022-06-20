const router = require("express").Router()
const c = require("../controllers/announceController")
const authorize = require("../middleware/authorize")
const dataValidator = require("../middleware/dataValidation")
const {
	createSchema,
	updateSchema,
} = require("../middleware/dataSchemas/announceSchemas")
const { upload, uploadController } = require("../utilities/fileUpload")

router.use(authorize)
router.get("/", c.getAnnouncementAll)
router.get("/:id", c.getAnnouncementId)
router.post(
	"/",
	upload.array("attachments", 20),
	uploadController,
	c.createAnnouncement
)
router.put("/:id", c.updateAnnouncement)
router.put("/:id/read", c.markAsRead)
router.delete("/:id", c.deleteAnnouncement)
 
module.exports = router
