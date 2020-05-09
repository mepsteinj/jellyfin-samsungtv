var DisplayOneItem = {
		ItemData : null,
		ItemIndexData : null,

		selectedItem : 0,
		topLeftItem : 0,
		MAXCOLUMNCOUNT : 4,
		MAXROWCOUNT : 3,

		indexSeekPos : -1,
		isResume : false,
		genreType : "",

		startParams : [],
		isLatest : false,
		backdropTimeout : null
};

DisplayOneItem.onFocus = function() {
	Helper.setControlButtons(null, null, null, MusicPlayer.Status == "PLAYING" || MusicPlayer.Status == "PAUSED" ? "Music" : null, "Return");
};

DisplayOneItem.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
};

DisplayOneItem.start = function(title,url,selectedItem,topLeftItem) {
	alert("Page Enter : DisplayOneItem");

	//Save Start Params
	this.startParams = [title,url];

	//Reset Values
	this.indexSeekPos = -1;
	this.selectedItem = selectedItem;
	this.topLeftItem = topLeftItem;
	this.genreType = null;

	//Load Data
	this.ItemData = Server.getContent(url + "&Limit="+File.getTVProperty("ItemPaging"));
	if (this.ItemData == null) { Support.processReturnURLHistory(); }
	//Once we've browsed the channels down to a content folder we should display them using DisplaySeries.
	if (this.ItemData.TotalRecordCount >0){
		if (this.ItemData.Items[0].Type == "ChannelVideoItem" ||
				this.ItemData.Items[0].Type == "ChannelAudioItem" ||
				this.ItemData.Items[0].Type == "Trailer" ||
				this.ItemData.Items[0].Type == "AudioPodcast") {
			DisplaySeries.start("All "+this.ItemData.Items[0].Type,url,selectedItem,topLeftItem,this.ItemData);
			return;
		}
	}

	//Setup display width height based on title
	switch (title) {
	case "Collections":
	case "Channels":
		this.MAXCOLUMNCOUNT = 3;
		this.MAXROWCOUNT = 2;
		break;
	case "Music":
	case "Albums":
	case "Artists":
		this.MAXCOLUMNCOUNT = 6;
		this.MAXROWCOUNT = 3;
		break;
	default:
		this.MAXCOLUMNCOUNT = 4;
		this.MAXROWCOUNT = 3;
		break;
	}

	//Set Page Content 
  Support.widgetPutInnerHTML("pageContent", "<div id='title' class='episodesSeriesInfo'>" + title + "</div>" +
			"<div id=Center class='seriesCenter'><div id=content></div></div>");

	//Set Top
	DisplayOneItem.setPadding(title);

	if (this.ItemData.Items.length > 0) {
		//Set isResume based on title - used in UpdateDisplayedItems
		this.isResume = (title == "Resume") ? true : false;

		//Alter to only allow indexing on certain pages??
		//this.ItemIndexData = Support.processIndexing(this.ItemData.Items);

		//Display first XX series
		this.updateDisplayedItems();

		//Update Selected Collection CSS
		this.updateSelectedItems();

		//Set Focus for Key Events
		document.getElementById("evnDisplayOneItem").focus();
	} else {
		//Set message to user
		Support.widgetPutInnerHTML("counter", "" );
		document.getElementById("content").style.fontSize="40px";
		Support.widgetPutInnerHTML("content", "Huh.. Looks like I have no content to show you in this view I'm afraid<br>Press return to get back to the previous screen");

		document.getElementById("noItems").focus();
	}
};

