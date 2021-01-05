// ==UserScript==
// @name         Multiplayer Piano ADD-ON
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds new features to MPP including add friends, do not show again, Direct Messaging etc.
// @author       MajorH (Thanks anonygold)
// @match        https://www.multiplayerpiano.com/*
// @grant        none
// ==/UserScript==



// -- //
// DECLORATIONS //
let newsetup;
let cookies;
let friends = [];
let bgr = []
let savname = [];
let friendsWindow = 'friendsWindow';
let messengerWindow = 'messengerWindow';
let friendsButton = 'friendsButton';
let verifyUserPrompt = 'verifyUserPrompt';
let cancelButton = 'cancelButton';
let cookieFriendLocation;
let addFriend = 'addFriend';
let connectingText
let userVerifyCode
let messagingInfo;
let cookiesFound = false;
let WEBSOCKETLOCATION = 'wss://mppchatclient.info:8080/';
let clickable = true
let iloc;
let jloc;
let gBS;
let messengerSetup = false;
let socketConnection = 'socketConnection';
let ownid
let ws
let stopDots
let counter = 1
let msgWindowOpen = false;

let owncolor
setTimeout(function(){
owncolor=document.getElementsByClassName('name me')[0].style.backgroundColor
console.log(owncolor)
}, 1000)

let deleteCookie = 'Thu, 01 Jan 1970 00:00:01 GMT,';
let keepCookie = 'Thu, 01 Jan 2030 00:00:01 GMT,'
let nameDiv = [];
// -- //

// -- //
// SETS UP COOKIE ARRAY
function updateFriendArray() {
	cookies = document.cookie.split(';').map((cookie => {
		const [key, ...v] = cookie.split('=');
		return [key, v.join('=')];
	}))
	console.log('Cookies array set-up!')
}
updateFriendArray()
// -- //

// -- //
// HANDLES ADDING PLAYER ID TO COOKIES AND TO LOCAL ARRAY
function addNewFriend(playerid, p) {
	for (let i = 0; i < friends.length; i++) {
		if (friends[i] === playerid) {
			console.log('Friend, ' + playerid + ' already Added!')
			return;
		}
	}
	// PLAYER ID DOES NOT MATCH ANY EXISTING IDS THEN PUSH TO FRIEND ARRAY
	console.log('Adding friend!' + playerid)
	friends.push(playerid)
	savname.push(playerid)
	savname.push(p.name)
	document.cookie = (`*${playerid}=${playerid}; expires=${keepCookie}`)
	document.cookie = (`!${playerid}=${p.nameDiv.style.backgroundColor}; expires=${keepCookie}`)
	document.cookie = (`#${playerid}=${p.name}; expires=${keepCookie}`)
	// PUSHES NAME DIV INTO ARRAY FOR FRIEND WINDOW
	nameDiv.push(playerid)
	nameDiv.push(p.nameDiv)
	addToPanel(playerid, p)
}
// -- //

// -- //
// DELETES PLAYER ID FROM COOKIES AND LOCAL ARRAY
function removeFriend(playerid, p) {
	for (let i = 0; i < friends.length; i++) {
		if (friends[i] === playerid) {
			friends.splice(i, 1)
			document.cookie = (`!${playerid}=${p.nameDiv.style.backgroundColor}; expires=${deleteCookie}`)
			document.cookie = (`*${playerid}=${playerid}; expires=${deleteCookie}`)
			document.cookie = (`#${playerid}=${p.name}; expires=${deleteCookie}`)
			console.log('Friend Removed!')
			removeFromPanel(playerid)
			for (let j = 0; j < nameDiv.length; j++) {
				if (nameDiv[j] === playerid) {
					nameDiv.splice(j + 1, 1)
					nameDiv.splice(j, 1)
				}
			}
		}
	}
}
// -- //
// DEFINES P FOR LATER USE
let PT
// -- //

// -- //
// OBJECTF IS FRIEND STATUS:
let objectf = document.createElement('div');
// -- //

