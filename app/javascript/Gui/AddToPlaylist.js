var AddToPlaylist = {
	ItemData : null,
	ItemData2 : null,
	hasItemInPlaylist : [],
	selectedItem : 0,
	topLeftItem : 0,
	itemId : "",
	playedFromPage : "",
	mediaType : "",
	MAXCOLUMNCOUNT : 1,
	MAXROWCOUNT : 5
};

AddToPlaylist.onFocus = function() {
	Helper.setControlButtons(null, null, null,MusicPlayer.Status == "PLAYING" || MusicPlayer.Status == "PAUSED" ? "Music" : null,"Return");
};

AddToPlaylist.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
};

AddToPlaylist.start=function(itemId, playedFromPage, mediaType) {
	alert("Page Enter : AddToPlaylist");

	//Update page called from
	this.playedFromPage = playedFromPage;
	this.mediaType = mediaType;
	this.selectedItem = 0;
	this.topLeftItem = 0;
	this.itemId = itemId;

	//Get data from Server
	var url = Server.getItemTypeURL("/SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Playlist&Recursive=true&MediaTypes=" + mediaType);
	this.ItemData = Server.getContent(url);
	if (this.ItemData == null) { Support.processReturnURLHistory(); }

	//Set window size based on item count
	if (this.ItemData.Items.length < 6){
		document.getElementById("playListContainer").style.height = (this.ItemData.Items.length*40)+400 +"px";
	} else {
		document.getElementById("playListContainer").style.height = "560px";
	}

	//Create IME - Send it the name of the thing to focus.
	new AddToPlaylist_Input("playListNew");

	if (this.ItemData.Items.length == 0) {
		document.getElementById("guiPlayListExisting").innerHTML = "<div style='padding-top:20px;padding-left:80px;'>You have no existing "+ this.mediaType.toLowerCase() +" playlists.</div>";
		Support.screensaverOff(); // Must turn off as not possible to catch keys!
	} else {
		for (var index = 0; index < this.ItemData.Items.length; index++) {
			url2 = Server.getCustomURL("/Playlists/" + this.ItemData.Items[index].Id+"/Items?format=json&userId="+Server.getUserID());
			this.ItemData2 = Server.getContent(url2);
			if (this.ItemData2 == null) { return; }

			this.hasItemInPlaylist[index] = false;
			for (var index2 = 0; index2 < this.ItemData2.Items.length; index2++) {
				if (this.ItemData2.Items[index2].Id == itemId) {
					this.hasItemInPlaylist[index] = true;
					break;
				}
			}
		}

		this.updateDisplayedItems();
		this.updateSelectedItems();
	}

	//Display Playlist Div
	document.getElementById("playListContainer").style.visibility = "";
};

AddToPlaylist.updateDisplayedItems = function() {
	var htmlToAdd = "<table style='padding-top:20px;padding-left:80px;'><th style='width:460px'>Playlist</th><th style='width:200px'>Exists in Playlist</th>";
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length);index++) {
		var existsInPlaylist = (this.hasItemInPlaylist[index] == true) ? "Yes" : "No";
		htmlToAdd += "<tr><td id='"+this.ItemData.Items[index].Id+"'>"+ this.ItemData.Items[index].Name + "</td><td>"+existsInPlaylist+"</tr>";
	}
	document.getElementById("guiPlayListExisting").innerHTML = htmlToAdd + "</table>";
};

AddToPlaylist.updateSelectedItems = function() {
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length);index++) {
		if (index == this.selectedItem) {
			document.getElementById(this.ItemData.Items[index].Id).style.color = "#27a436";
		} else {
			document.getElementById(this.ItemData.Items[index].Id).style.color = "#f9f9f9";
		}
	}
};

AddToPlaylist.keyDown = function() {
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
		case tvKey.KEY_UP:
			this.processUpKey();
			break;
		case tvKey.KEY_DOWN:
			this.processDownKey();
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			this.processSelectedItem();
			break;
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			document.getElementById("playListContainer").style.visibility = "hidden";
			document.getElementById(this.playedFromPage).focus();
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
		default:
			break;
	}
};

