var GuiSettingsLog = {
	logArray : null,
	selectedBannerItem : 0,
	topLeftItem : 0,
	MAXCOLUMNCOUNT : 1,
	MAXROWCOUNT : 20,
	bannerItems : ["User Settings","Server Settings","TV Settings","Log","About"],
};

GuiSettingsLog.onFocus = function() {
	Helper.setControlButtons("Clear Log", null, null, MusicPlayer.Status == "PLAYING" || MusicPlayer.Status == "PAUSED" ? "Music" : null, "Return");
};

GuiSettingsLog.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
};

GuiSettingsLog.start = function() {
	alert("Page Enter : GuiSettingsLog");

	//Reset Vars
	this.selectedBannerItem = 3; //match Logs

	//Load Data
	this.logArray = FileLog.loadFile(true);
	this.topLeftItem = this.logArray.length - GuiSettingsLog.getMaxDisplay();
	this.topLeftItem = (this.topLeftItem < 0) ? 0 : this.topLeftItem;

	//Load Settings
	document.getElementById("pageContent").className = "";
	document.getElementById("pageContent").innerHTML = "<div id=bannerSelection class='bannerMenu'></div><div id='guiTVShowTitle' class='guiSettingsTitle'>Log</div>\ \
		<div id='guiPage_Settings_Settings' class='guiSettingsSettings'></div>";// +
		/*"<div id='guiPage_Settings_Overview' class='guiSettingsOverview'>" +
			"<div id=guiPage_Settings_Overview_Title></div>" +
			"<div id=guiPage_Settings_Overview_Content></div>" +
		"</div>";*/

	//Create Banner Items
	for (var index = 0; index < this.bannerItems.length; index++) {
		if (index != this.bannerItems.length-1) {
			document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='bannerItem bannerItemPadding'>"+this.bannerItems[index].replace(/_/g, ' ')+"</div>";
		} else {
			document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='bannerItem'>"+this.bannerItems[index].replace(/_/g, ' ')+"</div>";
		}
	}

	//Update Displayed
	//this.setText();
	this.updateDisplayedItems();
	this.updateSelectedBannerItems();
	document.getElementById("GuiSettingsLog").focus();
};

GuiSettingsLog.updateDisplayedItems = function() {
	var htmlToAdd = "<table>";
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.logArray.length); index++) {
		htmlToAdd += "<tr><td style='word-wrap:break-word;word-break:break-all;width:1500px;'>" + this.logArray[index] + "</td></tr>";
	}
	document.getElementById("guiPage_Settings_Settings").innerHTML = htmlToAdd + "</table>";
};

GuiSettingsLog.updateSelectedBannerItems = function() {
	for (var index = 0; index < this.bannerItems.length; index++) {
		if (index == this.selectedBannerItem) {
			if (index != this.bannerItems.length-1) { //Don't put padding on the last one.
				document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding highlight"+Main.highlightColour+"Text";
			} else {
				document.getElementById("bannerItem"+index).className = "bannerItem highlight"+Main.highlightColour+"Text";
			}
		} else {
			if (index != this.bannerItems.length-1) { //Don't put padding on the last one.
				if (index == 3) {
					document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding offWhite";
				} else {
					document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding";
				}
			} else {
				if (index == 3) {
					document.getElementById("bannerItem"+index).className = "bannerItem offWhite";
				} else {
					document.getElementById("bannerItem"+index).className = "bannerItem";
				}
			}
		}
	}
	document.getElementById("counter").innerHTML = (this.selectedBannerItem + 1) + "/" + (this.bannerItems.length);
};

GuiSettingsLog.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	if (document.getElementById("notifications").style.visibility == "") {
		document.getElementById("notifications").style.visibility = "hidden";
		document.getElementById("notificationText").innerHTML = "";
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
		GuiImagePlayerScreensaver.stopScreensaver();
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}

	switch(keyCode) {
		//Need Logout Key
		case tvKey.KEY_UP:
			this.processUpKey();
			break;
		case tvKey.KEY_DOWN:
			this.processDownKey();
			break;
		case tvKey.KEY_LEFT:
			this.processLeftKey();
			break;
		case tvKey.KEY_RIGHT:
			this.processRightKey();
			break;
		case tvKey.KEY_RETURN:
			widgetAPI.blockNavigation(event);
			Support.processReturnURLHistory();
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			this.processSelectedItem();
			break;
		case tvKey.KEY_RED:
			FileLog.empty();
			FileLog.write("---------------------------------------------------------------------",true);
			FileLog.write("Log File Emptied by User");
			GuiSettingsLog.start(); //relead
			break;
		case tvKey.KEY_BLUE:
			MusicPlayer.showMusicPlayer("SettingsLog", "bannerItem" + this.selectedBannerItem, "bannerItem bannerItemPadding highlight" + Main.highlightColour + "Text");
			break;
		case tvKey.KEY_TOOLS:
			widgetAPI.blockNavigation(event);
			MainMenu.requested("SettingsLog", null);
			break;
		case tvKey.KEY_EXIT:
			widgetAPI.sendExitEvent();
			break;
	}
};

GuiSettingsLog.processUpKey = function() {
	this.topLeftItem = this.topLeftItem - this.MAXCOLUMNCOUNT;
	if (this.topLeftItem == -1) {
		this.topLeftItem = 0;
	} else {
		this.updateDisplayedItems();
	}
};

GuiSettingsLog.processDownKey = function() {
	this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
	if (this.topLeftItem > this.logArray.length - this.getMaxDisplay()) {
		this.topLeftItem = this.topLeftItem - this.MAXCOLUMNCOUNT;
	} else {
		this.updateDisplayedItems();
	}
};

GuiSettingsLog.processLeftKey = function() {
	this.selectedBannerItem--;
	if (this.selectedBannerItem < 0) {
		this.selectedBannerItem = 0;
		this.openMenu();
	} else {
		this.updateSelectedBannerItems();
	}
};

GuiSettingsLog.openMenu = function() {
	document.getElementById("bannerItem0").className = "bannerItem bannerItemPadding";
	MainMenu.requested("SettingsLog","bannerItem0","bannerItem bannerItemPadding green");
};

GuiSettingsLog.processRightKey = function() {
	this.selectedBannerItem++;
	if (this.selectedBannerItem >= this.bannerItems.length) {
		this.selectedBannerItem--;
	} else {
		this.updateSelectedBannerItems();
	}
};

GuiSettingsLog.processSelectedItem = function() {
	if (this.bannerItems[this.selectedBannerItem] == "About") {
		Support.updateURLHistory("GuiSettings",null,null,null,null,0,0,null);
		GuiContributors.start();
	} else if (this.bannerItems[this.selectedBannerItem] != "Log") {
		GuiPageSettings.start(this.bannerItems[this.selectedBannerItem]);
	}
};

GuiSettingsLog.setText = function() {
	document.getElementById("guiSettingsOverviewTitle").innerHTML = "Log Viewer";
	document.getElementById("guiSettingsOverviewContent").innerHTML = "Press the up arrow to navigate to earlier entries in the log, and down to view later entries. The log opens at the last items in the log. <br><br> Press the red button to clear the log.";
};

