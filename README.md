
# Rocket Chats

Rocket Chats is a scalable chat application that can handle a large user base. With features such as group creation, file and image sharing, group joining, and profile photo updates, Rocket Chats is a versatile communication platform suitable for a variety of use cases.It users different APIs for its functionality including google APIs


## Demo

https://chat-sphere-381410.el.r.appspot.com


## Features

- Group creation
- Group joining
- Image sharing
- Profile photo updates
- Scalable: hosted on Google's App Engine and uses autoscaling to handle increases in traffic
- Single sign-on (SSO) with the option to sign in and log in with Google.
- Users cloudinary APIs for uploading files and images
- JWT authentication
## Usage

To use Rocket Chats, simply create an account or sign in with your Google account. From there, you can create a group, join existing groups, and share files and images with other users.
## Installation

To use Rocket Chats, you'll need to have Node.js , npm and mongoDB installed on your machine.

```bash
cd Rocket-Chats
```
Then install the node modules and all teh dependencies by running -

```bash
 npm install
```
Start the server
```bash
 nodemon server.js
```
    
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`ACCESS_TOKEN_SECRET` 

`MONGO_URL`

Note: You must have account in google cloud in order to get CLIENT_ID and CLIENT_SECRET variables given below

`CLIENT_ID`

`CLIENT_SECRET`

Note: below env variables are from cloudinary

`CLOUD_NAME`

`API_KEY`

`API_SECRET`


## Contributing

Contributions to Rocket Chats are welcome! If you would like to contribute, please follow these steps:

- Fork the repository.
```bash
 git clone https://github.com/Anabil-Baruah/rocket-chats.git

```

- Create a new branch for your changes.

```bash
git checkout -b <new-branch-name>

```

- Install the dependencies
```bash
npm install
```
- Make your changes and commit them with 
descriptive commit messages.

```bash
git add .
git commit -m "Add feature X"
```

- Push your changes to your fork.

```bash
git push origin <new-branch-name>

```
- Create a pull request against the main repository on GitHub. In the pull request, explain your changes and why they are needed.

    Once your pull request is submitted, the maintainers of the project will review your changes and provide feedback. If everything looks good, your changes will be merged into the main repository.

Thank you for reading!