// -- //
// PREVENTS BUTTON FROM ADDING ID TOO MANY TIMES
let selectedFriend = '';
// -- //

// -- //
// SETS INNER HTML BUTTON TEXT AND PLAYER TEXT COLOR
function checkFriendHTML(playerid, p) {
	p.nameDiv.thatid = playerid
	for (let i = 0; i < friends.length; i++) {
		if (friends[i] === playerid && typeof p.cursorDiv === 'object') {
			const cursor = p.cursorDiv.childNodes;
			p.cursorDiv.thatid = playerid
			cursor[0].innerHTML = `${p.name} (Friend)`
			objectf.innerHTML = 'Remove Friend'
			cursor[0].setAttribute("style", "color: lime;")
			let nameColor = p.nameDiv.style.backgroundColor.toString()
			cursor[0].style.backgroundColor = nameColor
			p.nameDiv.innerHTML = `${p.name} (Friend)`
			p.nameDiv.style.color = 'lime'
			return
		}
	}
	if (typeof p.cursorDiv === 'object') {
		const cursornorm = p.cursorDiv.childNodes;
		p.cursorDiv.thatid = playerid
		cursornorm[0].innerHTML = `${p.name}`
		p.nameDiv.innerHTML = `${p.name}`
		objectf.innerHTML = 'Add Friend'
		cursornorm[0].setAttribute("style", "color: white;")
		let nameColor = p.nameDiv.style.backgroundColor.toString()
		cursornorm[0].style.backgroundColor = nameColor
		p.nameDiv.style.color = 'white'
	}
}
// -- //

// -- //
// ADD FRIEND MENU ITEM:
MPP.client.on('participant added', (p) => {
	ownid = (MPP.client.getOwnParticipant()._id)
	checkFriendHTML(p._id, p)
	setTimeout(() => {
		p.nameDiv.addEventListener('mousedown', () => {
			PT = p
			selectedFriend = p._id;
			setTimeout(() => {
				objectf.className = 'menu-item'
				checkFriendHTML(p._id, p)
				if (p === 'undefined') { } // PREVENTS CONSOLE ERROR IF PLAYER LEAVES ROOM
				document.getElementsByClassName('participant-menu')[0].appendChild(objectf);
			}, 24);
		});
	}, 24)
});
// -- //

// -- //
// LISTENS FOR CLICK ADD FRIEND
objectf.addEventListener('click', () => {
	if (objectf.innerHTML === 'Add Friend') {
		console.log('Add friend Button Clicked!')
		addNewFriend(selectedFriend, PT)
		checkFriendHTML(selectedFriend, PT)
	} else if (objectf.innerHTML === 'Remove Friend') {
		console.log('Removing Friend!')
		removeFriend(selectedFriend, PT)
		checkFriendHTML(selectedFriend, PT)
	}
}, 24);
// -- //



// -- //
// LOOKS FOR PREVIOUS COOKIES BY SEARCHING FOR PREFIX: '*'
for (let k = 0; k < cookies.length; k++) {
	if (cookies[k][0].includes('*')) {
		console.log('Cookies data for friends found!')
		cookiesFound = true
		newsetup = false
		break
	}
}
if (cookiesFound == false) {
	console.log('No Saved friends.')
}
// -- //

// -- //
// RESTORES SAVED FRIEND ID'S TO LOCAL ARRAY
if (newsetup === false) {
	for (let i = 0; i < cookies.length; i++) {
		if (cookies[i][0].includes('*')) {
			console.log('Adding friend to freinds array!')
			friends.push(cookies[i][0].substr(2, 24))
		};
	}
}
// -- //
// RESTORES SAVED FRIEND COLOR'S TO LOCAL ARRAY
if (newsetup === false) {
	for (let i = 0; i < cookies.length; i++) {
		if (cookies[i][0].includes('!')) {
			console.log('Adding friend color to freinds array!')
			bgr.push(cookies[i][0])
			bgr.push(cookies[i][0 + 1])
		};
	}
}
// -- //

