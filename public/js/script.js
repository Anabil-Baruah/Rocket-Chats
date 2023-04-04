const baseURL = 'http://localhost:8000'
// const baseURL = "https://chat-sphere-381410.el.r.appspot.com"
const socket = io(baseURL)
const owner = document.querySelector('#ownerId').value
const chatMessages = document.querySelector('.chat-messages');
const form = document.querySelector('#chat-form');
const fileInput = document.getElementById('file-input');
const joinGrp = document.getElementById('join-group')
var submitButton = document.querySelector("#submitMsg");

// fileInput.addEventListener('change', (event) => {
//   const file = event.target.files[0];
//   const reader = new FileReader();
//   reader.readAsDataURL(file);
//   reader.onload = () => {
//     const fileData = {
//       name: file.name,
//       type: file.type,
//       data: reader.result.split(',')[1] // remove "data:image/png;base64," prefix
//     };
//     // socket.emit('fileData', fileData);
//     console.log(fileData)
//   };
// });



socket.on("new_msg", function (data) {
  const userAt = document.querySelector('#userId').value
  console.log(userAt, data._id)
  if (userAt === data._id)
    outputMessage(data)

  // const blob = new Blob([data.file], { type: 'image/png' });

  // Create a URL for the blob
  // const url = URL.createObjectURL(blob);
  // console.log(url)

  chatMessages.scrollTop = chatMessages.scrollHeight;

})
socket.on('new_grp_msg', (data) => {
  const userAt = document.querySelector('#groupId').value
  if (userAt === data._id)
    outputMessage(data)

  console.log(data)
})


function userSelect(self) {
  const userId = self.getAttribute('user-id')
  const userName = self.getAttribute('user-name')


  $('.chats').css('background-color', '#7386ff')
  $(`[user-id="${userId}"].chats`).css('background-color', 'rgb(59 81 255)');
  $('.chatsSm').css('background-color', '#f6f6f6')
  $(`[user-id="${userId}"].chatsSm`).css('background-color', 'rgb(195 195 195)');


  socket.emit('join', { ownerId: owner })

  var submitButton = document.querySelector("#submitMsg");
  submitButton.removeAttribute("disabled");

  // console.log(userId)
  const data = { _id: userId };
  document.querySelector('#userId').value = ""
  document.querySelector('#userName').value = ""
  document.querySelector('#groupId').value = ""
  document.querySelector('#groupName').value = ""
  document.querySelector('#userId').value = userId
  document.querySelector('#userName').value = userName

  $.ajax({
    url: `${baseURL}/selectUser`,
    method: 'POST',
    data: JSON.stringify(data),
    contentType: 'application/json',
    success: function (response) {
      var html = ""
      response.status === "unauthorized" ? location.reload() : null
      console.log(response)
      response.messages.forEach((message) => {
        var chatColor = ""
        if (message.sender.username === "You") {
          chatColor = "-sender"
        }
        html += `<div class="message${chatColor}">
        <p class="meta"><b>${message.sender.username}</b><span> ${message.createdAt}</span></p>
        <p class="text">
          ${message.content}
        </p>`
        if (message.file !== "") {
          html += `<p><img src=${message.file} onclick="openImage('${message.file}')" alt=""></p>`
        }
        html += '</div>'
      })
      if (response.messages.length == 0) {
        document.querySelector('.chat-messages').innerHTML = html
      }
      document.querySelector('.chat-messages').innerHTML = html
      chatMessages.scrollTop = chatMessages.scrollHeight;
    },
    error: function (error) {
      alert("Sorry some error occured please try again later")
    }
  });
}

function groupSelect(self) {
  const groupId = self.getAttribute('group-id')
  const groupname = self.getAttribute('group-name')

  
  $('.chats').css('background-color', '#7386ff')
  $('.chatsSm').css('background-color', '#f6f6f6')
  $(`[group-id="${groupId}"].chats`).css('background-color', 'rgb(59 81 255)');
  $(`[group-id="${groupId}"].chatsSm`).css('background-color', 'rgb(195 195 195)');


  
  socket.emit('joinRoom', { ownerId: owner, groupId });

  var submitButton = document.querySelector("#submitMsg");
  submitButton.removeAttribute("disabled");

  const data = { _id: groupId, isGroupChat: true }
  document.querySelector('#userId').value = ""
  document.querySelector('#userName').value = ""
  document.querySelector('#groupId').value = ""
  document.querySelector('#groupName').value = ""
  document.querySelector('#groupId').value = groupId
  document.querySelector('#groupName').value = groupname
  console.log(groupId)

  $.ajax({
    url: `${baseURL}/selectGroup`,
    method: 'POST',
    data: JSON.stringify(data),
    contentType: 'application/json',
    success: function (response) {
      var html = ""
      var chatColor = ""

      if(response.status === "Not joined"){
        document.querySelector('.chat-messages').innerHTML = `<h3 class='text-center'>${response.message}</h3>`
        submitButton.setAttribute("disabled", true);
      }else{
      response.messages.forEach((message) => {
        message.sender.username === "You" ? chatColor = "-sender" : null
        html += `<div class="message${chatColor}">
        <p class="meta"><b>${message.sender.username}</b><span> ${message.createdAt}</span></p>
        <p class="text">
          ${message.content}
        </p>`
        message.file !== "" ? html += `<p><img src=${message.file} alt=""></p>` : null
        html += '</div>'
      })
      document.querySelector('.chat-messages').innerHTML = html
    }

      !response.isMember ? joinGrp.innerHTML = `<button onclick="joinGroup(this)" class="btn btn-success">Join group</button>` : joinGrp.innerHTML = ``

      chatMessages.scrollTop = chatMessages.scrollHeight;
    },
    error: function (response) {
      alert("Sorry some error occured please try again later")
    }
  })
}

