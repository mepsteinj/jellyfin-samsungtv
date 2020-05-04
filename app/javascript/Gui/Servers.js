var GuiServers = {
	serverData : null,
	selectedItem : 0,
	topLeftItem : 0,
	isAddButton : false,
	MAXCOLUMNCOUNT : 3,
	MAXROWCOUNT : 1
};

GuiServers.getServerData = function() {
  return this.serverData;
};

GuiServers.setServerData = function(serverData) {
  this.serverData = serverData;
};

GuiServers.getSelectedItem = function() {
  return this.selectedItem;
};

GuiServers.setSelectedItem = function(selectedItem) {
  this.selectedItem = selectedItem;
};

GuiServers.getTopLeftItem = function() {
  return this.topLeftItem;
};

GuiServers.setTopLeftItem = function(topLeftItem) {
  this.topLeftItem = topLeftItem;
};

GuiServers.getAddButton = function() {
  return this.isAddButton;
};

GuiServers.setAddButton = function(isAddButton) {
  this.isAddButton = isAddButton;
};

GuiServers.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
};

GuiServers.start = function(runAutoLogin) {
	alert("Page Enter : GuiServers");
	Helper.setControlButtons(Main.messages.LabButtonDefault, null, null, Main.messages.LabButtonDelete, Main.messages.LabButtonExit);
	//Reset Properties
	this.setSelectedItem(0);
	this.setTopLeftItem(0);
	this.setAddButton(false);
	//Load Data
	this.setServerData(JSON.parse(File.loadFile()));
	if (this.ServerData.Servers.length == 0) {
		//Should never happen - Redirect to
		NewServer.start();
	} else {
		Support.removeSplashScreen();
		//Change Display
		var div = "<div style='padding-top:100px;text-align:center'><div id=guiServersAllUsers></div></div>" +
		"<div id=serversAddNew class='serversAddNew'>" + Main.messages.LabAddNewServer + "</div>" +
		"<div style='text-align:center' class='loginOptions' >" + Main.messages.LabServersDescription + "</div>";
		Support.widgetPutInnerHTML("pageContent", div);
		this.updateDisplayedUsers();
		this.updateSelectedUser();
		//Set Backdrop
		Support.fadeImage("images/bg1.jpg");
		//Set focus to element in Index that defines keydown method! This enables keys to work :D
		document.getElementById("envServers").focus();
	}
};

GuiServers.updateDisplayedUsers = function() {
	var htmlToAdd = "";
	var data = this.getServerData();
	for (var index = this.getTopLeftItem(); index < (Math.min(this.getTopLeftItem() + this.getMaxDisplay(), data.Servers.length)); index++) {
		htmlToAdd += "<div id=" + data.Servers[index].Id + " style=background-image:url(images/server.png)><div class=menuItem2>" + data.Servers[index].Name + "</div></div>";
	}
	//Set Content to Server Data
	Support.widgetPutInnerHTML("guiServersAllUsers", htmlToAdd);
};

//Function sets CSS Properties so show which user is selected
GuiServers.updateSelectedUser = function () {
  var data = this.getServerData();
	Support.updateSelectedNEW(data.Servers, this.getSelectedItem(), this.getTopLeftItem(),
			Math.min(this.getTopLeftItem() + this.getMaxDisplay(), data.Servers.length), "user selected highlight1Boarder", "user", "");
};

//Function executes on the selection of a user - should log user in or generate error message on screen
GuiServers.processSelectedUser = function () {
  var data = this.getServerData();
	if (this.getAddButton() == true) {
		NewServer.start();
	} else {
		File.setServerEntry(this.getSelectedItem());
		Server.testConnectionSettings(data.Servers[this.getSelectedItem()].Path, true);
	}
};

GuiServers.keyDown = function() {
	var keyCode = event.keyCode;
	var data = this.getServerData();
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
			if (this.getSelectedItem() < 0) {
				this.selectedItem = this.ServerData.Servers.length - 1;
				if(data.Servers.length > this.MAXCOLUMNCOUNT) {
					this.setTopLeftItem(this.getSelectedItem() - 2);
					this.updateDisplayedUsers();
				} else {
					this.setTopLeftItem(0);
				}
			} else {
				if (this.getSelectedItem() < this.getTopLeftItem()) {
					this.topLeftItem--;
					if (this.getTopLeftItem() < 0) {
						this.setTopLeftItem(0);
					}
					this.updateDisplayedUsers();
				}
			}
			this.updateSelectedUser();
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT");
			this.selectedItem++;
			if (this.getSelectedItem >= data.Servers.length) {
				this.selectedItem(0);
				this.setTopLeftItem(0);
				this.updateDisplayedUsers();
			} else {
				if (this.getSelectedItem() >= this.getTopLeftItem() + this.getMaxDisplay()) {
					this.topLeftItem++;
					this.updateDisplayedUsers();
				}
			}
			this.updateSelectedUser();
			break;
		case tvKey.KEY_DOWN:
			this.setAddButton(true);
			document.getElementById(data.Servers[this.getSelectedItem()].Id).className = "user";
			document.getElementById("serversAddNew").style.border = "2px solid red";
			break;
		case tvKey.KEY_UP:
			this.setAddButton(false);
			document.getElementById(data.Servers[this.getSelectedItem()].Id).className = "user selected";
			document.getElementById("serversAddNew").style.border = "2px solid black";
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			this.processSelectedUser();
			break;
		case tvKey.KEY_RED:
			File.setDefaultServer(this.getSelectedItem());
			break;
		case tvKey.KEY_YELLOW:
			File.deleteSettingsFile();
			widgetAPI.sendExitEvent();
		case tvKey.KEY_BLUE:
			File.deleteServer(this.getSelectedItem());
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