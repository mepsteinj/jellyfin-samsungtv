var UsersManual = {
	userData : null,
	selectedItem : 0, //0 = User, 1 = Password
	rememberPassword : false
};

UsersManual.getRememberPasswordWord = function() {
	var res = (this.rememberPassword == true) ? Main. messages.LabYes : Main.messages.LabNo;
	return res;
};

UsersManual.start = function() {
	alert("Page Enter : UsersManual");
	Helper.setControlButtons(null, null, null, null, Main.messages.LabButtonReturn);
	//Reset Properties
	this.selectedItem = 0;
	this.rememberPassword = false;
	Notifications.delNotification()
	//Load Data
	var url = Server.getServerAddr() + "/Users/Public?format=json";
	this.userData = Server.getContent(url);
	if (this.userData == null) { return; }
	//Change Display
	var div = "<div class='newServer12key'>" +
		"<p style='padding-bottom:5px'>" + Main.messages.LabUserName + "</p>" +
		"<form><input id='user' style='z-index:10;' type='text' size='40' value=''/></form>" +
		"<p style='padding-bottom:5px'>" + Main.messages.LabPassword + "</p>" +
		"<form><input id='pass' style='z-index:10;' type='password' size='40' value=''/></form>" +
		"<br><span id='usersRemPwd'>" + Main.messages.LabRememberPassword + "</span> : <span id='usersRemPwdValue'>" + this.getRememberPasswordWord() + "</span>" +
		"</div>";
	Support.widgetPutInnerHTML("pageContent", div);
	new UsersManualInput("user");
};

UsersManual.IMEAuthenticate = function(user, password) {
	var authenticateSuccess = Server.Authenticate(null, user, password);
	if (authenticateSuccess) {
		document.getElementById("noKeyInput").focus();
		//Check if this user is already in the DB.
		var userInFile = false;
		var fileJson = JSON.parse(File.loadFile());
		for (var index = 0; index < fileJson.Servers[File.getServerEntry()].Users.length; index++) {
			if (fileJson.Servers[File.getServerEntry()].Users[index].UserName == user) {
				userInFile = true;
				File.setUserEntry(index);
			}
		}
		//Otherwise add them.
		if (userInFile == false) {
			alert("Need to add the user to the DB");
			//Add Username & Password to DB - Save password only if rememberPassword = true
			if (this.rememberPassword == true) {
				File.addUser(Server.UserID, user, password, this.rememberPassword);
			} else {
				File.addUser(Server.UserID, user, "", this.rememberPassword);
			}
		}
		//Change Focus and call function in GuiMain to initiate the page!
		MainMenu.start();
	} else {
		alert("Authentication Failed");
		document.getElementById("user").focus();
		Notifications.setNotification(Main.messages.LabBadPass, Main.messages.LabLogonError, true);
	}
};

//////////////////////////////////////////////////////////////////
//  Input method for entering user password.                    //
//////////////////////////////////////////////////////////////////

var UsersManualInput  = function(id) {
	var imeReady = function(imeObject) {
		installFocusKeyCallbacks();
		document.getElementById(id).focus();
	};

	var ime = new IMEShell(id, imeReady,'en');
	ime.setKeypadPos(1310,250);

	var installFocusKeyCallbacks = function() {
		ime.setKeyFunc(tvKey.KEY_ENTER, function(keyCode) {
			alert("Enter key pressed");
			if (UsersManual.selectedItem == 0) {
				//Set IME to Password field
				UsersManual.selectedItem++;
				new UsersManualInput("pass");
				document.getElementById("pass").focus;
			} else {
				//Process Login Here
				var usr = document.getElementById("user").value;
				var pwd = document.getElementById("pass").value;
				UsersManual.IMEAuthenticate(usr, pwd);
			}
		});

		ime.setKeyFunc(tvKey.KEY_DOWN, function(keyCode) {
			alert("Down key pressed");
			if (UsersManual.selectedItem == 0) {
				//Set IME to Password field
				UsersManual.selectedItem++;
				new UsersManualInput("pass");
				document.getElementById("pass").focus;
			} else {
				document.getElementById("usersRemPwd").style.color = "red";
				document.getElementById("evnUsersManualPwd").focus();
			}
		});

		ime.setKeyFunc(tvKey.KEY_UP, function(keyCode) {
			alert("Up key pressed");
			if (UsersManual.selectedItem == 1) {
				//Set IME to Username field
				UsersManual.selectedItem--;
				new UsersManualInput("user");
				document.getElementById("user").focus;
			}
		});

		//Keycode to abort login from password screen
		ime.setKeyFunc(tvKey.KEY_RETURN, function(keyCode) {
			widgetAPI.blockNavigation(event);
			var fileJson = JSON.parse(File.loadFile());
			if (fileJson.Servers.length > 0) {
				document.getElementById("pageContent").focus();
				Users.start();
			}
		});

		ime.setKeyFunc(tvKey.KEY_EXIT, function(keyCode) {
			document.getElementById("noKeyInput").focus();
			widgetAPI.sendExitEvent();
		});
	};
};

UsersManual.keyDownPassword = function() {
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
			if (document.getElementById("usersRemPwd").style.color == "red") {
				document.getElementById("usersRemPwd").style.color = "#f9f9f9";
				document.getElementById("pass").focus();
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