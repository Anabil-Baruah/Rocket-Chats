const router = require('express').Router();
const user = require('../models/users')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { baseURL } = require('../auth')
const { auth2 } = require('../auth')
require('dotenv').config()
require('cookie-parser');
const { OAuth2Client } = require('google-auth-library');


const CLIENT_ID = process.env.CLIENT_ID.toString()
const CLIENT_SECRET = process.env.CLIENT_SECRET.toString()
const REDIRECT_URI = `${baseURL}/login/auth/google/callback`;


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
            const { data: { email, given_name, picture } } = await client.request({
                url: 'https://www.googleapis.com/oauth2/v2/userinfo',
            });

            console.log(email, given_name, picture);

            const userFound = await user.findOne({ email })

            if (userFound == null) {
                return res.json({
                    "status": "error",
                    "message": "User does not exist"
                });
            } else {
                var accessToken = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET);

                res.cookie('jwt', accessToken, {
                    httpOnly: true
                })
                const result = await user.findOneAndUpdate({ email }, {
                    $set: {
                        accessToken
                    }
                })

                if (result !== null) {

                    return res.redirect(`${baseURL}`)
                } else {
                    return res.redirect(`${baseURL}/login`)
                }
            }

            // res.redirect('/');
        } catch (err) {
            console.error("error occured ");
            res.redirect(`${baseURL}/login`);
        }
    });


router.route('/')
    .get(auth2, (req, res) => {
        res.render('authPage')
    })
    .post(auth2, async (req, res) => {
        var email = req.body.email;
        var password = req.body.password;

        
        const userFound = await user.findOne({ email })
        

        if (userFound == null) {
            return res.json({
                status: "error",
                message: "User does ont exist"
            });
        } else {
            const passMatch = await bcrypt.compare(password, userFound.password)

            if (passMatch) {
                var accessToken = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET);

                // await user.findOneAndUpdate({ email }, {
                //     $set: {
                //         accessToken
                //     }
                // }, (err, data) => {
                //     if (!err) {
                //         res.cookie('jwt', accessToken)
                //         res.redirect('/')
                //     } else {
                //         res.redirect('/login')
                //     }
                // })
                res.cookie('jwt', accessToken, {
                    httpOnly: true
                })
                const result = await user.findOneAndUpdate({ email }, {
                    $set: {
                        accessToken
                    }
                })
                console.log(result)
                if (result !== null) {
                    res.redirect(`${baseURL}`)
                } else {
                     res.json({
                        status: "error",
                        message: "Invalid credentials"
                    });
                }
            } else {
                res.json({
                    "status": "error",
                    "message": "Invalid credentials"
                })
            }
        }

    })

module.exports = router