
const roomName = JSON.parse(document.getElementById('room-name').textContent);

const chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/chat/'
    + roomName
    + '/'
);

chatSocket.onmessage = function (e) {
    const data = JSON.parse(e.data); // data.message contains the message

    console.log("=> data", data)

    switch (data.type) {

        case "new_message":

            let ul_tag = document.getElementById('chat-log')
            ul_tag.innerHTML += `
                    <div style="display:flex">
                        <div class="message-parent-css">
                            <svg 
                            class="discord-icon-css"
                            xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor"
                                class="bi bi-discord" viewBox="0 0 16 16">
                                <path
                                    d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z" />
                            </svg>
                        </div>
                        <div style="width: 95%;">
                            <div id="message-by-user" style="color:#5865f2;">
                                ${data.user_name}
                            </div>
                            <div id="message-content">
                                ${data.message}
                            </div>
                        </div>
                    </div>
                    <hr />
                    `

            // scroll to the last li tag of ul
            document.getElementById("chat-log").lastElementChild.scrollIntoView({ behavior: "smooth" });
            break;

        case "user_list":

            let online_users_span = document.getElementById('num-of-users')
            let ul_tag_online = document.getElementById('online-logs')
            let li_tag_online = document.createElement('li')

            // console.log("childrens =>", ul_tag_online.childNodes)

            // removing already existing users
            var childElements = document.getElementById('online-logs')

            var delChild = childElements.lastChild;

            while (delChild) {
                childElements.removeChild(delChild);
                delChild = childElements.lastChild;
            }

            for (let i = 0; i < data.users.length; i++) {
                let new_user = data.users[i]
                // li_tag_online.appendChild(document.createTextNode(new_user))
                // ul_tag_online.appendChild(li_tag_online)
                ul_tag_online.innerHTML += `
                <img class="discord-icon-css2" src="../../static/svgs/discord.svg" height="26px" width="26px" />                            
                        ${new_user}
                        <div style="margin-bottom:12px;"></div>
                        `
            }

            // online users count
            online_users_span.innerHTML = ''
            online_users_span.innerHTML += `(${data.users.length})`

            // scroll to the last li tag of ul
            document.getElementById("chat-log").lastElementChild.scrollIntoView({ behavior: "smooth" });

            break;

        case "forbidden_access":
            alert("Login required!")
            window.location.pathname = "/chat/"
            break;

        default:
            console.log("running default")
            return null
    }
};

chatSocket.onclose = function (e) {
    console.error('Chat socket closed unexpectedly, redirecting to chat page');
    // alert("permission denied!")
    // window.location.pathname = "/chat/"            
};

document.querySelector('#chat-message-input').focus();
document.querySelector('#chat-message-input').onkeyup = function (e) {
    if (e.keyCode === 13) {  // enter, return
        document.querySelector('#chat-message-submit').click();
    }
};

document.querySelector('#chat-message-submit').onclick = function (e) {
    const messageInputDom = document.querySelector('#chat-message-input');
    const message = messageInputDom.value;
    chatSocket.send(JSON.stringify({
        'message': message
    }));
    messageInputDom.value = '';
    document.querySelector('#chat-message-input').focus();
};