DisplayOneItem.updateDisplayedItems = function() {
	Support.updateDisplayedItems(this.ItemData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Content","",this.isResume,this.genreType,true);
};

//Function sets CSS Properties so show which user is selected
DisplayOneItem.updateSelectedItems = function () {
	if (this.MAXCOLUMNCOUNT == 3) {
		//Add Collections Class to add more margin
		Support.updateSelectedNEW(this.ItemData.Items, this.selectedItem, this.topLeftItem,
				Math.min(this.topLeftItem + this.getMaxDisplay(), this.ItemData.Items.length),"series collection selected highlight" + Main.highlightColour + "Boarder","series collection","");
	} else {
		Support.updateSelectedNEW(this.ItemData.Items, this.selectedItem, this.topLeftItem,
				Math.min(this.topLeftItem + this.getMaxDisplay(), this.ItemData.Items.length),"series selected highlight" + Main.highlightColour + "Boarder","series","");
	}
};

DisplayOneItem.keyDown = function() {
	var keyCode = event.keyCode;
	alert("DisplayOneItem: Key pressed: " + keyCode);

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
		//Need Logout Key
		case tvKey.KEY_LEFT:
			alert("LEFT");
			this.processLeftKey();
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT");
			this.processRightKey();
			break;
		case tvKey.KEY_UP:
			alert("UP");
			this.processUpKey();
			break;
		case tvKey.KEY_DOWN:
			alert("DOWN");
			this.processDownKey();
			break;
		case tvKey.KEY_PANEL_CH_UP:
		case tvKey.KEY_CH_UP:
			this.processChannelUpKey();
			break;
		case tvKey.KEY_PANEL_CH_DOWN:
		case tvKey.KEY_CH_DOWN:
			this.processChannelDownKey();
			break;
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			Support.processReturnURLHistory();
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			this.processSelectedItem();
			break;
		case tvKey.KEY_PLAY:
			this.playSelectedItem();
			break;
		case tvKey.KEY_GREEN:
			//Watched - May not be needed on this page
			break;
		case tvKey.KEY_YELLOW:
			//Favourites - May not be needed on this page
			break;
		case tvKey.KEY_BLUE:
			MusicPlayer.showMusicPlayer("DisplayOneItem", this.ItemData.Items[this.selectedItem].Id,document.getElementById(this.ItemData.Items[this.selectedItem].Id).className);
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

DisplayOneItem.processSelectedItem = function() {
	clearTimeout(this.backdropTimeout);
	Support.processSelectedItem("DisplayOneItem",this.ItemData,this.startParams,this.selectedItem,this.topLeftItem,null,this.genreType,this.isLatest);
};

DisplayOneItem.playSelectedItem = function () {
	clearTimeout(this.backdropTimeout);
	Support.playSelectedItem("DisplayOneItem",this.ItemData,this.startParams,this.selectedItem,this.topLeftItem,null);
};

DisplayOneItem.openMenu = function() {
	Support.updateURLHistory("DisplayOneItem",this.startParams[0],this.startParams[1],null,null,this.selectedItem,this.topLeftItem,null);
	MainMenu.requested("DisplayOneItem",this.ItemData.Items[this.selectedItem].Id);
};

DisplayOneItem.processLeftKey = function() {
	if (this.selectedItem % this.MAXCOLUMNCOUNT == 0){
		this.openMenu(); //Going left from anywhere in the first column.
	} else {
		this.selectedItem--;
		if (this.selectedItem == -1) {
			this.selectedItem = 0;
			this.openMenu();
		} else {
			if (this.selectedItem < this.topLeftItem) {
				this.topLeftItem = this.selectedItem - (this.getMaxDisplay() - 1);
				if (this.topLeftItem < 0) {
					this.topLeftItem = 0;
				}
				this.updateDisplayedItems();
			}
		}
		this.updateSelectedItems();
	}
};

DisplayOneItem.processRightKey = function() {
	this.selectedItem++;
	if (this.selectedItem >= this.ItemData.Items.length) {
		this.selectedItem--;
	} else {
		if (this.selectedItem >= this.topLeftItem+this.getMaxDisplay() ) {
			this.topLeftItem = this.selectedItem;
			this.updateDisplayedItems();
		}
	}
	this.updateSelectedItems();
};

DisplayOneItem.processUpKey = function() {
	this.selectedItem = this.selectedItem - this.MAXCOLUMNCOUNT;
	if (this.selectedItem < 0) {
		//Check User Setting
		this.selectedItem = this.selectedItem + this.MAXCOLUMNCOUNT;
	} else {
		if (this.selectedItem < this.topLeftItem) {
			if (this.topLeftItem - this.MAXCOLUMNCOUNT < 0) {
				this.topLeftItem = 0;
			} else {
				this.topLeftItem = this.topLeftItem - this.MAXCOLUMNCOUNT;
			}
			this.updateDisplayedItems();
		}
	}
	this.updateSelectedItems();
};

DisplayOneItem.processDownKey = function() {
	this.selectedItem = this.selectedItem + this.MAXCOLUMNCOUNT;
	if (this.selectedItem >= this.ItemData.Items.length) {
		this.selectedItem = (this.ItemData.Items.length-1);
		if (this.selectedItem >= (this.topLeftItem  + this.getMaxDisplay())) {
			this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
			this.updateDisplayedItems();
		}
	} else {
		if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
			this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
			this.updateDisplayedItems();
		}
	}
	this.updateSelectedItems();
};

DisplayOneItem.processChannelUpKey = function() {
	this.selectedItem = this.selectedItem - this.getMaxDisplay();
	if (this.selectedItem < 0) {
		this.selectedItem = 0;
		this.topLeftItem = 0;
		this.updateDisplayedItems();
	} else {
		if (this.topLeftItem - this.getMaxDisplay() < 0) {
			this.topLeftItem = 0;
		} else {
			this.topLeftItem = this.topLeftItem - this.getMaxDisplay();
		}
		this.updateDisplayedItems();
	}
	this.updateSelectedItems();
};

DisplayOneItem.processChannelDownKey = function() {
	this.selectedItem = this.selectedItem + this.getMaxDisplay();
	if (this.selectedItem >= this.ItemData.Items.length) {
		this.selectedItem = (this.ItemData.Items.length-1);
		if (this.selectedItem >= this.topLeftItem + this.getMaxDisplay()) {
			this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
		}
		this.updateDisplayedItems();
	} else {
		this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
		this.updateDisplayedItems();
	}
	this.updateSelectedItems();
};

DisplayOneItem.processIndexing = function() {
	var indexPos = this.ItemIndexData[1];

	this.indexSeekPos++;
	if (this.indexSeekPos >= indexPos.length) {
		this.indexSeekPos = 0;
		this.topLeftItem = 0;
	}

	this.selectedItem = indexPos[this.indexSeekPos];
	this.topLeftItem = this.selectedItem;

	this.updateDisplayedItems();
	this.updateSelectedItems();
};

DisplayOneItem.setPadding = function(title) {
	switch (title) {
	case "MediaFolders":
	case "Collections":
		if (this.ItemData.Items.length <= this.MAXCOLUMNCOUNT) {
			document.getElementById("Center").style.top = "220px";
		} else {
			document.getElementById("Center").style.top = "180px";
		}
		break;
	case "Music":
	case "Albums":
	case "Artists":
		break;
	default:
		if (this.ItemData.Items.length > this.MAXCOLUMNCOUNT * 2) {
			//3 Rows
			document.getElementById("Center").style.top = "120px";
		} else if (this.ItemData.Items.length > this.MAXCOLUMNCOUNT) {
			//2 Rows
			document.getElementById("Center").style.top = "220px";
		} else {
			//1 Row
			document.getElementById("Center").style.top = "180px";
		}
		break;
	}
};

DisplayOneItem.returnFromMusicPlayer = function() {
	this.selectedItem = 0;
	this.updateDisplayedItems();
	this.updateSelectedItems();
};