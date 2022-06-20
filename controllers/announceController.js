const asyncHandler = require("express-async-handler")
const User = require("../models/userModel")
const Announcement = require("../models/announcement/announceModel")
const Announcement_User = require("../models/announcement/announcement_user")

const getAnnouncementAll = asyncHandler(async (req, res) => {
	let { tags, s: search, limit = 10, page = 0, nolost = false } = req.query

	// define our query conditions
	let query = {
		$or: [
			{ visibility: [] },
			{ user: req.user.id },
			{ visibility: { $elemMatch: { $in: req.user.groups } } },
		],
		$and : [{$ne : null}]
	}

	// check if tags or search params exist and if so add to query
	tags = tags ? JSON.parse(tags) : []
	if (nolost && nolost == 'true') query.$and.push({$or : [
	  {tags : {$elemMatch : {$nin : ['Lost And Found']}}},
	  {tags : []}
	]})
	if (tags.length > 0) query.$and.push({tags : { $elemMatch: { $in: tags } }})
	if (search) query.title = new RegExp(search, "i") // perform case insensitive search on title
	let announcements = []

	console.log(query.$and[1])
	// perform query
	await Announcement.find(query)
		.sort({ createdAt: -1 })
		.skip(limit * page)
		.limit(limit)
		.populate("attachments")
		.populate("user", "name avatar")
		.populate("user.avatar")
		.cursor()
		.eachAsync(async (doc) => {
			const read = await Announcement_User.findOne({
				user: req.user.id,
				announcement: doc.id,
			})
			doc._doc.read = read ? true : false
			announcements.push(doc)
		})

	// check if query returned any results
	if (!announcements || announcements.length === 0) {
		res.status(404)
		throw new Error("Announcement(s) not found")
	}

	res.status(200).json({
		limit,
		nextPage: page + 1,
		data: announcements,
	})
})

const getAnnouncementId = asyncHandler(async (req, res) => {
	// perform query while respecting visibility constraints
	const announcement = await Announcement.findOne({
		_id: req.params.id,
		$or: [
			{ visibility: [] },
			{ user: req.user.id },
			{ visibility: { $elemMatch: { $in: req.user.groups } } },
		],
	})
		.populate("user", "name avatar")
		.populate("user.avatar")
		.populate("attachments")
		.populate("visibility", "name")

	if (!announcement) {
		res.status(404)
		throw new Error("Announcement not found")
	}

	// read status
	const read = await Announcement_User.findOne({
		user: req.user.id,
		announcement,
	})
	announcement._doc.read = read ? true : false
	res.status(200).json(announcement)
})

const createAnnouncement = asyncHandler(async (req, res) => {
	const { body } = req
	console.log(body, req.files)

	// create and save announcement
	const announcementObj = new Announcement({ ...body, attachments: req.files })
	announcementObj.user = req.user.id

	const announcement = await announcementObj.save()

	res.status(201).json(announcementObj)
})

const updateAnnouncement = asyncHandler(async (req, res) => {
	const { body } = req

	// search for the announcement

	const announcement = await Announcement.findById(req.params.id)

	if (!announcement) {
		res.status(404)
		throw new Error("Announcement doesn't exist")
	}

	// search if announcement matches the user or if the user is an admin

	if (announcement.user != req.user.id && !req.user.isAdmin) {
		res.status(401)
		throw new Error("Unauthorized, you can't change this announcement")
	}

	// updating the announcement

	try {
		await announcement.updateOne(body, { runValidators: true })
		res.status(200).json({
			old: announcement,
			changed: body,
		})
	} catch (err) {
		res.status(400)
		throw new Error(err)
	}
})

const deleteAnnouncement = asyncHandler(async (req, res) => {
	const announcement = await Announcement.findById(req.params.id)

	if (!announcement) {
		res.status(400)
		throw new Error("Announcement doesn't exist")
	}

	// search if announcement matches the user or if the user is admin

	if (announcement.user != req.user.id && !req.user.isAdmin) {
		res.status(401)
		throw new Error("Unauthorized, you can't delete this announcement")
	}

	// deleting the announcement

	await announcement.remove()

	res.status(200).json({ id: announcement._id })
})

const markAsRead = asyncHandler(async (req, res) => {
	const announcement = await Announcement.findOne({
		_id: req.params.id,
		$or: [
			{ visibility: [] },
			{ user: req.user._id },
			{ visibility: { $elemMatch: { $in: req.user.groups } } },
		],
	})

	if (!announcement) {
		res.status(404)
		throw new Error("Announcement not found")
	}

	// search if announcement is already read

	const read = await Announcement_User.findOne({
		user: req.user.id,
		announcement: announcement,
	})

	// mark as read or unread
	// req.query.read specifies if announcement is marked to be read or not

	if (req.query.read === "true") {
		if (!read) {
			const read = await Announcement_User.create({
				announcement: announcement.id,
				user: req.user.id,
			})

			res.status(200).json(read)
		} else {
			res.status(200).json(read)
		}
	} else {
		if (read) {
			await Announcement_User.deleteOne(read)
			res.status(200).json(read)
		} else {
			res.status(200).json(null)
		}
	}
})

module.exports = {
	getAnnouncementAll,
	getAnnouncementId,
	createAnnouncement,
	updateAnnouncement,
	deleteAnnouncement,
	markAsRead,
}
