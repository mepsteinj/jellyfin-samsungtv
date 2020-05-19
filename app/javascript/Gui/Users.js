var Users = {
	userData : null,
	isManualEntry : false,
	selectedUser : 0,
	selectedRow : 0,
	topLeftItem : 0,
	MAXCOLUMNCOUNT : 3,
	MAXROWCOUNT : 1
};

Users.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
};

Users.start = function(runAutoLogin) {
	alert("Page Enter : Users");
	Helper.setControlButtons(null, Main.messages.LabButtonDelUsers, Main.messages.LabButtonDelPass, null, Main.messages.LabButtonExit);
	Support.removeSplashScreen();
	document.getElementById("topPanel").style.visibility = "";
	document.getElementById("topPanelLogo").style.visibility = "";
	document.getElementById("topPanelUser").style.visibility = "hidde";
	
	//Reset Properties
	File.setUserEntry(null);
	this.selectedUser = 0;
	this.selectedRow = 0;
	this.topLeftItem = 0;
	this.isManualEntry = false;
	Support.destroyURLHistory();
	Notifications.delNotification();	
	//Load Data
	var url = Server.getServerAddr() + "/Users/Public?format=json";
	this.userData = Server.getContent(url);
	if (this.userData == null) { return; }
	//Check for Default User
	var autoLogin = false;
	//Load File Data	
	if (runAutoLogin == true) {
		var fileJson = JSON.parse(File.loadFile());
		//Look at each user in the local users file.
		for (var index = 0; index < fileJson.Servers[File.getServerEntry()].Users.length; index++) {
			//If they are the default users log them in automatically.
			if (fileJson.Servers[File.getServerEntry()].Users[index].Default == true) {
				var userId = fileJson.Servers[File.getServerEntry()].Users[index].UserId;
				var user = fileJson.Servers[File.getServerEntry()].Users[index].UserName;
				var password = fileJson.Servers[File.getServerEntry()].Users[index].Password;
				//Try to authenticate.
				var authenticateSuccess = Server.Authenticate(userId, user, password);
				if (authenticateSuccess) {
					autoLogin = true;
					//Set File User Entry
					File.setUserEntry(index);
					//Change Focus and call function in GuiMain to initiate the page!
					MainMenu.start();
				} else {
					//Delete user from DB here - makes life much simpler to delete and read on success!!!
					File.deleteUser(index);
				}
				break;
			}
		}
	}
	if (autoLogin == false) {
		//Change Display
		document.getElementById("pageContent").className = "";
		Support.widgetPutInnerHTML("pageContent", 
		"<div style='padding-top:200px;text-align:center'>" +
		"<h2 class='loginOptions'>" + Main.messages.LabSignIn + "</h2>" +
		"<div id=usersAllUsers></div>" +
		"</div>" +
		"<div id='manualLogin' class='usersButtons'>" + Main.messages.LabManualLogin + "</div>" +
		"<div id='changeServer' class='usersButtons'>" + Main.messages.LabChangeServer + "</div> " +
		"<div style='text-align:center' class='loginOptions'><br>" + Main.messages.LabUsersDescription +
		"</div>");	
		if (this.userData.length != 0) {
			this.updateDisplayedUsers();
			this.updateSelectedUser();
			document.getElementById("evnUsers").focus();
		} else {
			//Probably need some padding here to make it look nice!
			document.getElementById("evnUsers").focus();
		}
	}
};

Users.updateDisplayedUsers = function() {
	var htmlToAdd = "";
	var imgsrc = "";
	for (var index = this.topLeftItem; index < (Math.min(this.topLeftItem + this.getMaxDisplay(), this.userData.length)); index++) {
		if (this.userData[index].PrimaryImageTag) {
			imgsrc = Server.getImageURL(this.userData[index].Id, "UsersPrimary", 400, 400, 0, false, 0);
			htmlToAdd += "<div id=" + this.userData[index].Id + " style=background-image:url(" + imgsrc + ")><div class=listItem>" + this.userData[index].Name + "</div></div>";
		} else {
			htmlToAdd += "<div id=" + this.userData[index].Id + " style=background-image:url(images/loginusernoimage.png)><div class=listItem>"+ this.userData[index].Name + "</div></div>";
		}
	}
	//Set Content to Server Data
	Support.widgetPutInnerHTML("usersAllUsers", htmlToAdd);
};

//Function sets CSS Properties so show which user is selected
Users.updateSelectedUser = function() {
	Support.updateSelectedNEW(this.userData, this.selectedUser, this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(), this.userData.length), "user selected highlight1Background", "user", "");
};

