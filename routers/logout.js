const router = require('express').Router()
const {baseURL} = require('../auth')
const {auth} = require('../auth')

router.route('/')
    .get(auth, async(req,res)=>{
        res.clearCookie('jwt');
        res.redirect(`${baseURL}/login`)
    })

module.exports = router