// -- //
// RESTORES SAVED FRIEND NAME
if (newsetup === false) {
	for (let i = 0; i < cookies.length; i++) {
		if (cookies[i][0].includes('#')) {
			console.log('Adding friend name to freinds array!')
			savname.push(cookies[i][0])
			savname.push(cookies[i][0 + 1])
		};
	}
}
// -- //

// -- //
// BUTTON COLOR CHANGE FUNCTION:
function cBC(object) {
	if (object.className === 'ugly-button') {
		object.className = 'ugly-button translate stuck';
		gBS = true
	} else {
		object.className = 'ugly-button';
		gBS = false
	};
};
// -- //

// -- //
// PERFORM BUTTON ACTION:
function buttonClicked(object, num) {
	if (num === 1) { //HIDES OR SHOWS FRIENDS WINDOW
		if (msgWindowOpen === false) {
			cBC(object)
			if (document.getElementById('friendsWindow-window').style.visibility == "visible") {
				// CHECKS BUTTON STATUS TO UPDATE IF INCORRECT:
				if (gBS === true) {
					object.className = 'ugly-button'
				}
				document.getElementById('friendsWindow-window').style.visibility = "hidden";
			} else {
				if (gBS === false) {
					object.className = 'ugly-button translate stuck'
				}
				document.getElementById('friendsWindow-window').style.visibility = "visible";
			}
		}
	}
	if (num === 2) {
		window.setInterval(function () {
			if (object.innerHTML.length > 12) {
				if (stopDots === true) {
					stopDots = false
					return
				}
				object.innerHTML = "Connecting";
			} else {
				if (stopDots === true) {
					stopDots = false
					return
				}
				object.innerHTML += ".";
			}
		}, 500)
	}
};
// -- //


// -- //
// CAN USE THIS FUNCTION TO HIDE OR SHOW OBJECTS
function showObject(visibility, object) {
	document.getElementsByClassName('relative')[visibility].appendChild(object);
}
// -- //

// -- //
// UNIVERSAL CREATE DIALOG WINDOW:
function cDW(object, l, t, h, inner, scroll, visibility) {
	if (typeof visibility !== 'number') {
		visibility = 0
	}
	let name = object
	object = document.createElement('div')
	object.id = (name + "-window");
	object.className = "dialog";
	object.style = `${scroll}`;
	object.style.position = 'absolute';
	object.style.display = 'block';
	object.style.height = (h + 'px');
	object.style.marginLeft = (l + 'px');
	object.style.marginTop = (t + 'px');
	object.innerHTML = inner;
	document.getElementsByClassName('relative')[visibility].appendChild(object);
};
// -- //

// -- //
// UNIVERSAL CREATE BUTTONS:
function cB(object, l, t, i, visibility, num, loc) {
	if (typeof visibility !== 'number') {
		visibility = 0
	};
	let name = object
	object = document.createElement('div');
	object.id = (name + "-btn");
	object.className = 'ugly-button';
	object.style.position = 'absolute';
	object.style.left = (l + 'px');
	object.style.top = (t + 'px');
	object.innerHTML = i;
	object.onclick = () => {
		if (num === 2) {
			object.innerHTML = 'Connecting'
		}
		buttonClicked(object, num);
	};
	document.getElementsByClassName('relative')[visibility].appendChild(object);
};
// -- //


// DO NOT CHANGE, THIS PREVENTS USER FROM SPAMMING SERVER WITH WEBSOCKET CONNECTION REQUESTS.
function clickBuffer() {
	clickable = false
	setTimeout(function () {
		clickable = true
	}, 30000);
}