function joinGroup(self) {
  var groupId = document.querySelector('#groupId').value
  const data = { groupId }
  const show_alert = document.getElementById('show-alert-chats')
  self.remove()
  if(submitButton.hasAttribute("disabled")){
    submitButton.removeAttribute("disabled");
  }

  $.ajax({
    url: `${baseURL}/groups/joinGroup`,
    method: 'POST',
    data: JSON.stringify(data),
    contentType: 'application/json',
    success: function (response) {
      var symbol, color
      if (response.status === "success") {
        symbol = "check-circle-fill"
        color = "success"
      } else {
        symbol = "exclamation-triangle-fill"
        color = "danger"
      }
      show_alert.innerHTML = `<div class="alert alert-${color} d-flex align-items-center" role="alert">
        <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlink:href="#${symbol}"/></svg>
        <div>
         ${response.message}
        </div>
      </div>`
    },
    error: function (error) {
      alert("Sorry some error occured please try again later")
    }
  })
  setTimeout(() => { show_alert.innerHTML = "" }, 5000);
}


form.sendMsg = async function (event) {
  event.preventDefault();

  if (event.submitter.getAttribute("disabled")) {
    // Trigger your event here
    console.log("Submit button is disabled");
    // Prevent form submission
    event.preventDefault();
  }

  var formData = new FormData(this);
  var userId = document.querySelector('#userId').value
  var username = document.querySelector('#userName').value
  var groupId = document.querySelector('#groupId').value
  var ownerId = document.querySelector('#ownerId').value
  var ownerName = document.querySelector('#ownerId').getAttribute('owner-name')

  formData.append("_id", userId)
  formData.append("username", username)
  formData.append("groupId", groupId)
  formData.append("ownerId", ownerId)
  formData.append("ownerName", ownerName)
  const public_file_Id = new Date().getTime() + "_" + Math.floor(Math.random() * 10000);


  const fileInput = document.querySelector('#file-input')
  const file = fileInput.files[0];
  var base64String = ""
  if (file !== undefined) {

    const reader = new FileReader();
    reader.readAsBinaryString(file);
    base64String = await new Promise((resolve) => {
      reader.addEventListener('load', () => {
        resolve(btoa(reader.result));
      });
    });

    formData.append('public_file_Id', public_file_Id)
    formData.append('base64String', base64String)
    formData.append('fileType', file.type)
  }
  const formValues = Object.fromEntries(formData.entries());


  event.target.elements.msg.value = '';
  if (file === undefined) {
    var forUser = {
      message: formValues.message,
      username: "You",
      imgUrl: ""
    }
    outputMessage(forUser)
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
  socket.emit('chat-message', formValues);


  // for storing it in database

  $.ajax({
    url: `${baseURL}/saveMessage`,
    method: 'POST',
    data: JSON.stringify(formValues),
    contentType: 'application/json',
    success: function (response) {
      if (response.url !== "") {
        forUser = {
          message: formValues.message,
          username: "You",
          imgUrl: response.url
        }
        outputMessage(forUser)
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
      console.log(response.status)
    },
    error: function (error) {
      alert("Sorry some error occured please try again later")
    }
  })

}


function outputMessage(message) {
  const div = document.createElement('div');
  // div.classList.add('message-sender');
  var html = ""
  var chatColor = ""
  // if (message.username === "You") {
  //   chatColor = "-sender"
  // }
  message.username === "You" ? chatColor = "-sender" : null
  html += `<div class="message${chatColor}">
  <p class="meta"><strong>${message.username}</strong> <span>Just now</span></p>
    <p class="text">
        ${message.message}
    </p>`;
  if (message.imgUrl !== "")
    html += `<p><img src=${message.imgUrl} onclick="openImage('${message.imgUrl}')"  alt="Please reload if u are not seeing the image"></p>`;
  html += `</div>`
  div.innerHTML = html
  document.querySelector('.chat-messages').appendChild(div);

}
function openImage(imageUrl) {
  window.open(imageUrl, '_blank');
}