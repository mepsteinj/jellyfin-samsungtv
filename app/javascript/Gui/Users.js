var Users = {
	userData : null,
	isManualEntry : false,
	rememberPassword : true,
	selectedUser : 0,
	selectedRow : 0,
	topLeftItem : 0,
	MAXCOLUMNCOUNT : 3,
	MAXROWCOUNT : 1
};

Users.getRememberPasswordWord = function() {
	var res = (this.rememberPassword == true) ? Main. messages.LabYes : Main.messages.LabNo;
	return res;
};

Users.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
};

Users.start = function(runAutoLogin) {
	alert("Page Enter : Users");
	Helper.setControlButtons(null, "Del users  ", "Del pass  ", null, Main.messages.LabButtonExit);
	Support.removeSplashScreen();
	//Reset Properties
	File.setUserEntry(null);
	this.selectedUser = 0;
	this.selectedRow = 0;
	this.topLeftItem = 0;
	this.isManualEntry = false;
	this.rememberPassword = true;
	Support.destroyURLHistory();
	Support.fadeImage("images/bg1.jpg");
	Support.widgetPutInnerHTML("notificationText", "");
	document.getElementById("notifications").style.visibility = "hidden";
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
					GuiMainMenu.start();
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
		var div = "<div style='padding-top:100px;text-align:center'>" +
		"<div id=usersAllUsers></div>" +
		"<div id='pwdOptions' class='loginOptions'>" +
		"<div id='usersPwd' style='visibility:hidden'>" +
		"<br>" + Main.messages.LabPassword + " <input id='usersPassword' type='password' size='20'/>" +
		"<br><span id='usersRemPwd'>" + Main.messages.LabRememberPassword + "</span> : <span id='usersRemPwdValue'>" + this.rememberPassword + "</span>" +
		"<br></div>" +
		"<div id='loginOptions' class='loginOptions'>" +
		"<div id='manualLogin'>" + Main.messages.LabManualLogin + "</div>" +
		"<div id='changeServer'>" + Main.messages.LabChangeServer + "</div> " +
		"<div><br>" + Main.messages.LabUsersDescription + "</div>" +
		"</div></div>";
		Support.widgetPutInnerHTML("pageContent", div);
		if (this.userData.length != 0) {
			this.updateDisplayedUsers();
			this.updateSelectedUser();
			document.getElementById("envUsers").focus();
		} else {
			//Probably need some padding here to make it look nice!
			document.getElementById("envUsers").focus();
		}
	}
};

Users.updateDisplayedUsers = function() {
	var htmlToAdd = "";
	for (var index = this.topLeftItem; index < (Math.min(this.topLeftItem + this.getMaxDisplay(), this.userData.length)); index++) {
		if (this.userData[index].PrimaryImageTag) {
			var imgsrc = Server.getImageURL(this.userData[index].Id, "UsersPrimary", 400, 400, 0, false, 0);
			htmlToAdd += "<div id=" + this.userData[index].Id + " style=background-image:url(" + imgsrc + ")><div class=menuItem2>" + this.userData[index].Name + "</div></div>";
		} else {
			htmlToAdd += "<div id=" + this.userData[index].Id + " style=background-image:url(images/loginusernoimage.png)><div class=menuItem2>"+ this.userData[index].Name + "</div></div>";
		}
	}
	//Set Content to Server Data
	Support.widgetPutInnerHTML("usersAllUsers", htmlToAdd);
};

//Function sets CSS Properties so show which user is selected
Users.updateSelectedUser = function () {
	Support.updateSelectedNEW(this.userData, this.selectedUser, this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(), this.userData.length), "user selected highlight1Boarder", "user", "");
};