//
function informUser() {
	if (authenticationStatus === undefined || authenticationStatus === null) {
		stopDots = true
		connectingText.style.color = 'red';
		connectingText.innerHTML = "AUTHENTICATION FAILED. REASON: TIMEOUT";
		cancelButton.style.color = 'red';
		cancelButton.innerHTML = 'Failure!';
	}
	if (authenticationStatus === true) {
		stopDots = true
		connectingText.style.color = 'lime';
		connectingText.innerHTML = "AUTHENTICATION SUCCESS. IP TIED TO ID.";
		cancelButton.style.color = 'lime';
		cancelButton.innerHTML = 'Success!';
	}
	if (authenticationStatus === false) {
		stopDots = true
		connectingText.style.color = 'red';
		connectingText.innerHTML = "AUTHENTICATION FAILED. REASON: AUTHORIZATION CODE ERROR.";
		cancelButton.style.color = 'red';
		cancelButton.innerHTML = 'Failure!';
	}
}
//

//
// UPDATES PLAYER INFO ON SERVER SIDE:
function updatePlayerInfo() {

	// if (ws=== undefined || ws.readyState === WebSocket.CLOSED) {
	// 	console.log('opening new socket2')
	// 	ws = new WebSocket(`${WEBSOCKETLOCATION}`);
	// } else if (ws.readyState === WebSocket.OPEN) {
	// 	console.log('WEBSOCKET ALREADY OPEN')
	// }
	// ws.onopen = function () {
	// 	ws.onmessage = function (e) {

	// }
}
//

//
let msgs = [];
// CREATE MESSAGE POP UPS ON SCREEN
function createMessageOnScreen(id, msg, verify, color) {
	let msngerWindow = document.getElementById('messengerWindow-window')
	console.log(msngerWindow)
	if (msngerWindow === null) {
		console.log('storing message temporarily')
		msg.push(id)
		msg.push(msg)
		msg.push(verify)
	} else {
		v = document.createElement('div')
		document.getElementById('messengerWindow-window').appendChild(v)
		v.style = `background-color: ${owncolor};color: white;display: block;font-size: 12px;padding-bottom: 10px;padding-left: 10px;padding-right: 10px;`
		v.innerText = msg
		v.id = `msg_${id}`
	}
}
//



