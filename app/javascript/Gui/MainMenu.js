var MainMenu = {
	menuItems : [],
	menuItemsHomePages : [],
	pageSelected : "",
	selectedDivId : 0,
	selectedDivClass : "",
	testModeCount : 0,
	testModeTimeout : null,
	isMusicPlaying : false,
	clockVar : null
};

MainMenu.getSelectedMainMenuItem = function() {
	return this.selectedMainMenuItem;
};

//Entry Point from User Menu - ONLY RUN ONCE PER USER LOGIN
MainMenu.start = function() {
	//Generate Menu based on whether there is any of (Folders, TV, Movies, .....)
	this.menuItems.length = 0;
	this.menuItemsHomePages.length = 0;
	//Generate main menu items
	this.menuItemsHomePages = Support.generateTopMenu();
	FileLog.write(this.menuItemsHomePages);
	this.menuItems = Support.generateMainMenu();
	FileLog.write(this.menuItems);

	//Add menu entries
	var htmlToAdd = "";
	for (var index = 0; index < this.menuItems.length;index++) {
		htmlToAdd += "<div id='" + this.menuItems[index] + "' class='menuItem'><div id='menuIcon' class='menuIcon' style='background-image:url(images/menu/" + Support.getMenuItemImage(this.menuItems[index]) + "-46x37.png)'></div>" + Support.getMenuItemName(this.menuItems[index]) + "</div>";
	}
	//Add settings and logout
	htmlToAddAdv = "";
	this.menuItems.push("Search");
	htmlToAddAdv += "<div id=Search class='menuItem'><div id='menuIcon' class='menuIcon' style='background-image:url(images/menu/" + Support.getMenuItemImage("Search") + "-46x37.png)'></div>" + Support.getMenuItemName("Search") + "</div>";
	this.menuItems.push("Settings");
	htmlToAddAdv += "<div id=Settings class='menuItem'><div id='menuIcon' class='menuIcon' style='background-image:url(images/menu/" + Support.getMenuItemImage("Settings") + "-46x37.png)'></div>" + Support.getMenuItemName("Settings") + "</div>";
	this.menuItems.push("LogOut");
	htmlToAddAdv += "<div id=LogOut class='menuItem'><div id='menuIcon' class='menuIcon' style='background-image:url(images/menu/" + Support.getMenuItemImage("LogOut") + "-46x37.png)'></div>" + Support.getMenuItemName("LogOut") + "</div>";
	Support.widgetPutInnerHTML("menuItems", htmlToAdd + htmlToAddAdv);
	//Turn On Screensaver
	Support.screensaverOn();
	Support.screensaver();
	//Validate and update home page URL's
	var url1 = File.getUserProperty("View1");
	if (url1.substring(0,4) == "http") {
		alert("Converting View1");
		File.setUserProperty("View1","TVNextUp");
		File.setUserProperty("View1Name","Next Up");
	}
	var url2 = File.getUserProperty("View2");
	if (url2) {
		if (url2.substring(0,4) == "http") {
			alert("Converting View2");
			File.setUserProperty("View2","LatestMovies");
			File.setUserProperty("View2Name","Latest Movies");
		}
	}
	//Initialise view URL's
	Support.initViewUrls();
	//Set the page highlight colour
	Main.highlightColour = File.getUserProperty("HighlightColour");	
	//Load Home Page
	Support.processHomePageMenu("Home");
};

//Entry Point when called from any page displaying the menu
MainMenu.requested = function(pageSelected, selectedDivId, selectedDivClass) {
	//Reset Menus
	this.selectedMainMenuItem = 0;
	this.selectedSubMenuItem = 0;
	//UnSelect Selected Item on whatever page is loaded
	this.pageSelected = pageSelected;
	this.selectedDivId = selectedDivId;
	//Unhighlights the page's selected content
	if (this.selectedDivId != null) {
		if (selectedDivClass === undefined) {
			this.selectedDivClass = "UNDEFINED";
		} else {
			this.selectedDivClass = selectedDivClass;
		}
		document.getElementById(selectedDivId).className = document.getElementById(selectedDivId).className.replace("settingChanging arrowUpDown","");
		document.getElementById(selectedDivId).className = document.getElementById(selectedDivId).className.replace("highlight" + Main.highlightColour + "Background","");
		document.getElementById(selectedDivId).className = document.getElementById(selectedDivId).className.replace("highlight" + Main.highlightColour + "Text","");
		document.getElementById(selectedDivId).className = document.getElementById(selectedDivId).className.replace("seriesSelected","");
		document.getElementById(selectedDivId).className = document.getElementById(selectedDivId).className.replace("selected","");
	}
	//Show Menu
	document.getElementById("menu").style.visibility = "";
	//Show submenu dependant on selectedMainMenuItem
	this.updateSelectedItems();
	//Set Focus
	document.getElementById("evnMainMenu").focus();
};

