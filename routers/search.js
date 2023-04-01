const router = require('express').Router()
const user = require('../models/users')
const { auth } = require('../auth')
const { baseURL } = require('../auth')
const group = require('../models/groups')
const messages = require('../models/messages')


// const { Client } = require('@elastic/elasticsearch');
// const client = new Client({ node: `${baseURL}` });



router.route('/')
    .post(auth, async (req, res) => {
        const userFound = await user.findOne({ accessToken: req.accessToken })
        if (userFound === null)
            return res.render(`authPage`)
        const groups = await group.find(
            { groupName: { $regex: req.body.query } }, { groupName: 1, profilePhoto: 1, _id: 1 })   //second part is projection it only projects the required filed in an object
        const users = await user.find(
            { username: { $regex: req.body.query } }, { username: 1, profilePic: 1, _id: 1 })

        
        res.json({
            users, groups
        })

    });

module.exports = router