//Function executes on the selection of a user - should log user in or generate error message on screen
Users.processSelectedUser = function() {
	var selectedUserId = this.userData[this.selectedUser].Id;
	var authenticateSuccess = false;
	//Remove Focus & Display Loading
	document.getElementById("noItems").focus();
	//Load JSON File
	var userInFile = false;
	var fileJson = JSON.parse(File.loadFile());
	if (fileJson.Servers[File.getServerEntry()].Users.length > 0) {
		for (var index = 0; index < fileJson.Servers[File.getServerEntry()].Users.length; index++) {
			var userId = fileJson.Servers[File.getServerEntry()].Users[index].UserId;
			if (userId == selectedUserId){
				userInFile = true;
				var user = fileJson.Servers[File.getServerEntry()].Users[index].UserName;
				var password = fileJson.Servers[File.getServerEntry()].Users[index].Password;
				//Authenticate with MB3 - if fail somehow bail?
				authenticateSuccess = Server.Authenticate(userId, user, password);
				if (authenticateSuccess) {
					//Set File User Entry
					File.setUserEntry(index);
					//Change Focus and call function in GuiMain to initiate the page!
					MainMenu.start();
				} else {
					//Doesn't delete, allows user to correct password for the user.
					UsersManual.start(user);
				}
				break;
			}
		}
	}
	if (userInFile == false){
		if (this.userData[this.selectedUser].HasPassword) {
			//Has password - Load IME
			UsersManual.start(this.userData[this.selectedUser].Name);
		} else {
			authenticateSuccess = Server.Authenticate(this.userData[this.selectedUser].Id, this.userData[this.selectedUser].Name, "");
			if (authenticateSuccess) {
				//Reset GUI to as new - Not Required as it already is!!
				//Add Username & Password to DB
				File.addUser(this.userData[this.selectedUser].Id, this.userData[this.selectedUser].Name, "", true);
				//Change Focus and call function in GuiMain to initiate the page!
				MainMenu.start();
			} else {
				document.getElementById("evnUsers").focus();
				//Div to display Network Failure - No password therefore no password error
				//This event should be impossible under normal circumstances
				Notifications.setNotification(Main.messages.LabNetworkError);
			}
		}
	}
};

Users.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);
	if (document.getElementById("notifications").style.visibility == "") {
		Notifications.delNotification();
		widgetAPI.blockNavigation(event);
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	switch(keyCode) {
		case tvKey.KEY_RETURN:
		case tvKey.KEY_PANEL_RETURN:
			alert("RETURN");
			widgetAPI.sendReturnEvent();
			break;
		case tvKey.KEY_UP:
			this.selectedRow--;
			if (this.selectedRow < 1) {
				this.selectedRow = 0;
				document.getElementById("manualLogin").style.backgroundColor = "#303030";
				this.updateSelectedUser();
			} else if (this.selectedRow == 1) {
				this.isManualEntry = true;
				document.getElementById("manualLogin").style.backgroundColor = "rgba(0,164,220,0.85)";
				document.getElementById("changeServer").style.backgroundColor = "#303030";
				document.getElementById(this.userData[this.selectedUser].Id).className = "user";
			} else if (this.selectedRow == 2) {
				document.getElementById("manualLogin").style.backgroundColor = "#303030";
				document.getElementById("changeServer").style.backgroundColor = "rgba(0,164,220,0.85)";
			}
			break;
		case tvKey.KEY_DOWN:
			this.selectedRow++;
			if (this.selectedRow == 1) {
				this.isManualEntry = true;
				document.getElementById("manualLogin").style.backgroundColor = "rgba(0,164,220,0.85)";
				document.getElementById("changeServer").style.backgroundColor = "#303030";
				document.getElementById(this.userData[this.selectedUser].Id).className = "user";
			} else if (this.selectedRow > 1) {
				this.selectedRow = 2;
				document.getElementById("manualLogin").style.backgroundColor = "#303030";
				document.getElementById("changeServer").style.backgroundColor = "rgba(0,164,220,0.85)";
			}
			break;
		case tvKey.KEY_LEFT:
			alert("LEFT");
			if (this.selectedRow == 0) {
				this.selectedUser--;
				if (this.selectedUser < 0) {
					this.selectedUser = this.userData.length - 1;
					if(this.userData.length > this.MAXCOLUMNCOUNT) {
						this.topLeftItem = (this.selectedUser - 2);
						this.updateDisplayedUsers();
					} else {
						this.topLeftItem = 0;
					}
				} else {
					if (this.selectedUser < this.topLeftItem) {
						this.topLeftItem--;
						if (this.topLeftItem < 0) {
							this.topLeftItem = 0;
						}
						this.updateDisplayedUsers();
					}
				}
				this.updateSelectedUser();
			}
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT");
			if (this.selectedRow == 0) {
				this.selectedUser++;
				if (this.selectedUser >= this.userData.length) {
					this.selectedUser = 0;
					this.topLeftItem = 0;
					this.updateDisplayedUsers();
				} else {
					if (this.selectedUser >= this.topLeftItem + this.getMaxDisplay()) {
						this.topLeftItem++;
						this.updateDisplayedUsers();
					}
				}
				this.updateSelectedUser();
			}
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			if (this.selectedRow == 0) {
				this.processSelectedUser();
			} else if (this.selectedRow == 1) {
				UsersManual.start("");
			} else if (this.selectedRow == 2) {
				Servers.start();
			}
			break;
		case tvKey.KEY_BLUE:
			Server.setServerAddr("");
			File.setServerEntry(null);
			Servers.start();
			break;
		case tvKey.KEY_YELLOW:
			Notifications.setNotification(Main.messages.LabDelAllPass, Main.messages.LabDeletion);
			File.deleteUserPasswords();
			break;
		case tvKey.KEY_GREEN:
			Notifications.setNotification(Main.messages.LabDelAllUser, Main.messages.LabDeletion);
			File.deleteAllUsers();
			break;
		case tvKey.RETURN:
			alert ("RETURN KEY");
			widgetAPI.blockNavigation(event);
			this.start();
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
		default:
			alert("Unhandled key");
			break;
	}
};