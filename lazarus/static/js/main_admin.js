/**
 * Variables
 */

const chatRoom = document.querySelector('#room_uuid').textContent.replaceAll('"', '');

let chatSocket = null;


/**
 * Elements
 */


const chatLogElement = document.querySelector('#chat_log');
const chatInputElement = document.querySelector('#chat_message_input');
const chatSendElement = document.querySelector('#chat_message_send');


/**
 * Functions
 */


function scrollToBottom() {
    chatLogElement.scrollTop = chatLogElement.scrollHeight;
}


function sendMessage() {
    chatSocket.send(JSON.stringify({
        'type': 'message',
        'message': chatInputElement.value,
        'name': document.querySelector('#user_name').textContent.replaceAll('"', ''),
        'agent': document.querySelector('#user_id').textContent.replaceAll('"', ''),
    }));

    chatInputElement.value = '';
    
}


function onChatMessage(data) {
    console.log('onChatMessage', data);

    if (data.type === 'chat_message') {
        if (!data.agent) {
            chatLogElement.innerHTML += `
                <div class="flex w-full mt-2 space-x-3 max-w-md">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-amber-500 text-center pt-2">${data.initials}</div>

                    <div>
                        <div class="bg-amber-400 p-3 rounded-r-lg rounded-tl-lg">
                            <p class="text-sm">${data.message}</p>
                        </div>
                        
                        <span class="text-xs text-gray-500 leading-none">${data.created_at} ago</span>
                    </div>
                </div>
            `;
        } else {
            chatLogElement.innerHTML += `
                <div class="flex w-full mt-2 space-x-3 max-w-md ml-auto justify-end">
                    <div>
                        <div class="bg-slate-400 p-3 rounded-l-lg rounded-tr-lg">
                            <p class="text-sm">${data.message}</p>
                        </div>
                        
                        <span class="text-xs text-gray-500 leading-none">${data.created_at} ago</span>
                    </div>

                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-slate-500 text-center pt-2">${data.initials}</div>
                </div>
            `
        }
    } else if (data.type == 'writing_active') {
        if (!data.agent) {
            let tmpInfo = document.querySelector('.tmp-info')

            if (tmpInfo) {
                tmpInfo.remove()
            }

            chatLogElement.innerHTML += `
                <div class="tmp-info flex w-full mt-2 space-x-3 max-w-md">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-amber-500 text-center pt-2">${data.initials}</div>

                    <div>
                        <div class="bg-amber-400 p-3 rounded-l-lg rounded-br-lg">
                            <p class="text-sm">The client is typing...</p>
                        </div>
                    </div>
                </div>
            `
        }
    }


    scrollToBottom();
}


/**
 * Websocket
*/

chatSocket = new WebSocket(`ws://${window.location.host}/ws/${chatRoom}/`)

chatSocket.onmessage = function(e) {
    console.log('onMessage');
    
    onChatMessage(JSON.parse(e.data));
}

chatSocket.onopen = function(e) {
    console.log('Socket open');

    scrollToBottom();
}

chatSocket.onclose = function(e) {
    console.log('Socket closed unexpectedly');
}

/**
 * Event listeners
 */

chatSendElement.onclick = function(e) {
    e.preventDefault();

    sendMessage();

    return false;
}


chatInputElement.onkeyup = function(e) {
    if (e.keyCode == 13) {
        sendMessage();
    }
}


chatInputElement.onfocus = function(e) {
    chatSocket.send(JSON.stringify({
        'type': 'update',
        'message': 'writing_active',
        'name': document.querySelector('#user_name').textContent.replaceAll('"', ''),
        'agent': document.querySelector('#user_id').textContent.replaceAll('"', ''),
    }));
}
