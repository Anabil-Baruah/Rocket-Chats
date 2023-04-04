const router = require('express').Router()
const { auth } = require('../auth')
const { baseURL } = require('../auth')
const group = require('../models/groups')
const user = require('../models/users')
const cloudinary = require('../public/js/fileUploadAPI')

router.route('/createGroup')
    .post(auth, async (req, res) => {

        const userFound = await user.findOne({ accessToken: req.accessToken })

        if (userFound === null)
            return res.render(`${baseURL}/login`)


        // upload pics to cloudinary
        cloudinary.uploader.upload(`data:${req.body.fileType};base64,${req.body.base64}`, {
            resource_type: 'image',
            folder: 'images_DP',
            width: 300,
            height: 300,
            // crop: "scale"
        }).then(async (result) => {
            console.log(result)
            const newGroup = new group({
                groupName: req.body.name,
                profilePhoto: result.url,
                description: req.body.description,
                members: [{
                    _id: userFound._id,
                    username: userFound.username
                }],
                admin: {
                    _id: userFound._id,
                    username: userFound.username
                }
            })

            await user.updateOne({ accessToken: req.accessToken }, {
                $push: {
                    groups: {
                        _id: newGroup._id,
                        groupName: newGroup.groupName
                    }
                }
            })
            const grpSave = await newGroup.save()
            if (grpSave)
                res.json({ status: "success", message: "Group created succesfully" })
            else
                res.json({ status: "error", message: "Sorry error occured please try later !" })

            console.log(result.url)


        }).catch(() => {
            console.log("error occured")
        })



    })

router.route('/updateProfile')
    .post(auth, async (req, res) => {

        const userFound = await user.findOne({ accessToken: req.accessToken })

        if (userFound === null)
            return res.render(`${baseURL}/login`)

        cloudinary.uploader.upload(`data:${req.body.fileType};base64,${req.body.base64String}`, {
            resource_type: 'image',
            folder: 'images_DP',
            width: 300,
            height: 300,
            // crop: "scale"
        }).then(async (result) => {
            console.log(result)
            const picSaved = await user.updateOne({ accessToken: req.accessToken }, {
                $set: {
                    profilePic: result.url
                }
            })
            if (picSaved)
                return res.json({ status: "success", message: "Profile updated", url: result.url })
            res.json({ status: "error", message: "Sorry couldn't upload pic" })


        }).catch(() => {
            console.log("error occured")
            res.json({ status: "error", message: "some error occured plz try later" })
        })


    })

router.route('/joinGroup')
    .post(auth, async (req, res) => {
        const userFound = await user.findOne({ accessToken: req.accessToken })

        if (userFound === "")
            return res.json({ status: "error", message: "User has been logged out" })

        const groupFound = await group.findOne({ _id: req.body.groupId })
        const memberExist = groupFound.members.some(obj => obj._id.toString() === userFound._id.toString())

        if (memberExist)
            return res.json({ status: "success", message: "You are already a member" })

        const userAdded = await group.updateOne({ _id: req.body.groupId }, {
            $push: {
                members: {
                    _id: userFound._id,
                    username: userFound.username
                }
            }
        })
        const grpAdded = await user.findOneAndUpdate({ accessToken: req.accessToken }, {
            $push: {
                groups: {
                    _id: req.body.groupId,
                    groupName: groupFound.groupName
                }
            }
        })

        if (userAdded && grpAdded) {
            res.json({
                status: "success",
                message: "You have been added succesfully"
            })
        } else {
            res.json({
                status: "error",
                message: "Sorry some error occured"
            })
        }
        return
    })


router.route('/settings/:_id')
    .get(auth, async (req, res) => {
        const userFound = await user.findOne({ accessToken: req.accessToken })
        if (userFound === null) {
            res.json({ status: "error", message: "User has been logged out" })
        }
        const _id = req.params._id;
        const grpFound = await group.findById(_id)

        const ids = grpFound.members.map(obj => obj._id);

        const members = await user.aggregate([
            {
                $match: {
                    _id: {
                        $in: ids
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    profilePic: 1,
                    bio: 1
                }
            }
        ]);

        // res.render('grpSetting', members)
        res.render('grpSetting', { grpFound, members, baseURL })
    })
    .post(auth, async (req, res) => {

    })

router.route('/removeMember')
    .post(auth, async (req, res) => {
        const userFound = await user.findOne({ accessToken: req.accessToken })
        if (userFound === null) {
            res.json({ status: "error", message: "User has been logged out" })
        }
        const grpUpdate = await group.updateOne({ _id: req.body.groupId }, {
            $pull: {
                members: {
                    _id: req.body._id
                }
            }
        })

        const userUpdate = await user.updateOne({ _id: req.body.Id }, {
            $pull: {
                groups: {
                    _id: req.body.groupId
                }
            }
        })

        if (grpUpdate && userUpdate) {
            res.json({ status: "success", message: "User has been removed" })
        } else {
            res.json({ status: "error", message: "Error occured try later" })
        }
        console.log(req.body)
    })

router.route('/togglePrivateGrp')
    .post(auth, async (req, res) => {
        const userFound = await user.findOne({ accessToken: req.accessToken })
        const groupFound = await group.findById({ _id: req.body._id })
        var groupUpdate

        console.log(req.body)
        if (userFound === null) {
            res.json({
                status: "error",
                message: "User has been logged out"
            })
        }
        console.log(groupFound)

        if (groupFound.groupStatus === "Private") {
            groupUpdate = await group.updateOne({ _id: req.body._id }, {
                $set: {
                    groupStatus: "Public"
                }
            })
        } else {
            groupUpdate = await group.updateOne({ _id: req.body._id }, {
                $set: {
                    groupStatus: "Private"
                }
            })
        }
       
        if (groupUpdate) {
            console.log("haga")
            res.json({
                status: "success"
            })
        }
    })
module.exports = router