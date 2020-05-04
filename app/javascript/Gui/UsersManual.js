var GuiUsersManual = {
	userData : null,
	selectedItem : 0, //0 = User, 1 = Password
	rememberPassword : false
};

GuiUsersManual.getUserData = function() {
  return this.userData;
};

GuiUsersManual.setUserData = function(userData) {
  this.userData = userData;
};

GuiUsersManual.getSelectedItem = function() {
  return this.selectedItem;
};

GuiUsersManual.setSelectedItem = function(selectedItem) {
  this.selectedItem = selectedItem;
};

GuiUsersManual.getRememberPassword = function() {
  return this.rememberPassword;
};

GuiUsersManual.getRememberPasswordWord = function() {
  var red = (this.getRememberPassword() == true) ? Main. messages.LabYes : Main.messages.LabNo;
  return res;
};

GuiUsersManual.setRememberPassword = function(rememberPassword) {
  this.rememberPassword = rememberPassword;
};

GuiUsersManual.start = function() {
	alert("Page Enter : GuiUsersManual");
	Helper.setControlButtons(null, null, null, null, Main.messages.LabButtonReturn);
	//Reset Properties
	this.setSelectedItem(0);
	this.setRememberPassword(false);
	Support.widgetPutInnerHTML("notificationText", "");
	document.getElementById("notifications").style.visibility = "hidden";
	//Load Data
	var url = Server.getServerAddr() + "/Users/Public?format=json";
	this.setUserData(Server.getContent(url));
	if (this.getUserData() == null) { return; }
	//Change Display
	var div = "<div class='newServer12key'> \
		<p style='padding-bottom:5px'>" + Main.messages.LabUserName + "</p> \
		<form><input id='user' style='z-index:10;' type='text' size='40' value=''/></form> \
		<p style='padding-bottom:5px'>" + Main.messages.LabPassword + "</p> \
		<form><input id='pass' style='z-index:10;' type='password' size='40' value=''/></form> \
		<br><span id='usersRemPwd'>" + Main.messages.LabRememberPassword + "</span> : <span id='guiUsersRemPwdValue'>" + this.rememberPassword + "</span> \
		</div>";
	Support.widgetPutInnerHTML("pageContent", div);
	new GuiUsersManualInput("user");
};

GuiUsersManual.IMEAuthenticate = function(user, password) {
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
			if (this.getRememberPassword() == true) {
				File.addUser(Server.UserID, user, password, this.getRememberPassword());
			} else {
				File.addUser(Server.UserId, user, "", this.getRememberPassword());
			}
		}
		//Change Focus and call function in GuiMain to initiate the page!
		GuiMainMenu.start();
	} else {
		alert("Authentication Failed");
		document.getElementById("user").focus();
		Notifications.setNotification(Main.messages.LabBadPass, Main.messages.LabLogonError, true);
	}
};

//////////////////////////////////////////////////////////////////
//  Input method for entering user password.                    //
//////////////////////////////////////////////////////////////////

var GuiUsersManualInput  = function(id) {
	var imeReady = function(imeObject) {
		installFocusKeyCallbacks();
		document.getElementById(id).focus();
	};
	
	var ime = new IMEShell(id, imeReady,'en');
	ime.setKeypadPos(1300,200);
	
	var installFocusKeyCallbacks = function() {
		ime.setKeyFunc(tvKey.KEY_ENTER, function(keyCode) {
			alert("Enter key pressed");
			if (GuiUsersManual.getSelectedItem() == 0) {
				//Set IME to Password field
				GuiUsersManual.selectedItem++;
				new GuiUsersManualInput("pass");
				document.getElementById("pass").focus;
			} else {
				//Process Login Here
				var usr = document.getElementById("user").value;
				var pwd = document.getElementById("pass").value;
				GuiUsersManual.IMEAuthenticate(usr,pwd);
			}
		});

		ime.setKeyFunc(tvKey.KEY_DOWN, function(keyCode) {
			alert("Down key pressed");
			if (GuiUsersManual.getSelectedItem() == 0) {
				//Set IME to Password field
				GuiUsersManual.selectedItem++;
				new GuiUsersManualInput("pass");
				document.getElementById("pass").focus;
			} else {
				document.getElementById("usersRemPwd").style.color = "red";
				document.getElementById("guiUsersManualPwd").focus();
			}
		});

		ime.setKeyFunc(tvKey.KEY_UP, function(keyCode) {
			alert("Up key pressed");
			if (GuiUsersManual.getSelectedItem() == 1) {
				//Set IME to Username field
				GuiUsersManual.selectedItem--;
				new GuiUsersManualInput("user");
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

GuiUsersManual.keyDownPassword = function() {
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
				this.rememberPassword = (this.getRememberPassword() == false) ? true : false;
				Support.widgetPutInnerHTML("guiUsersRemPwdValue", this.getRememberPasswordWord());
			}
			break;
		case tvKey.KEY_DOWN:
			if (document.getElementById("usersRemPwdValue").style.color == "red") {
				this.rememberPassword = (this.getRememberPassword() == false) ? true : false;
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