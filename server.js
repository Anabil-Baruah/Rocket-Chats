const express = require('express');
const path = require('path');
const http = require('http');
const socket = require('socket.io');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const user = require('./models/users')
const cookieParser = require('cookie-parser');
const cloudinary = require('./public/js/fileUploadAPI')
const session = require('express-session');

require('dotenv').config()

// const formatMessage = require('./utils/messages.js');
// const { userJoin, getCurrentUser, userLeaves, getRoomUsers } = require('./utils/users.js');
// const botname = 'chatCord Bot';

const app = express();
const port = process.env.PORT || 8000;



mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
}));

// const newUser = new user({
//     name:"rihan",
//     password:"qwe"
// })

// newUser.save()

// app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use('/', express.static(__dirname + '/public'));
app.use('/login', express.static(__dirname + '/public'));
app.use('/signUp', express.static(__dirname + '/public'));
app.use('/createGroup', express.static(__dirname + '/public'));


app.use('/', require('./routers/chats'))
app.use('/login', require('./routers/login'))
app.use('/signUp', require('./routers/signUp'))
app.use('/logout', require('./routers/logout'))
app.use('/groups', require('./routers/groups'))
app.use('/search', require('./routers/search'))


app.use(function (req, res, next) {
    res.status(404).render('404');
});


const server = http.createServer(app)
const io = socket(server);

io.on('connection', socket => {


    socket.on('join', function (data) {
        socket.join(data.ownerId); // We are using room of socket io
        console.log(data.ownerId)
    });

    socket.on('joinRoom', (data) => {
        console.log(`Client joined room: ${data.ownerId} room ${data.groupId}`);
        socket.join(data.groupId);
    });

    socket.on('chat-message', async (data) => {
        var sendFriend = {
            _id: data.ownerId,
            username: data.ownerName,
            message: data.message,
            imgUrl: ""
        }
        var sendGroup = {
            _id: data.groupId,
            username: data.ownerName,
            message: data.message,
            imgUrl: ""
        }
        // console.log(data)
        if (data.base64String !== undefined) {

            cloudinary.uploader.upload(`data:${data.fileType};base64,${data.base64String}`, {
                resource_type: 'raw',
                folder: 'images',
                width: 1000,
                height: 600,
                public_id: data.public_file_Id
                // crop: "scale"
            }).then((result) => {
                console.log(result.url)
                if (data.groupId === "") {
                    sendFriend = {
                        _id: data.ownerId,
                        username: data.ownerName,
                        message: data.message,
                        imgUrl: result.url
                    }
                    socket.in(data.userId).emit('new_msg', sendFriend)
                }
                else {
                    sendGroup = {
                        _id: data.groupId,
                        username: data.ownerName,
                        message: data.message,
                        imgUrl: result.url
                    }
                    socket.broadcast.to(data.groupId).emit('new_grp_msg', sendGroup)
                }

            }).catch(() => {
                console.log("error occured")
            })
        }
        else {
            socket.in(data.userId).emit('new_msg', sendFriend)

            data.groupId !== "" ? socket.broadcast.to(data.groupId).emit('new_grp_msg', sendGroup) : null
        }
    })

    socket.on('disconnect', () => {
        console.log(`User ${socket.Id} disconnected`);
    });

});

app.set('view engine', 'ejs');
server.listen(port, () => {
    console.log("server stared");
})