AddToPlaylist.processSelectedItem = function() {
	if (this.hasItemInPlaylist[this.selectedItem] == false) {
		//Send update to server
		Server.addToPlaylist(this.ItemData.Items[this.selectedItem].Id,this.itemId);

		//Don't get a refresh from server, assumes communication works.
		this.hasItemInPlaylist[this.selectedItem] = true;
		this.updateDisplayedItems();
		this.updateSelectedItems();
		document.getElementById("playListResult").innerHTML = "<div style='padding-top:20px;padding-left:80px;'>The "+ this.mediaType.toLowerCase() +" was added to the playlist.</div>";
	} else {
		return;
	}
	//Close
	setTimeout(function(){
		document.getElementById("playListContainer").style.visibility = "hidden";
		document.getElementById("playListResult").innerHTML = "";
		document.getElementById(evnAddToPlaylist.playedFromPage).focus();
	}, 2000);
};

AddToPlaylist.processUpKey = function() {
	this.selectedItem = this.selectedItem - this.MAXCOLUMNCOUNT;
	if (this.selectedItem < 0) {
		this.selectedItem = 0;
	} else {
		if (this.selectedItem < this.topLeftItem) {
			if (this.topLeftItem - this.MAXCOLUMNCOUNT < 0) {
				this.topLeftItem = 0;
			} else {
				this.topLeftItem = this.topLeftItem - this.MAXCOLUMNCOUNT;
			}
			this.updateDisplayedItems();
		}
		this.updateSelectedItems();
	}
};

AddToPlaylist.processDownKey = function() {
	if (this.selectedItem == this.ItemData.Items.length - 1) {
		document.getElementById(this.ItemData.Items[this.selectedItem].Id).style.color = "#f9f9f9";
		Support.screensaverOff(); // Must turn off as not possible to catch keys!
		document.getElementById("playListNew").focus();
	} else {
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
	}
};


//////////////////////////////////////////////////////////////////
//  Input method for entering new playlist name.                //
//////////////////////////////////////////////////////////////////
var AddToPlaylistInput  = function(id) {
	var imeReady = function(imeObject) {
		installFocusKeyCallbacks();
		document.getElementById(id).focus();
	};

	var ime = new IMEShell("playListNew", imeReady,this);
	ime.setKeypadPos(1360,180);
	ime.setKeypadChangeFunc('qwerty',onSwitchToQwerty);
	ime.setKeypadChangeFunc('12key',onSwitchTo12key);

	function onSwitchToQwerty(arg){
		alert("IME selected:" + arg);
		document.getElementById("playListContainer").className = "playlistContainerQwerty";
	}

	function onSwitchTo12key(arg){
		alert("IME selected:"+arg);
		document.getElementById("playListContainer").className = "playlistContainer12key";
	}

	var installFocusKeyCallbacks = function () {
		ime.setKeyFunc(tvKey.KEY_ENTER, function (keyCode) {
			alert("Enter key pressed");

			var playlist = document.getElementById("playListNew").value;
			if (playlist == "") {
				document.getElementById("playListResult").innerHTML = "<div style='padding-top:20px;padding-left:80px;'>Enter a playlist name or press Return to cancel.</div>";
				setTimeout(function(){
					document.getElementById("playListResult").innerHTML = "";
				}, 3000);
				return;
			}
			ime.setString("");

			//Check playlist name doesnt already exist!

			//Sent Server Request
			Server.createPlaylist(playlist,AddToPlaylist.itemId, AddToPlaylist.mediaType);

			document.getElementById("playListResult").innerHTML = "<div style='padding-top:20px;padding-left:80px;'>The playlist was created.</div>";

			//Close
			setTimeout(function(){
				document.getElementById("playListContainer").style.visibility = "hidden";
				document.getElementById("playListResult").innerHTML = "";
				document.getElementById(AddToPlaylist.playedFromPage).focus();
			}, 2000);

			//Reload page!
			//AddToPlaylist.start(AddToPlaylist.itemId,AddToPlaylist.playedFromPage,AddToPlaylist.mediaType);

		});

		ime.setKeyFunc(tvKey.KEY_UP, function (keyCode) {
			Support.screensaver();

			if (AddToPlaylist.ItemData.Items.length > 0 ) {
				AddToPlaylist.updateSelectedItems();
				document.getElementById("evnAddToPlaylist").focus();
			}
		});

		ime.setKeyFunc(tvKey.KEY_RETURN, function (keyCode) {
			widgetAPI.blockNavigation(event);
			//Handle Return
			Support.screensaver();
			document.getElementById("guiPlayListContainer").style.visibility = "hidden";
			document.getElementById(AddToPlaylist.playedFromPage).focus();
		});

		ime.setKeyFunc(tvKey.KEY_EXIT, function (keyCode) {
			widgetAPI.sendExitEvent();
		});
	};
};