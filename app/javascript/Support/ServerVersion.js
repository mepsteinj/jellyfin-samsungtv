var ServerVersion = {
	serverInfo : null
};

ServerVersion.getServerInfo = function() {
  return this.serverInfo;
};

ServerVersion.setServerInfo = function(serverInfo) {
  this.serverInfo = serverInfo;
};

ServerVersion.start = function() {
	Support.widgetPutInnerHTML("pageContent", "<div class='padding60' style='text-align:center'> \
			<p style='padding-bottom:5px;'>" + Main.messages. LabServerVersion + "</p>");
	document.getElementById("envServerVersion").focus();
};

ServerVersion.checkServerVersion = function() {
	var url = Server.getCustomURL("/System/Info/Public?format=json");
	this.setServerInfo(Server.getContent(url));
	if (this.getServerInfo() == null) { return; }
	var requiredServerVersion = Main.getRequiredServerVersion();
	var currentServerVersion = this.getServerInfo().Version;
	if (currentServerVersion >= requiredServerVersion) {
		return true;
	} else {
		return false;
	}
};

ServerVersion.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);
	if (document.getElementById("notifications").style.visibility == "") {
		Notifications.delNotification();
		widgetAPI.blockNavigation(event);
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	switch(keyCode) {
		default:
			widgetAPI.sendExitEvent();
			break;
	}
};