// ALLOWS SENDING MESSAGE THROUGH WEBSOCKET:
//
let verifyRoom
let verifyCode
let authenticationStatus
function sendMessage(param, msg, playerid) {
	if (param === 'check timeout') {
		if (clickable === false) {
			console.log('DO NOT SPAM WEBSOCKET WITH REQUESTS.')
			return
		}
		clickBuffer()

		if (ws === undefined || ws.readyState === WebSocket.CLOSED) {
			console.log('OPENING WEBSOCKET')
			ws = new WebSocket(`${WEBSOCKETLOCATION}`);
		} else if (ws.readyState === WebSocket.OPEN) {
			console.log('WEBSOCKET ALREADY OPEN')
		}

		let responseReceived = false

		console.log('Check Timeout(player data collection) scenario initiated.')
		ws.onopen = function () {
			console.log('WebSocket Client Connected');
			ws.send(`uDATAid-${ownid}`);
			console.log('ID SENT')
			ws.onmessage = function (e) {
				responseReceived = true
				let ownName
				let nameloc = document.getElementsByClassName('name me')
				let ownerloc = document.getElementsByClassName('name me owner')
				if (nameloc !== undefined && nameloc !== null) { ownName = nameloc[0].innerText } else { ownName = ownerloc[0].innerText }
				let friendsloc = (friends.join('*'))
				friendsloc = `*${friendsloc}`
				if (e.data === 'ID SAVED') {
					console.log('ID SAVED, SENDING NAME')
					ws.send(`uDATAname-${ownName}`)
				}
				if (e.data === 'NAME AND IP SAVED') {
					console.log('NAME SAVED, SENDING FRIENDS')
					ws.send(`uDATAfriends-${friendsloc}`)
				}
				if (e.data === 'FRIENDS SAVED') {
					console.log('FRIENDS SAVED')
					ws.send(`uDATAcolor-${owncolor}`)
				}

				if (e.data.startsWith('AUTHENTICATION REQUEST')) {
					ws.send(`mSETUP-${ownid}`);
					setTimeout(function () {
						if (authenticationStatus == undefined || authenticationStatus == null) {
							console.log('TIMEOUT')
							document.cookie = (`&verificationStatus=false; expires=${keepCookie}`)
							timeout()
							client.stop();
						}
					}, 30000);
				}
				if (e.data.startsWith('*')) {
					verifyCode = e.data
					console.log(verifyCode)
					console.log('received the verify code')
				}
				if (e.data.startsWith('!')) {
					console.log('received the verify room')
					verifyRoom = e.data.substr(1, 26)
					console.log(verifyRoom)
					setTimeout(function () {
						var client = new Client('wss://www.multiplayerpiano.com:443');
						client.start();
						client.setChannel(verifyRoom);
						client.on('ch', () => {
							console.log('SENDING CODE')
							client.sendArray([{ m: 'a', message: `${verifyCode}` }]);
							client.on('a', msg => {
								if (msg.a.toString().toLowerCase().startsWith('user authenticated.')) {
									console.log('AUTHENTICATION SUCCESS')
									authenticationStatus = true
									document.cookie = (`&verificationStatus=true; expires=${keepCookie}`)
									verificationConfirmed()
									client.stop();
								}
								if (msg.a.toString().toLowerCase().startsWith('could not authenticate.')) {
									console.log('AUTHENTICATION FAILURE')
									authenticationStatus = false
									document.cookie = (`&verificationStatus=false; expires=${keepCookie}`)
									verificationFailed()
									client.stop();
								}
							});
						});
					}, 1000);
				}
				if (e.data.startsWith('IDENTITY VERIFIED')) {
					authenticationStatus = true
					alreadyVerified()
					console.log('Identity already verified')
					document.cookie = (`&verificationStatus=true; expires=${keepCookie}`)
				}
				console.log(e.data)
			}
		}
		setTimeout(function () {
			if (responseReceived == false) {
				console.log('TIMEOUT')
				timeout()
			}
		}, 30000);
	}
	if (param === 'send message') {
		if (ws === undefined || ws.readyState === WebSocket.CLOSED) {
			console.log('OPENING WEBSOCKET')
			ws = new WebSocket(`${WEBSOCKETLOCATION}`);
			ws.onopen = function () {
				ws.send(`%${msg}, ${playerid}, ${ownid}`)
				ws.onmessage = function (e) {
					console.log(e.data, 'This is the second one')
					if (e.data.startsWith('@')) {
						let data = e.data.split(',')
						msg = data[0].toString()
						msg = msg.split('%')
						msg = msg[1]
						playerTid = data[1]
						playerTverify = data[2]
						playerTcolor = data[3]
						createMessageOnScreen(playerTid, msg, playerTverify, playerTcolor)
					}
				}
			}
		} else if (ws.readyState === WebSocket.OPEN) {
			console.log('WEBSOCKET ALREADY OPEN')
				ws.send(`%${msg}, ${playerid}, ${ownid}`)
				ws.onmessage = function (e) {
					console.log(e.data)
					if (e.data.startsWith('@')) {
						let data = e.data.split(',')
						msg = data[0].toString()
						msg = msg.split('%')
						msg = msg[1]
						playerTid = data[1]
						playerTverify = data[2]
						playerTcolor = data[3]
						createMessageOnScreen(playerTid, msg, playerTverify, playerTcolor)
					}
				}
		}else{
			console.log('somehow. its else. here:', ws.readyState)
		}
	}
};
//

