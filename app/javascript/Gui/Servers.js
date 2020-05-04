var Servers = {
	serverData : null,
	selectedItem : 0,
	topLeftItem : 0,
	isAddButton : false,
	MAXCOLUMNCOUNT : 3,
	MAXROWCOUNT : 1
};

Servers.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
};

Servers.start = function(runAutoLogin) {
	alert("Page Enter : Servers");
	Helper.setControlButtons(Main.messages.LabButtonDefault, null, null, Main.messages.LabButtonDelete, Main.messages.LabButtonExit);
	//Reset Properties
	this.selectedItem = 0;
	this.topLeftItem = 0;
	this.isAddButton = false;
	//Load Data
	this.serverData = JSON.parse(File.loadFile());
	if (this.serverData.Servers.length == 0) {
		//Should never happen - Redirect to
		NewServer.start();
	} else {
		Support.removeSplashScreen();
		//Change Display
		var div = "<div style='padding-top:100px;text-align:center'>" +
		"<div id=serversAllUsers></div>" +
		"</div>" +
		"<div id=serversAddNew class='serversAddNew'>" + Main.messages.LabAddNewServer + "</div>" +
		"<div style='text-align:center' class='loginOptions' >" + Main.messages.LabServersDescription + 
		"</div>";
		Support.widgetPutInnerHTML("pageContent", div);
		this.updateDisplayedUsers();
		this.updateSelectedUser();
		//Set Backdrop
		Support.fadeImage("images/bg1.jpg");
		//Set focus to element in Index that defines keydown method! This enables keys to work :D
		document.getElementById("envServers").focus();
	}
};

Servers.updateDisplayedUsers = function() {
	var htmlToAdd = "";
	for (var index = this.topLeftItem; index < (Math.min(this.topLeftItem + this.getMaxDisplay(), this.serverData.Servers.length)); index++) {
		htmlToAdd += "<div id=" + this.serverData.Servers[index].Id + " style=background-image:url(images/server.png)><div class=menuItem2>" + this.serverData.Servers[index].Name + "</div></div>";
	}
	//Set Content to Server Data
	Support.widgetPutInnerHTML("serversAllUsers", htmlToAdd);
};

//Function sets CSS Properties so show which user is selected
Servers.updateSelectedUser = function () {
	Support.updateSelectedNEW(this.serverData.Servers, this.selectedItem, this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(), this.serverData.Servers.length), "user selected highlight1Boarder", "user", "");
};

//Function executes on the selection of a user - should log user in or generate error message on screen
Servers.processSelectedUser = function () {
	if (this.isAddButton == true) {
		NewServer.start();
	} else {
		File.setServerEntry(this.selectedItem);
		Server.testConnectionSettings(this.serverData.Servers[this.selectedItem].Path, true);
	}
};

Servers.keyDown = function() {
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
			alert("RETURN");
			widgetAPI.sendReturnEvent();
			break;
		case tvKey.KEY_LEFT:
			alert("LEFT");
			this.selectedItem--;
			if (this.selectedItem < 0) {
				this.selectedItem = this.serverData.Servers.length - 1;
				if(this.serverData.Servers.length > this.MAXCOLUMNCOUNT) {
					this.topLeftItem = (this.selectedItem - 2);
					this.updateDisplayedUsers();
				} else {
					this.topLeftItem = 0;
				}
			} else {
				if (this.selectedItem < this.topLeftItem) {
					this.topLeftItem--;
					if (this.topLeftItem < 0) {
						this.topLeftItem = 0;
					}
					this.updateDisplayedUsers();
				}
			}
			this.updateSelectedUser();
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT");
			this.selectedItem++;
			if (this.selectedItem >= this.serverData.Servers.length) {
				this.selectedItem = 0;
				this.topLeftItem = 0;
				this.updateDisplayedUsers();
			} else {
				if (this.selectedItem >= this.topLeftItem + this.getMaxDisplay()) {
					this.topLeftItem++;
					this.updateDisplayedUsers();
				}
			}
			this.updateSelectedUser();
			break;
		case tvKey.KEY_DOWN:
			this.isAddButton = true;
			document.getElementById(this.serverData.Servers[this.selectedItem].Id).className = "user";
			document.getElementById("serversAddNew").style.border = "2px solid rgba(39,164,54,1)";
			break;
		case tvKey.KEY_UP:
			this.isAddButton = false;
			document.getElementById(this.serverData.Servers[this.selectedItem].Id).className = "user selected";
			document.getElementById("serversAddNew").style.border = "2px solid black";
			this.updateSelectedUser();
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			this.processSelectedUser();
			break;
		case tvKey.KEY_RED:
			File.setDefaultServer(this.selectedItem);
			break;
		case tvKey.KEY_YELLOW:
			File.deleteSettingsFile();
			widgetAPI.sendExitEvent();
		case tvKey.KEY_BLUE:
			File.deleteServer(this.selectedItem);
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