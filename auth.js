const jwt = require('jsonwebtoken');
const register = require("./models/users");
// const baseURL = "http://localhost:8000"
const baseURL = "https://chat-sphere-381410.el.r.appspot.com"
require('dotenv').config()

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // console.log(verifyUser);

        const user = await register.findOne({ _id: verifyUser._id });

        // if (user == null)
        //     return res.redirect(`${baseURL}/login`)

        req.user = user;
        req.accessToken = token
        next();
    } catch (error) {
        console.log("Shit")
        res.redirect(`${baseURL}/login`)
    }
}

const auth2 = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        

        const user = await register.findOne({ _id: verifyUser._id });
       

        if(verifyUser !== null)
            return res.redirect(`${baseURL}`)
        req.user = user;
        req.accessToken = token
        next();
    } catch (error) {
        next()
    }
}

module.exports = { auth, baseURL, auth2 };