/**
 * Variables
 */

let chatName = ''
let chatSocket = null
let chatWindowUrl = window.location.href
let chatUuid = Math.random().toString(36).slice(2, 12)

console.log('chatUuid', chatUuid)

/**
 * Elements
 */

const chatElement = document.querySelector('#chat')
const chatOpenElement = document.querySelector('#chat_open')
const chatJoinElement = document.querySelector('#chat_join')
const chatIconElement = document.querySelector('#chat_icon')
const chatWelcomeElement = document.querySelector('#chat_welcome')
const chatRoomElement = document.querySelector('#chat_room')
const chatNameElement = document.querySelector('#chat_name')
const chatLogElement = document.querySelector('#chat_log')
const chatInputElement = document.querySelector('#chat_message_input')
const chatSendElement = document.querySelector('#chat_message_send')

/**
 * Functions
*/

function getCookie(name) {
    var cookieValue = null

    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';')

        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim()

            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
                break
            }
        }
    }

    return cookieValue
}

function sendMessage() {
    chatSocket.send(JSON.stringify({
        'type': 'message',
        'message': chatInputElement.value,
        'name': chatName
    }))

    chatInputElement.value = ''
    
}

async function joinChatRoom() {
    console.log('joinChatRoom')

    chatName = chatNameElement.value

    console.log('Joining chat room as', chatName)
    console.log('Room uuid', chatUuid)

    const data = new FormData()
    data.append('name', chatName)
    data.append('url', chatWindowUrl)

    await fetch(`api/create-room/${chatUuid}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: data
    })
    .then(function(response) {
        return response.json()
    })
    .then(function(data) {
        console.log('data', data)
    })

    chatSocket = new WebSocket(`ws://localhost:8080/ws/chat/${chatUuid}/`);

    chatSocket.onmessage = function(e) {
        console.log('onMessage')
        // Handle incoming messages from the server
    }

    chatSocket.onopen = function(e) {
        console.log('onOpen - chat socket opened')
    }

    chatSocket.onclose = function(e) {
        console.log('onClose - chat socket closed')
    }
}


/**
 * Event Listener
 */

chatOpenElement.onclick = function(e) {
    e.preventDefault()

    chatIconElement.classList.add('hidden')
    chatWelcomeElement.classList.remove('hidden')

    return false
}

chatJoinElement.onclick = function(e) {
    e.preventDefault()

    chatWelcomeElement.classList.add('hidden')
    chatRoomElement.classList.remove('hidden')

    joinChatRoom()

    return false
}

chatSendElement.onclick = function(e) {
    e.preventDefault()

    sendMessage()

    return false
};