// -- //
let tempname
let tempcolor
// ADDS CLICK TO FRIEND PANEL
function addClick(object, playerid, p) {
	object.addEventListener('click', () => {
		if (object.children[0] === undefined) {
			let button1 = document.createElement("div")
			button1.className = 'ugly-button';
			button1.id = `${playerid}_btn1`
			button1.style = "margin-top: 10px;top: 61px;left: 20px;z-index: 10;"
			button1.innerHTML = 'Message';
			document.getElementById(playerid).appendChild(button1);
			button1.addEventListener('click', () => {
				if (document.getElementById('verifyUserPrompt-window') === null) {
					if (document.cookie.includes('&verificationStatus=true') === false) {
						sendMessage('check timeout')

						cDW(verifyUserPrompt, '-215', '-693', '400', 'Verify your player ID', 'visibility: visible;overflow-wrap: anywhere')

						cancelButton = document.createElement('div');
						cancelButton.id = ("cancelButton-btn");
						cancelButton.className = 'ugly-button';
						cancelButton.style.position = 'absolute';
						cancelButton.style.left = ('147px');
						cancelButton.style.top = ('372px');
						cancelButton.innerHTML = 'Cancel';


						messagingInfo = document.createElement('div');
						messagingInfo.id = ('messagingInfo');
						messagingInfo.style.position = 'absolute';
						messagingInfo.style.left = ('8px');
						messagingInfo.style.fontSize = ('large');
						messagingInfo.style.top = ('61px');
						messagingInfo.innerHTML = 'In order to enable direct messaging in MPP you must connect to an external socket. For security reasons you must verify your id. This is a one time process and will permanently assign your IP address to your ID to ensure that messages sent by your ID is actually you. Please wait for the script to connect to websocket.';

						connectingText = document.createElement('div');
						connectingText.id = ('connectingText');
						connectingText.style.position = 'absolute';
						connectingText.style.left = ('28px');
						connectingText.style.fontSize = ('large');
						connectingText.style.top = ('247px');
						connectingText.innerHTML = `Please wait, connecting to websocket`
						document.getElementById('verifyUserPrompt-window').appendChild(cancelButton);
						document.getElementById('verifyUserPrompt-window').appendChild(messagingInfo);
						document.getElementById('verifyUserPrompt-window').appendChild(connectingText);
						var dots = window.setInterval(function () {
							if (connectingText.innerHTML.length > 39) {
								if (stopDots === true) { return }
								connectingText.innerHTML = "Please wait, connecting to websocket";
							} else {
								if (stopDots === true) { return }
								connectingText.innerHTML += ".";
							}
						}, 100);

						cancelButton.onclick = () => {
							document.getElementById('verifyUserPrompt-window').remove()
						};
					} else {
						console.log('Opening messenger window')
						msgWindowOpen = true
						document.getElementById('friendsWindow-window').style.visibility = 'hidden';
						cDW(messengerWindow, '500', '-400', '400', tempname, 'overflow: hidden scroll; visibility: visible;font-size: 20px;');
						document.getElementById('messengerWindow-window').style.color = tempcolor;

						let xbutton = document.createElement("a")
						document.getElementById('messengerWindow-window').appendChild(xbutton);
						xbutton.className = 'x';
						xbutton.innerText = 'Ⓧ';
						xbutton.style = 'color: red;top: 10px;left: 373px;position: absolute;';
						xbutton.onclick = () => {
							console.log('Close')
						};


						let inputBox = document.createElement("input")
						document.getElementById('messengerWindow-window').appendChild(inputBox);
						inputBox.type = 'text';
						inputBox.name = 'name';
						inputBox.placeholder = 'Send a message';
						inputBox.maxlength = '255';
						inputBox.class = 'translate';
						inputBox.id = 'msgInput'
						inputBox.style = 'position: absolute;top: 390px;left: 0px;width: 274px;';
						let msgopen = false
						document.onmousedown = (evt) => {
							console.log(evt.target === inputBox)
							if (evt.target === inputBox) {
								msgopen = true
								$("#chat input").focus();
								document.getElementById('chat').className = 'inputtingText';
							} else {
								msgopen = false
								document.getElementById('chat').className = 'chat chatting';
								document.getElementById('chat').className = 'chat';
								document.getElementById('piano').childNodes[0].click()
							}
						}
						// inputBox.onfocusout = () => {
						// 	if(evt.target===inputBox){
						// 	$("#chat input").focus();
						// 	document.getElementById('chat').className = '';
						// 	console.log('left chat box')
						// }else{
						// 	$("#rename .text[name=name]").keypress()
						// }
						// }

						let sendButton = document.createElement("div")
						document.getElementById('messengerWindow-window').appendChild(sendButton);
						sendButton.className = 'ugly-button';
						sendButton.innerText = 'Send';
						sendButton.style = 'display: block;position: absolute;visibility: visible;top: 388px;left: 287px;color: white;';
						sendButton.onclick = () => {
							console.log('Send')
							sendMessage('send message', inputBox.value, playerid, owncolor)
							createMessageOnScreen(ownid, inputBox.value, 'true', owncolor)
						};


					}
				}
			}, 24)
			let button2 = document.createElement("div")
			button2.className = 'ugly-button';
			button2.id = `${playerid}_btn2`
			button2.style = "margin-top: 10px;top: 61px;left: 143px;z-index: 10;"
			button2.innerHTML = 'Remove Friend';
			document.getElementById(playerid).appendChild(button2);
			button2.addEventListener('click', () => {
				removeFromPanel(playerid)
				let bgcolor
				let name
				for (let i = 0; i < bgr.length; i++) {
					if (bgr[i].includes(playerid)) {
						bgcolor = bgr[i + 1]
					}
				}
				for (let j = 0; j < savname.length; j++) {
					if (savname[j].includes(playerid)) {
						name = savname[j + 1]
					}
				}
				document.cookie = (`!${playerid}=${bgcolor}; expires=${deleteCookie}`)
				document.cookie = (`*${playerid}=${playerid}; expires=${deleteCookie}`)
				document.cookie = (`#${playerid}=${name}; expires=${deleteCookie}`)
				for (let i = 0; i < friends.length; i++) {
					if (friends[i] === playerid) {
						friends.splice(i, 1)
					}
				}
				let playersinroom = document.getElementById('names').children
				let t
				for (let g = 0; g < playersinroom.length; g++) {
					if (playersinroom[g].thatid === playerid) {
						t = playersinroom[g]
						t.innerHTML = name
						t.style.color = 'white'
					}
				}
				let cursorsinroom = document.getElementById('cursors').children
				for (let g = 0; g < cursorsinroom.length; g++) {
					if (cursorsinroom[g].thatid === playerid) {
						let p = cursorsinroom[g]
						p.children[0].innerText = name
						p.children[0].setAttribute("style", "color: white;")
						let nameColor = t.style.backgroundColor.toString()
						p.children[0].style.backgroundColor = nameColor
					}
				}
				console.log('Player Removed')
			}, 24)
		} else {
			menuOpen = false
			tempname = document.getElementById(`${playerid}_btn1`).parentNode.innerHTML
			tempname = tempname.split('<')
			tempname = tempname[0]
			tempcolor = document.getElementById(`${playerid}_btn1`).parentNode.style.backgroundColor
			document.getElementById(`${playerid}_btn1`).remove()
			document.getElementById(`${playerid}_btn2`).remove()
		}
	}, 24)

}
// -- //


