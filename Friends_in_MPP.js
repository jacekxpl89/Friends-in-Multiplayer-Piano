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
let friendsButton = 'friendsButton';
let cookieFriendLocation;
let addFriend = 'addFriend';
let cookiesFound = false;
let iloc;
let jloc;
let gBS;

let deleteCookie = 'Thu, 01 Jan 1970 00:00:01 GMT,';
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
	document.cookie = (`*${playerid}=${playerid}`)
	document.cookie = (`!${playerid}=${p.nameDiv.style.backgroundColor}`)
	document.cookie = (`#${playerid}=${p.name}`)
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
	p.nameDiv.thatid=playerid
	for (let i = 0; i < friends.length; i++) {
		if (friends[i] === playerid && typeof p.cursorDiv === 'object') {
			const cursor = p.cursorDiv.childNodes;
			p.cursorDiv.thatid=playerid
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
		p.cursorDiv.thatid=playerid
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
	switch (num) {
		case 1: //HIDES OR SHOWS FRIENDS WINDOW
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
	};
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
function cDW(object, l, t, h, visibility) {
	if (typeof visibility !== 'number') {
		visibility = 0
	}
	let name = object
	object = document.createElement('div')
	object.id = (name + "-window");
	object.className = "dialog";
	object.style = 'overflow: hidden scroll; visibility: visible;';
	object.style.position = 'absolute';
	object.style.display = 'block';
	object.style.height = (h + 'px');
	object.style.marginLeft = (l + 'px');
	object.style.marginTop = (t + 'px');
	object.innerHTML = 'Friends';
	document.getElementsByClassName('relative')[visibility].appendChild(object);
};
// -- //

// -- //
// UNIVERSAL CREATE BUTTONS:
function cB(object, l, t, i, visibility, num) {
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
		buttonClicked(object, num);
	};
	document.getElementsByClassName('relative')[visibility].appendChild(object);
};
// -- //

// -- //
// ADDS CLICK TO FRIEND PANEL
function addClick(object, playerid, p) {
	object.addEventListener('click', () => {
		console.log(object.children)
		if (object.children[0] === undefined) {
			let button1 = document.createElement("div")
			button1.className = 'ugly-button';
			button1.id = `${playerid}_btn1`
			button1.style = "margin-top: 10px;top: 61px;left: 20px;z-index: 10;"
			button1.innerHTML = 'Message';
			document.getElementById(playerid).appendChild(button1);
			button1.addEventListener('click', () => {
				console.log('Feature has not been added yet!')
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
					let playersinroom=document.getElementById('names').children
					let t
					for(let g=0; g<playersinroom.length; g++){
						if (playersinroom[g].thatid===playerid){
							t=playersinroom[g]
							t.innerHTML=name
							t.style.color='white'
						}
					}
					let cursorsinroom=document.getElementById('cursors').children
					for(let g=0; g<cursorsinroom.length; g++){
						if (cursorsinroom[g].thatid===playerid){
							let p=cursorsinroom[g]
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
			document.getElementById(`${playerid}_btn1`).remove()
			document.getElementById(`${playerid}_btn2`).remove()
		}
	}, 24)

}
// -- //



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
	cDW(friendsWindow, '500', '-400', '400');
	cB(friendsButton, '660', '32', 'Friends', 0, 1);
})();
// -- //
