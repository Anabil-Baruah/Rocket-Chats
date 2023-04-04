const router = require('express').Router()
const user = require('../models/users')
const group = require('../models/groups')
const messages = require('../models/messages')
const { auth } = require('../auth')
const { baseURL } = require('../auth')
const { ObjectId } = require('mongodb');
const { formatDate } = require('../public/js/helperFunctions')
const { formatName } = require('../public/js/helperFunctions')
const cloudinary = require('../public/js/fileUploadAPI')
require('dotenv').config()

router.route('/')
    .get(auth, async (req, res) => {
        const userFound = await user.findOne({ accessToken: req.accessToken })

        if (userFound === null)
            return res.render(`authPage`)

        const friends = await user.find({ _id: { "$ne": userFound._id } })
        var groupIds = userFound.groups.map(obj => obj._id); 
        
        var groups = await group.find({_id: {$in: groupIds }})
         const myGroups = await group.find({ "admin._id": userFound._id })

        res.render('chat', { user: userFound, friends, baseURL, groups ,myGroups})
    })

router.route('/selectUser')
    .post(auth, async (req, res) => {
        var _id = req.body._id
        var msg = []

        const userFound = await user.findOne({ accessToken: req.accessToken })
        const friendFound = await user.findOne({ _id })
        if (userFound._id.toString() === friendFound._id.toString()) { return res.json({ status: "unauthorized" }) }

        const conversationFound = userFound.conversations.find(conv => conv.friend._id.toString() === friendFound._id.toString());

        if (conversationFound) {
            msg = await messages.find({ conversation_id: conversationFound._id })
            msg = formatDate(msg)       //to format the date
            msg = formatName(msg, userFound._id)
            // console.log(msg)
        }
        res.json({
            status: "success",
            messages: msg
        })
    })
router.route('/saveMessage')
    .post(auth, async (req, res) => {
        var _id = req.body._id
        var file = ""

        var userFound = await user.findOne({ accessToken: req.accessToken })


        if (req.body.groupId !== "") {

            if (req.body.fileType !== undefined) {

                cloudinary.uploader.upload(`data:${req.body.fileType};base64,${req.body.base64String}`, {
                    resource_type: 'raw',
                    folder: 'images',
                    width: 1000,
                    height: 600,
                    public_id: req.body.public_file_Id
                    // crop: "scale"
                }).then(async (result) => {
                    const newMessage = new messages({
                        conversation_id: req.body.groupId,
                        sender: {
                            user_id: userFound._id,
                            username: userFound.username
                        },
                        content: req.body.message,
                        file: result.url,
                        fileType: req.body.fileType
                    })
                    const IsMsgSave = await newMessage.save()


                    if (IsMsgSave)
                        res.json({ status: "success", url: result.url })
                    else
                        res.json({ status: "error", url: "" })

                }).catch(() => {
                    console.log("error occured haga")
                })
                return
            }
            const newMessage = new messages({
                conversation_id: req.body.groupId,
                sender: {
                    user_id: userFound._id,
                    username: userFound.username
                },
                content: req.body.message,
                file
            })
            const msgSave = await newMessage.save()
            if (msgSave)
                return res.json({ status: "success", url: "" })
            else
                res.json({ status: "error", url: "" })
            return
        }

        var friendFound = await user.findOne({ _id })



        if (userFound == null || friendFound == null) return

        const objectId = new ObjectId();

        let conversationFound = userFound.conversations.some(conv => conv.friend._id.toString() === friendFound._id.toString());



        if (!conversationFound) {
            await user.updateOne({ _id: userFound._id }, {
                $push: {
                    conversations: {
                        _id: objectId,
                        friend: {
                            _id: friendFound._id,
                            username: friendFound.username
                        }
                    }
                }
            }).then(async (result) => {
                await user.updateOne({ _id: friendFound._id }, {
                    $push: {
                        conversations: {
                            _id: objectId,
                            friend: {
                                _id: userFound._id,
                                username: userFound.username
                            }
                        }
                    }
                })
            })
        }
        userFound = await user.findOne({ accessToken: req.accessToken })
        conversationFound = userFound.conversations.find(conv => conv.friend._id.toString() === friendFound._id.toString());

        // if (req.body.isGroupChat) { 
        //     conversationFound = {_id}          
        //  } 
        //  req.body.group_id !== "" ? conversationFound = {_id} :null  //to check if it is a group message

        if (req.body.fileType !== undefined) {
            cloudinary.uploader.upload(`data:${req.body.fileType};base64,${req.body.base64String}`, {
                resource_type: 'raw',
                folder: 'images',
                width: 1000,
                height: 600,
                public_id: req.body.public_file_Id
                // crop: "scale"
            }).then(async (result) => {

                const newMessage = new messages({
                    conversation_id: conversationFound._id,
                    sender: {
                        user_id: userFound._id,
                        username: userFound.username
                    },
                    content: req.body.message,
                    file: result.url,
                    fileType: req.body.fileType
                })
                const msgSave = await newMessage.save()
                if (msgSave)
                    res.json({ status: "success", url: result.url })
                else
                    res.json({ status: "error", url: "" })

                console.log(result.url)


            }).catch(() => {
                console.log("error occured")
            })
        } else {
            const newMessage = new messages({
                conversation_id: conversationFound._id,
                sender: {
                    user_id: userFound._id,
                    username: userFound.username
                },
                content: req.body.message,
                file
            })
            const msgSave = await newMessage.save()
            if (msgSave)
                res.json({ status: "success", url: "" })
            else
                res.json({ status: "error", url: "" })
        }
    })

router.route('/selectGroup')
    .post(auth, async (req, res) => {
        const _id = req.body._id
        var msg = []
        const userFound = await user.findOne({ accessToken: req.accessToken })
        if (userFound === null) return res.render(`authPage`)

       

        msg = await messages.find({ conversation_id: _id })
        if (msg) {
            msg = formatDate(msg)       //to format the date
            msg = formatName(msg, userFound._id)
        }

        const groupFound = await group.findOne({ _id })
        const memberExist = groupFound.members.some(obj => obj._id.toString() === userFound._id.toString())

        if(groupFound.groupStatus !== "Public" && !memberExist){
            return res.json({status:"Not joined", message:"This group is private", isMember: memberExist})
        }
        
        res.json({ status:"Joined", messages: msg, isMember: memberExist })
    })
module.exports = router