function timeout() {
	if (authenticationStatus === undefined || authenticationStatus === null) {
		stopDots = true
		connectingText.style.color = 'red';
		connectingText.innerHTML = "AUTHENTICATION FAILED. REASON: TIMEOUT";
		cancelButton.style.color = 'red';
		cancelButton.innerHTML = 'Failure!';
		return
	}
}

function alreadyVerified() {
	stopDots = true
	connectingText.style.color = 'lime';
	connectingText.innerHTML = "YOU HAVE ALREADY BEEN VERIFIED.";
	cancelButton.style.color = 'lime';
	cancelButton.innerHTML = 'Success!';
}

function verificationConfirmed() {
	if (authenticationStatus === true) {
		stopDots = true
		connectingText.style.color = 'lime';
		connectingText.innerHTML = "AUTHENTICATION SUCCESS. IP TIED TO ID.";
		cancelButton.style.color = 'lime';
		cancelButton.innerHTML = 'Success!';
		counter = counter++
		return
	}
}

function verificationFailed() {
	if (authenticationStatus === false) {
		stopDots = true
		connectingText.style.color = 'red';
		connectingText.innerHTML = "AUTHENTICATION FAILED. REASON: AUTHORIZATION CODE ERROR.";
		cancelButton.style.color = 'red';
		cancelButton.innerHTML = 'Failure!';
		return
	}
}







