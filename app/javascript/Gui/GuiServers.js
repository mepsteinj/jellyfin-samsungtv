var GuiServers = {
	ServerData : null,
	selectedItem : 0,
	topLeftItem : 0,
	isAddButton : false,
	MAXCOLUMNCOUNT : 3,
	MAXROWCOUNT : 1
};

GuiServers.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
};

GuiServers.start = function(runAutoLogin) {
	alert("Page Enter : GuiServers");
	GuiHelper.setControlButtons(Main.messages.LabButtonDefault, null, null, Main.messages.LabButtonDelete, Main.messages.LabButtonExit);
	//Reset Properties
	this.selectedItem = 0;
	this.topLeftItem = 0;
	this.isAddButton = false;
	//Load Data
	this.ServerData = JSON.parse(File.loadFile());
	if (this.ServerData.Servers.length == 0) {
		//Should never happen - Redirect to
		GuiNewServer.start();
	} else {
		Support.removeSplashScreen();
		//Change Display
		var div = "<div style='padding-top:100px;text-align:center'><div id=guiServersAllUsers></div></div>" +
		"<div id=guiServersAddNew class='guiServersAddNew'>" + Main.messages.LabAddNewServer + "</div>" +
		"<div style='text-align:center' class='loginOptions' >" + Main.messages.LabServersDescription + "</div>";
		Support.widgetPutInnerHTML("pageContent", div);
		GuiServers.updateDisplayedUsers();
		GuiServers.updateSelectedUser();
		//Set Backdrop
		Support.fadeImage("images/bg1.jpg");
		//Set focus to element in Index that defines keydown method! This enables keys to work :D
		document.getElementById("guiServers").focus();
	}
};

GuiServers.updateDisplayedUsers = function() {
	var htmlToAdd = "";
	for (var index = this.topLeftItem; index < (Math.min(this.topLeftItem + this.getMaxDisplay(), this.ServerData.Servers.length)); index++) {
		htmlToAdd += "<div id=" + this.ServerData.Servers[index].Id + " style=background-image:url(images/server.png)><div class=menuItem2>" + this.ServerData.Servers[index].Name + "</div></div>";
	}
	//Set Content to Server Data
	Support.widgetPutInnerHTML("guiServersAllUsers", htmlToAdd);
};

//Function sets CSS Properties so show which user is selected
GuiServers.updateSelectedUser = function () {
	Support.updateSelectedNEW(this.ServerData.Servers, this.selectedItem, this.topLeftItem,
			Math.min(this.topLeftItem + GuiServers.getMaxDisplay(), this.ServerData.Servers.length), "user selected highlight1Boarder", "user", "");
};

//Function executes on the selection of a user - should log user in or generate error message on screen
GuiServers.processSelectedUser = function () {
	if (this.isAddButton == true) {
		GuiNewServer.start();
	} else {
		File.setServerEntry(this.selectedItem);
		Server.testConnectionSettings(this.ServerData.Servers[this.selectedItem].Path, true);
	}
};

GuiServers.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);
	if (document.getElementById("notifications").style.visibility == "") {
		document.getElementById("notifications").style.visibility = "hidden";
		Support.widgetPutInnerHTML("notificationText", "");
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
				this.selectedItem = this.ServerData.Servers.length - 1;
				if(this.ServerData.Servers.length > this.MAXCOLUMNCOUNT) {
					this.topLeftItem = (this.selectedItem-2);
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
			if (this.selectedItem >= this.ServerData.Servers.length) {
				this.selectedItem = 0;
				this.topLeftItem = 0;
				this.updateDisplayedUsers();
			} else {
				if (this.selectedItem >= this.topLeftItem + this.getMaxDisplay() ) {
					this.topLeftItem++;
					this.updateDisplayedUsers();
				}
			}
			this.updateSelectedUser();
			break;
		case tvKey.KEY_DOWN:
			this.isAddButton = true;
			document.getElementById(this.ServerData.Servers[this.selectedItem].Id).className = "user";
			document.getElementById("guiServersAddNew").style.border = "2px solid red";
			break;
		case tvKey.KEY_UP:
			this.isAddButton = false;
			document.getElementById(this.ServerData.Servers[this.selectedItem].Id).className = "user selected";
			document.getElementById("guiServersAddNew").style.border = "2px solid black";
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			GuiServers.processSelectedUser();
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