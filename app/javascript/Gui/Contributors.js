var Contributors = {
	MainDevs : ["ChessDragon136","cmcg"],
	ContribDevs : ["Cragjagged","DrWatson","im85288","arcticwaters","SamES"],
	DonateSupport : ["c0m3r","Cbers","crashkelly","DaN","FrostByte","gbone8106","ginganinja","grimfandango","fc7","shorty1483","paulsalter","fluffykiwi","oleg","MongooseMan","SilentAssassin","gogreenpower","Ultroman","Spaceboy","JeremyG","strugglez"]
};

Contributors.onFocus = function() {
	Helper.setControlButtons(null, null, null, MusicPlayer.Status == "PLAYING" || MusicPlayer.Status == "PAUSED" ? "Music" : null, "Return");
};

Contributors.start = function() {
	alert("Page Enter : Contributors");
	Support.widgetPutInnerHTML("counter", Main.version);
	document.getElementById("returnButton").style.visibility = "";
	Support.widgetPutInnerHTML("returnButton", "Return") ;
	Support.widgetPutInnerHTML("pageContent", "<div class='episodesSeriesInfo'>About:</div><div id=contentAbout style='font-size:1em;' class='settingsSettings'></div>");
	var htmlToAdd = "Jellyfin for Samsung Smart TVs is a free, opensource community project. A broad range of Smarthub devices are supported due to the generously donated time and efforts of, among others, the following people.<br>";
	htmlToAdd += "Feedback on this and other Jellyfin products is gratefully received at jellyfin/community.<br><br>";
	htmlToAdd += "<span style='font-size:1.2em;'>Main Developers</span><table><tr class='settingsRow'>";
	for (var index = 0; index < this.MainDevs.length; index++) {
		if (index % 6 == 0) {
			htmlToAdd += "<tr class='settingsRow'>";
		}
		htmlToAdd += "<td class='settingsTD'>" + this.MainDevs[index] + "</td>";
		if (index+1 % 6 == 0) {
			htmlToAdd += "</tr>";
		}
	}
	htmlToAdd += "</tr></table><br><br>";
	htmlToAdd += "<span style='font-size:1.2em;'>Contributing Developers</span><table><tr class='settingsRow'>";
	for (var index = 0; index < this.ContribDevs.length; index++) {
		if (index % 6 == 0) {
			htmlToAdd += "<tr class='settingsRow'>";
		}
		htmlToAdd += "<td class='settingsTD'>" + this.ContribDevs[index] + "</td>";
		if (index+1 % 6 == 0) {
			htmlToAdd += "</tr>";
		}
	}
	htmlToAdd += "</tr></table><br><br>";
	htmlToAdd += "<span style='font-size:1.2em;'>Donators, supporters and valued beta testers.</span><table><tr class='guiSettingsRow'>";
	for (var index = 0; index < this.DonateSupport.length; index++) {
		if (index % 7 == 0) {
			htmlToAdd += "<tr class='guiSettingsRow'>";
		}
		htmlToAdd += "<td class='guiSettingsTD'>" + this.DonateSupport[index] + "</td>";
		if (index+1 % 7 == 0) {
			htmlToAdd += "</tr>";
		}
	}
  Support.widgetPutInnerHTML("ContentAbout", htmlToAdd + "</tr></table>");

	//Set Focus for Key Events
	document.getElementById("evnContributors").focus();
};

Contributors.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	if (document.getElementById("notifications").style.visibility == "") {
		Notifications.delNotification();
		widgetAPI.blockNavigation(event);
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}

	//Update Screensaver Timer
	Support.screensaver();

	//If screensaver is running
	if (Main.getIsScreensaverRunning()) {
		//Update Main.js isScreensaverRunning - Sets to True
		Main.setIsScreensaverRunning();

		//End Screensaver
		ImagePlayerScreensaver.stopScreensaver();

		//Change keycode so it does nothing!
		keyCode = "VOID";
	}

	switch(keyCode) {
		case tvKey.KEY_LEFT:
			alert("LEFT");
			this.openMenu();
			break;
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			Support.processReturnURLHistory();
			break;
		case tvKey.KEY_BLUE:
			MusicPlayer.showMusicPlayer("Contributors");
			break;
		case tvKey.KEY_TOOLS:
			widgetAPI.blockNavigation(event);
			this.openMenu();
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
	}
};

Contributors.openMenu = function() {
	Support.updateURLHistory("Contributors",null,null,null,null,null,null,null);
	MainMenu.requested("Contributors",null);
};