// -- //
// ADDS FRIENDS TO FREINDS PANEL
function addToPanel(playerid, p) {
	if (nameDiv.includes(playerid)) {
		let checkfriend = (document.getElementById(playerid))
		if (checkfriend === null) {
			let index = nameDiv.indexOf(playerid)
			let friend = document.createElement("a")
			let bgcolor = nameDiv[index + 1].style.backgroundColor
			friend.innerHTML = nameDiv[index + 1].innerHTML
			friend.id = playerid
			friend.p = p
			friend.setAttribute("style", `background-color: ${bgcolor};color: white;display: block;font-size: 12px;padding-bottom: 10px;padding-left: 10px;padding-right: 10px; `)
			document.getElementById('friendsWindow-window').appendChild(friend);
			addClick(friend, playerid, friend.p)
		}
	}
}
// -- //
// LOADS FRIENDS TO PANEL
function loadToPanel() {
	for (let k = 0; k < friends.length; k++) {
		let playerid = friends[k]
		let checkfriend = (document.getElementById(playerid))
		if (checkfriend === null) {
			let bgrcolor
			let name
			for (let i = 0; i < bgr.length; i++) {
				if (bgr[i].includes(playerid)) {
					bgrcolor = bgr[i + 1]
				}
			}
			for (let j = 0; j < savname.length; j++) {
				if (savname[j].includes(playerid)) {
					name = savname[j + 1]
				}
			}
			let friend = document.createElement("a")
			friend.innerHTML = name
			friend.id = playerid
			friend.setAttribute("style", `background-color: ${bgrcolor};color: white;display: block;font-size: 12px;padding-bottom: 10px;padding-left: 10px;padding-right: 10px;`)
			document.getElementById('friendsWindow-window').appendChild(friend);
			addClick(friend, playerid)
		} else {
			console.log('Player Already in Window')
		}
	}
}
// -- //

// -- //
// REMOVES FRIENDS FROM FRIEND PANEL
function removeFromPanel(playerid) {
	// EXTRA PRECAUTION WHEN CHECKING NAME REMOVED:
	if (nameDiv.includes(playerid)) {
		let index = nameDiv.indexOf(playerid)
		nameDiv.splice(index, 1)
		nameDiv.splice(index + 1, 1)
	}
	let names = document.getElementById('friendsWindow-window').children
	for (let j = 0; j < names.length; j++) {
		if (names[j].id === playerid) {
			names[j].remove()
			return
		}
	}
}

// -- //

// -- //
// INITIALIZATION
(function () {
	// RESTARTS CLIENT TO UPDATE WEBAGE
	window.MPP.client[window.MPP.client.user == undefined ? 'start' : 'stop']();
	setTimeout(window.MPP.client['start'](), 1000)
	setTimeout(() => {
		loadToPanel()
	}, 1000);

	// window.setInterval(function(){
	// 	if (ws===undefined){
	// 		console.log('Not connected to websocket')
	// 	}else{
	// 		if (ws.readyState === WebSocket.CLOSED){
	// 			console.log('Not connected to websocket')
	// 			socketConnection.innerHTML = 'Disconnected!';
	// 			socketConnection.style.color = 'red';
	// 		}
	// 		if (ws.readyState === WebSocket.OPEN){
	// 			console.log('Connected to websocket.')
	// 			socketConnection.innerHTML = 'Connected!';
	// 			socketConnection.style.color = 'lime';
	// 		}
	// 	}
	// 	console.log('still wr')
	//  }, 3000)
	cDW(friendsWindow, '500', '-400', '400', 'Friends', 'overflow: hidden scroll; visibility: visible');
	cB(friendsButton, '660', '32', 'Friends', 0, 1);
	cB(socketConnection, '780', '32', 'Connect', 0, 2);
})();
// -- //