MainMenu.updateSelectedItems = function () {
	for (var index = 0; index < this.menuItems.length; index++){
		if (index == this.selectedMainMenuItem) {
			document.getElementById(this.menuItems[index]).className = "menuItem highlight" + Main.highlightColour + "Background";
		} else {
			document.getElementById(this.menuItems[index]).className = "menuItem";
		}
	}
};

//-------------------------------------------------------------
//      Main Menu Key Handling
//-------------------------------------------------------------

MainMenu.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);
	if (document.getElementById("notifications").style.visibility == "") {
	Notifications.delNotification()
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
		case tvKey.KEY_UP:
			alert("Up");
			this.processUpKey();
			break;
		case tvKey.KEY_DOWN:
			alert("DOWN");
			this.processDownKey();
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			this.processSelectedItems();
			break;
		case tvKey.KEY_PLAY:
			this.playSelectedItem();
			break;
		case tvKey.KEY_RIGHT:
		case tvKey.KEY_RETURN:
		case tvKey.KEY_TOOLS:
			widgetAPI.blockNavigation(event);
			//Allows blocking of return from menu if page has no selectable items
			this.processReturnKey();
			break;
		case tvKey.KEY_RED:
			//this.toggleTestMode();
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
	}
};

MainMenu.processSelectedItems = function() {
	//Selecting home when you came from home just closes the menu.
	if  (this.menuItems[this.selectedMainMenuItem] == "Home" &&
		(this.pageSelected == "HomeOneItem" || this.pageSelected == "HomeTwoItems")) {
			this.processReturnKey();
			return;
	}
	//If a trailer was paused when we arrived in the menu, stop it now.
	if (ItemDetails.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
		sf.service.VideoPlayer.stop();
	}
	//Close the menu
	document.getElementById("menu").style.visibility = "hidden";
	setTimeout(function(){
		Support.processHomePageMenu(MainMenu.menuItems[MainMenu.selectedMainMenuItem]);
	}, 200);
};

MainMenu.playSelectedItem = function() {
	//Pressing play on Photos in the main menu plays a random slideshow.
	if (this.menuItems[this.selectedMainMenuItem] == "Photos") {
		//Close the menu
		document.getElementById("menu").style.visibility = "hidden";
		var userViews = Server.getUserViews();
		for (var i = 0; i < userViews.Items.length; i++){
			if (userViews.Items[i].CollectionType == "photos"){
				ImagePlayer.start(userViews,i,true);
			}
		}
	}
};

MainMenu.processReturnKey = function() {
	if (this.pageSelected != null) {
		//As I don't want the settings page in the URL History I need to prevent popping it here (as its not added on leaving the settings page
		if (this.pageSelected != "Settings") {
			Support.removeLatestURL();
		}
		//Cheap way to unhighlight all items!
		this.selectedMainMenuItem = -1;
		this.updateSelectedItems();
		this.selectedMainMenuItem = 0;
		//Close the menu
		document.getElementById("menu").style.visibility = "hidden";
		if (this.pageSelected == "MusicPlayer") {
			MusicPlayer.showMusicPlayer(this.selectedDivId);
		}
		//Set Page GUI elements Correct & Set Focus
		if (this.selectedDivId != null) {
			if (this.selectedDivClass == "UNDEFINED") {
				document.getElementById(this.selectedDivId).className = document.getElementById(this.selectedDivId).className + " Selected";
			} else {
				document.getElementById(this.selectedDivId).className = this.selectedDivClass;
			}
		}
		//If a trailer was playing, set it going again.
		if (ItemDetails.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
			setTimeout(function(){
				sf.service.VideoPlayer.show();
				sf.service.VideoPlayer.resume();
			}, 300);
		}
		FileLog.write(this.pageSelected);
		document.getElementById('evn' + this.pageSelected).focus();
	}
};

MainMenu.processUpKey = function() {
	this.selectedMainMenuItem--;
	if (this.selectedMainMenuItem < 0) {
		this.selectedMainMenuItem = this.menuItems.length-1;
	}
	this.updateSelectedItems();
};

MainMenu.processDownKey = function() {
	this.selectedMainMenuItem++;
	if (this.selectedMainMenuItem >= this.menuItems.length) {
		this.selectedMainMenuItem = 0;
	}
	this.updateSelectedItems();
};

MainMenu.toggleTestMode = function() {
	if (this.testModeCount < 2) {
		this.testModeCount++;
		clearTimeout (this.testModeTimeout);
		this.testModeTimeout = setTimeout(function() {
			MainMenu.testModeCount = 0;
		}, 3000);
	} else {
		clearTimeout (this.testModeTimeout);
		Main.setTestMode();
		Notifications.setNotification("Test mode is now: " + Main.getTestMode(),"Test Mode");
		this.testModeCount = 0;
	}
};