//Function executes on the selection of a user - should log user in or generate error message on screen
Users.processSelectedUser = function () {
	var selectedUserId = this.userData[this.selectedUser].Id;
	//Remove Focus & Display Loading
	document.getElementById("noItems").focus();
	document.getElementById("guiLoading").style.visibility = "";
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
				if (fileJson.Servers[File.getServerEntry()].Users[index].RememberPassword !== undefined) {
					this.rememberPassword = fileJson.Servers[File.getServerEntry()].Users[index].RememberPassword;
					Support.widgetPutInnerHTML("usersRemPwdValue", this.getRememberPasswordWord());
				}
				//Authenticate with MB3 - if fail somehow bail?
				var authenticateSuccess = Server.Authenticate(userId, user, password);
				if (authenticateSuccess) {
					//Hide loading
					document.getElementById("guiLoading").style.visibility = "hidden";
					//document.getElementById("envUsers").focus();
					//Set File User Entry
					File.setUserEntry(index);
					//Change Focus and call function in GuiMain to initiate the page!
					GuiMainMenu.start();
				} else {
					//Doesn't delete, allows user to correct password for the user.
					//Hide loading
					document.getElementById("guiLoading").style.visibility = "hidden";
					document.getElementById("envUsers").focus();
					//Saved password failed - likely due to a user changing their password or user forgetting passwords!
					new UsersInput("usersPassword");
				}
				break;
			}
		}
	}
	if (userInFile == false){
		if (this.userData[this.selectedUser].HasPassword) {
			//Has password - Load IME
			//Hide loading
			document.getElementById("guiLoading").style.visibility = "hidden";
			document.getElementById("envUsers").focus();
			new UsersInput("usersPassword");
		} else {
			var authenticateSuccess = Server.Authenticate(this.userData[this.selectedUser].Id, this.userData[this.selectedUser].Name, "");
			if (authenticateSuccess) {
				//Reset GUI to as new - Not Required as it already is!!
				//Hide loading
				document.getElementById("guiLoading").style.visibility = "hidden";
				//Add Username & Password to DB
				File.addUser(this.userData[this.selectedUser].Id, this.userData[this.selectedUser].Name, "", this.rememberPassword);
				//Change Focus and call function in GuiMain to initiate the page!
				GuiMainMenu.start();
			} else {
				//Hide loading
				document.getElementById("guiLoading").style.visibility = "hidden";
				document.getElementById("envUsers").focus();
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
				document.getElementById("manualLogin").className = "offWhite";
				this.updateSelectedUser();
			} else if (this.selectedRow == 1) {
				this.isManualEntry = true;
				document.getElementById("manualLogin").className = "highlight1Text";
				document.getElementById("changeServer").className = "offWhite";
				document.getElementById(this.userData[this.selectedUser].Id).className = "user";
			} else if (this.selectedRow == 2) {
				document.getElementById("manualLogin").className = "offWhite";
				document.getElementById("changeServer").className = "highlight1Text";
			}
			break;
		case tvKey.KEY_DOWN:
			this.selectedRow++;
			if (this.selectedRow == 1) {
				this.isManualEntry = true;
				document.getElementById("manualLogin").className = "highlight1Text";
				document.getElementById("changeServer").className = "offWhite";
				document.getElementById(this.userData[this.selectedUser].Id).className = "user";
			} else if (this.selectedRow > 1) {
				this.selectedRow = 2;
				document.getElementById("manualLogin").className = "offWhite";
				document.getElementById("changeServer").className = "highlight1Text";
			}
			break;
		case tvKey.KEY_LEFT:
			alert("LEFT");
			if (this.selectedRow == 0) {
				this.selectedUser--;
				if (this.getSelectedUser() < 0) {
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
				GuiUsersManual.start();
			} else if (this.selectedRow == 2) {
				GuiServers.start();
			}
			break;
		case tvKey.KEY_BLUE:
			Server.setServerAddr("");
			File.setServerEntry(null);
			GuiServers.start();
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

//////////////////////////////////////////////////////////////////
//  Input method for entering user password                     //
//////////////////////////////////////////////////////////////////

var UsersInput = function(id) {
	var imeReady = function(imeObject) {
		installFocusKeyCallbacks();
		document.getElementById("usersPwd").style.visibility="";
		document.getElementById("envUsersPassword").focus();
	};
		
	var ime = new IMEShell(id, imeReady, 'en');
	ime.setKeypadPos(1300,90);
	
	var installFocusKeyCallbacks = function() {
		ime.setKeyFunc(tvKey.KEY_ENTER, function(keyCode) {
			alert("Enter key pressed");
			//Save pwd value first, then wipe for next use
			var pwd = document.getElementById("usersPassword").value;
			ime.setString("");
			//Set focus back to Users to reset IME
			document.getElementById("envUsers").focus();
			Users.IMEAuthenticate(pwd);
		});
		//Keycode to abort login from password screen
		ime.setKeyFunc(tvKey.KEY_RED, function(keyCode) {
			document.getElementById("usersPwd").style.visibility="hidden";
			document.getElementById("envUsers").focus();
		});
		ime.setKeyFunc(tvKey.KEY_DOWN, function(keyCode) {
			document.getElementById("usersRemPwd").style.color = "red";
			document.getElementById("envUsersPwd").focus();
		});
		ime.setKeyFunc(tvKey.KEY_RETURN, function(keyCode) {
			widgetAPI.blockNavigation(event);
			Users.start();
		});
		ime.setKeyFunc(tvKey.KEY_EXIT, function(keyCode) {
			widgetAPI.sendExitEvent();
		});
	};
};

//Run from IME if user has password - Run in Users for ease of access to class variables
Users.IMEAuthenticate = function(password) {
	var authenticateSuccess = Server.Authenticate(this.userData[this.selectedUser].Id, this.userData[this.selectedUser].Name, password);
	if (authenticateSuccess) {
		//Reset GUI to as new!
		document.getElementById("usersPwd").style.visibility="hidden";
		//Add Username & Password to DB - Save password only if rememberPassword = true
		if (this.rememberPassword == true) {
			File.addUser(this.userData[this.selectedUser].Id, this.userData[this.selectedUser].Name, password, this.rememberPassword);
		} else {
			File.addUser(this.userData[this.selectedUser].Id, this.userData[this.selectedUser].Name, "", this.rememberPassword);
		}
		//Change Focus and call function in GuiMain to initiate the page!
		GuiMainMenu.start();
	} else {
		//Wrong password - Reset IME focus and notifty user
		document.getElementById("envUsersPassword").focus();
		Notifications.setNotification(Main.messages.LabBadPassword, Main.messages.LabLogonError);
	}
};

Users.keyDownPassword = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);
	if (document.getElementById("notifications").style.visibility == "") {
		document.getElementById("notifications").style.visibility = "hidden";
		Support.widgetPutInnerHTML("notificationText", "");
		widgetAPI.blockNavigation(event);
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	switch(keyCode)
	{
		case tvKey.KEY_RETURN:
		case tvKey.KEY_PANEL_RETURN:
			alert("RETURN");
			widgetAPI.sendReturnEvent();
			break;
		case tvKey.KEY_UP:
			if (document.getElementById("usersRemPwd").style.color == "red") {
				document.getElementById("usersRemPwd").style.color = "#f9f9f9";
				document.getElementById("usersPassword").focus();
			} else {
				this.rememberPassword = (this.rememberPassword == false) ? true : false;
				Support.widgetPutInnerHTML("usersRemPwdValue", this.getRememberPasswordWord());
			}
			break;
		case tvKey.KEY_DOWN:
			if (document.getElementById("usersRemPwdValue").style.color == "red") {
				this.rememberPassword = (this.rememberPassword == false) ? true : false;
				Support.widgetPutInnerHTML("usersRemPwdValue", this.getRememberPasswordWord());
			}
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT");
			if (document.getElementById("usersRemPwd").style.color == "red") {
				document.getElementById("usersRemPwd").style.color = "green";
				document.getElementById("usersRemPwdValue").style.color = "red";
			}
			break;
		case tvKey.KEY_LEFT:
			alert("LEFT");
			if (document.getElementById("usersRemPwdValue").style.color == "red") {
				document.getElementById("usersRemPwd").style.color = "red";
				document.getElementById("usersRemPwdValue").style.color = "#f9f9f9";
			}
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			if (document.getElementById("usersRemPwdValue").style.color == "red") {
				document.getElementById("usersRemPwd").style.color = "red";
				document.getElementById("usersRemPwdValue").style.color = "#f9f9f9";
			} else {
				document.getElementById("usersRemPwd").style.color = "green";
				document.getElementById("usersRemPwdValue").style.color = "red";
			}
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