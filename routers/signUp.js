const router = require('express').Router();
const user = require('../models/users')
require('cookie-parser');
const { auth2 } = require("../auth")
const { baseURL } = require("../auth")
const cloudinary = require('../public/js/fileUploadAPI')

const { OAuth2Client } = require('google-auth-library');


const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = `${baseURL}/signUp/auth/google/callback`;


const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);



router.route('/auth/google')
    .get((req, res) => {
        const authUrl = client.generateAuthUrl({
            scope: ['profile', 'email', 'https://www.googleapis.com/auth/userinfo.profile'],
            state: req.session.csrfToken,
        });
        res.redirect(authUrl);
    });

router.route('/auth/google/callback')
    .get(async (req, res, next) => {
        const { code } = req.query;

        try {
            // Exchange authorization code for access token
            const { tokens } = await client.getToken(code);

            // Set access token for future requests
            client.setCredentials(tokens);

            // Retrieve user information
            const { data: { email, given_name, family_name, picture } } = await client.request({
                url: 'https://www.googleapis.com/oauth2/v2/userinfo',
            });

            console.log(email, given_name, picture);

            const userFound = await user.findOne({ email })

            if (userFound !== null) {
                return res.json({
                    "status": "error",
                    "message": "User already exist login in to continue"
                });
            }
            const newUser = new user({
                username: given_name,
                email: email,
                password: "",
                profilePic: picture

            })
            //generating token
            const token = await newUser.generateAuthToken();

            res.cookie("jwt", token, {
                httpOnly: true
            });
            const result = await newUser.save()

            if (result) {
                res.redirect(`${baseURL}`)
            }
            else {
                res.json({ message: err.message, type: 'danger' })
            }

            // res.redirect('/');
        } catch (err) {
            console.error("error occured");
            res.redirect(`${baseURL}/signUp`);
        }
    });

router.route('/')
    .get(auth2, (req, res) => {
        res.render('authPage')
    })
    .post(auth2, async (req, res) => {
        console.log(req.body)
        const userExist = await user.findOne({ email: req.body.email })
        if (userExist) {
            return res.json({status: "error", "message": "Sorry user already exists"})
        }
        const newUser = new user({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,

        })
        //generating token
        const token = await newUser.generateAuthToken();

        res.cookie("jwt", token, {
            httpOnly: true
        });
        const result = await newUser.save()

        if (result) {

            // req.session.message = {
            //     message: 'user inserted succesfully',
            //     type: 'success'
            // }
            res.redirect('/')
        }
        else {
            res.json({ message: err.message, type: 'danger' })
        }
    })

module.exports = router