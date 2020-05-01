var GuiNotifications = {
	timeout : null
};

GuiNotifications.setNotification = function (message, title, alterHeight) {
	//Clear any existing message
	clearInterval(this.timeout);
	document.getElementById("notifications").style.visibility = "hidden";
	Support.widgetPutInnerHTML("notificationText", "");
	document.getElementById("notificationText").className="notification highlight" + Main.highlightColour + "Boarder";
	//Code to move based on screen (fix for GuiPage_IP)
	if (alterHeight == true) {
		document.getElementById("notifications").style.top = "620px";
		document.getElementById("notifications").style.left = "430px";
	} else {
		document.getElementById("notifications").style.top = "390px";
		document.getElementById("notifications").style.left = "710px";
	}
	Support.widgetPutInnerHTML("notificationText", "<p class=notificationTitle>" + title + "</p><p><br>" + message + "</p>");
	document.getElementById("notifications").style.visibility ="";
	if (title != "Test Mode") {
		this.timeout = setTimeout(function(){
			document.getElementById("notifications").style.visibility = "hidden";
			Support.widgetPutInnerHTML("notificationText", "");
		}, 5000);
	}
};