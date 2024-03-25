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

document.addEventListener('DOMContentLoaded', (event) => {
    const chatElement = document.querySelector('#chat')
    const chatOpenElement = document.querySelector('#chat_open')
    const chatJoinElement = document.querySelector('#chat_join')
    const chatIconElement = document.querySelector('#chat_icon')
    const chatWelcomeElement = document.querySelector('#chat_welcome')
    const chatRoomElement = document.querySelector('#chat_room')
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

        return false
    }
});