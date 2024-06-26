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

function scrollToBottom() {
    chatLogElement.scrollTop = chatLogElement.scrollHeight
}


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

function onChatMessage(data) {
    console.log('onChatMessage', data)

    if (data.type === 'chat_message') {
        let tmpInfo = document.querySelector('.tmp-info')

        if (tmpInfo) {
            tmpInfo.remove()
        }
        if (data.agent) {
            chatLogElement.innerHTML += `
                <div class="flex w-full mt-2 space-x-3 max-w-md">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-slate-500 text-center pt-2">${data.initials}</div>

                    <div>
                        <div class="bg-slate-400 p-3 rounded-r-lg rounded-tl-lg">
                            <p class="text-sm">${data.message}</p>
                        </div>
                    </div>
                </div>
            `
        } else {
            chatLogElement.innerHTML += `
                <div class="flex w-full mt-2 space-x-3 max-w-md ml-auto justify-end">
                    <div>
                        <div class="bg-amber-400 p-3 rounded-l-lg rounded-tr-lg">
                            <p class="text-sm">${data.message}</p>
                        </div>
                    </div>

                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-amber-500 text-center pt-2">${data.initials}</div>
                </div>
            `
        }
    } else if (data.type == 'users_update') {
        chatLogElement.innerHTML += '<p class="mt-2">The admin/agent has joined the chat!'
    } else if (data.type == 'writing_active') {
        if (data.agent) {
            let tmpInfo = document.querySelector('.tmp-info')

            if (tmpInfo) {
                tmpInfo.remove()
            }

            chatLogElement.innerHTML += `
                <div class="tmp-info flex w-full mt-2 space-x-3 max-w-md">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-slate-500 text-center pt-2">${data.initials}</div>

                    <div>
                        <div class="bg-slate-300 p-3 rounded-l-lg rounded-br-lg">
                            <p class="text-sm">The agent/admin is writing a message</p>
                        </div>
                    </div>
                </div>
            `
        }
    } 
    scrollToBottom()
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

    chatSocket = new WebSocket(`ws://${window.location.host}/ws/${chatUuid}/`)


    chatSocket.onmessage = function(e) {
        console.log('onMessage')
        
        onChatMessage(JSON.parse(e.data))
    }


    chatSocket.onopen = function(e) {
        console.log('onOpen - chat socket opened')

        scrollToBottom()
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
}

chatInputElement.onkeyup = function(e) {
    if (e.keyCode === 13) {
        sendMessage()
    }
}

chatInputElement.onfocus = function(e) {
    chatSocket.send(JSON.stringify({
        'type': 'update',
        'message': 'writing_active',
        'name': chatName,
    }));
}
