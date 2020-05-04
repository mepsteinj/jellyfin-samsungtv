var GuiMusic = {
	AlbumData : null,
	selectedItem : 0, //Vertical
	topLeftItem : 0,
	selectedItem2 : 0, //Horizontal
	MAXCOLUMNCOUNT : 1,
	MAXROWCOUNT : 12,
	startParams : [],
	topMenuItems : ["PlayAll","QueueAll","ShuffleAll","InstantMix"],
	playItems : ["Play_","Queue_","Mix_"]
};

GuiMusic.onFocus = function() {
	this.updateSelectedItems();
	Helper.setControlButtons(null, null, null, MusicPlayer.Status == "PLAYING" || MusicPlayer.Status == "PAUSED" ? "Music" : null, "Return");
};

GuiMusic.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
};

GuiMusic.start = function(title,url,type) { //Type is either MusicAlbum or MusicArtist
	alert("Page Enter : GuiMusic");

	//Save Start Params
	this.startParams = [title,url];

	//Reset Vars
	this.topLeftItem = 0;
	this.selectedItem = -1;
	this.selectedItem2 = 0;

	//Load Data
	this.AlbumData = Server.getContent(url);
	if (this.AlbumData == null) { return; }

	//Set PageContent
	document.getElementById("pageContent").innerHTML = "<div><div id='guiMusic_Title' class='guiMusicTitle'></div> \
		   <div id='guiMusicSubtitle' class='guiMusicSubtitle'></div></div> \
		   <div id='guiMusicDetails' class='guiMusicDetails'> \
		   <div id='guiMusicGlobals' class='guiMusicGlobals'> \
		   <div id='PlayAll' class='guiMusicGlobal'>Play All</div> \
		   <div id='QueueAll' class='guiMusicGlobal'>Queue All</div> \
		   <div id='ShuffleAll' class='guiMusicGlobal'>Shuffle</div> \
		   <div id='InstantMix' class='guiMusicGlobal'>Instant Mix</div></div> \
		<div id='guiMusicOptions' class='guiMusicOptions'></div></div> \
		<div id='guiMusicPoster' class='guiMusicPoster'></div>";
	document.getElementById("counter").innerHTML = "1/" + this.topMenuItems.length;

	//Get Episode Poster
	if (this.AlbumData.Items[0].AlbumPrimaryImageTag) {
		var imgsrc = Server.getImageURL(this.AlbumData.Items[0].AlbumId,"Primary",650,650,0,false,0);
		document.getElementById("guiMusic_Poster").style.backgroundImage = "url("+imgsrc + ")";
	} else {
		document.getElementById("guiMusic_Poster").style.backgroundImage = "url(images/collection.png)";
	}

	//Set Page Title
	if (type == "MusicAlbum") {
		if (this.AlbumData.Items[0].AlbumArtist){
			document.getElementById("guiMusic_Title").innerHTML = this.AlbumData.Items[0].AlbumArtist;
		}
		if (this.AlbumData.Items[0].Album){
			document.getElementById("guiMusic_Subtitle").innerHTML = this.AlbumData.Items[0].Album;
		}
	} else if (type == "MusicArtist") {
		if (this.AlbumData.Items[0].AlbumArtist){
			document.getElementById("guiMusic_Title").innerHTML = this.AlbumData.Items[0].AlbumArtist;
		}
	}

	//Get Page Items
	this.updateDisplayedItems();

	//Update Selected Item
	this.updateSelectedItems();

	//Set Focus for Key Events
	document.getElementById("guiMusic").focus();
};

GuiMusic.updateDisplayedItems = function() {
	var htmlToAdd = "<table class=table><th style='width:66px'></th><th style='width:100px'></th><th style='width:90px'></th><th style='width:66px'></th><th style='width:560px'></th><th style='width:130px'></th>";
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.AlbumData.Items.length); index++){
		if (this.AlbumData.Items[index].ParentIndexNumber && this.AlbumData.Items[index].IndexNumber) {
			TrackDetails = this.AlbumData.Items[index].ParentIndexNumber+"." + this.AlbumData.Items[index].IndexNumber;
		} else if (this.AlbumData.Items[index].IndexNumber) {
			TrackDetails = this.AlbumData.Items[index].IndexNumber;
		} else {
			TrackDetails = "?";
		}

		//Truncate long song names.
		var songName = this.AlbumData.Items[index].Name;
		if (songName.length > 43){
			songName = songName.substring(0,40) + "...";
		}

		htmlToAdd += "<tr><td id=Play_"+this.AlbumData.Items[index].Id+" class='guiMusic_TableTd'>Play</td><td id=Queue_"+this.AlbumData.Items[index].Id+" class='guiMusic_TableTd'>Queue</td><td id=Mix_"+this.AlbumData.Items[index].Id+" class='guiMusic_TableTd'>Mix</td>" +
				"<td class='guiMusic_TableTd'>"+TrackDetails+ "</td><td id="+ this.AlbumData.Items[index].Id +" class='guiMusic_TableTd'>" + songName + "</td>" +
						"<td class='guiMusic_TableTd'>"+Support.convertTicksToTimeSingle(this.AlbumData.Items[index].RunTimeTicks/10000,true)+"</td></tr>";
	}
	document.getElementById("guiMusicOptions").innerHTML = htmlToAdd + "</table>";
};

//Function sets CSS Properties so show which user is selected
GuiMusic.updateSelectedItems = function () {
	if (this.selectedItem == -1) {
		//Highlight the selected global item (PlayAll, Shuffle etc.)
		for (var index = 0; index < this.topMenuItems.length; index++) {
			if (index == this.selectedItem2) {
				document.getElementById(this.topMenuItems[index]).className = "guiMusicGlobal highlight" + Main.highlightColour + "Background";
			} else {
				document.getElementById(this.topMenuItems[index]).className = "guiMusicGlobal";
			}
		}
	} else {
		//Reset the global items.
		for (var index = 0; index < this.topMenuItems.length; index++) {
			document.getElementById(this.topMenuItems[index]).className = "guiMusicGlobal";
		}

		//Highlight the selected list item.
		for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.AlbumData.Items.length); index++){
			if (index == this.selectedItem) {
				for (var index2 = 0; index2 < this.playItems.length; index2++) {
					if (index2 == this.selectedItem2) {
						document.getElementById(this.playItems[index2]+this.AlbumData.Items[index].Id).className = "guiMusicTableTd highlight" + Main.highlightColour + "Background";
					} else {
						document.getElementById(this.playItems[index2]+this.AlbumData.Items[index].Id).className = "guiMusicTableTd";
					}
				}
			} else {
				document.getElementById(this.AlbumData.Items[index].Id).className = "guiMusic_TableTd";
				for (var index2 = 0; index2 < this.playItems.length; index2++) {
					document.getElementById(this.playItems[index2]+this.AlbumData.Items[index].Id).className = "guiMusic_TableTd";
				}
			}
		}
	}

	//Set Counter to be album count or x/3 for top part
	if (this.selectedItem == -1) {
		document.getElementById("counter").innerHTML = (this.selectedItem2 + 1) + "/" + this.topMenuItems.length;
	} else {
		document.getElementById("counter").innerHTML = (this.selectedItem + 1) + "/" + this.AlbumData.Items.length;
	}

};

GuiMusic.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

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
		case tvKey.KEY_LEFT:
			this.processLeftKey();
			break;
		case tvKey.KEY_RIGHT:
			this.processRightKey();
			break;
		case tvKey.KEY_UP:
			this.processUpKey();
		break;
		case tvKey.KEY_DOWN:
			this.processDownKey();
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
		case tvKey.KEY_TOOLS:
			widgetAPI.blockNavigation(event);
			this.openMenu();
			break;
		case tvKey.KEY_YELLOW:
			//Favourites - May not be needed on this page
			break;
		case tvKey.KEY_BLUE:
			if (this.selectedItem == -1) {
				MusicPlayer.showMusicPlayer("Music", this.topMenuItems[this.selectedItem2],"guiMusicGlobal highlight"+Main.highlightColour+"Background");
			} else {
				MusicPlayer.showMusicPlayer("Music", this.playItems[this.selectedItem2]+this.AlbumData.Items[this.selectedItem].Id,"guiMusic_TableTd highlight"+Main.highlightColour+"Background");
			}
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
	}
};

GuiMusic.openMenu = function() {
	Support.updateURLHistory("GuiMusic",this.startParams[0],this.startParams[1],null,null,this.selectedItem,this.topLeftItem,true);
	if (this.selectedItem == -1) {
		MainMenu.requested("Guiusic", this.topMenuItems[this.selectedItem2],"guiMusicGlobal highlight"+Main.highlightColour+"Background");
	} else {
		MainMenu.requested("Music", this.playItems[this.selectedItem2]+this.AlbumData.Items[this.selectedItem].Id,"guiMusicTableTd highlight"+Main.highlightColour+"Background");
	}
};

GuiMusic.processUpKey = function() {
	this.selectedItem--;
	if (this.selectedItem < -1) {
		this.selectedItem = -1;
	} else {
		if (this.selectedItem == -1 && this.selectedItem2 >= 3) {
			this.selectedItem2 = 2;
		}
		if (this.selectedItem == -1) {
			document.getElementById(this.AlbumData.Items[0].Id).style.color = "white";
			for (var index = 0; index < this.playItems.length; index++) {
				document.getElementById(this.playItems[index]+this.AlbumData.Items[0].Id).className = "guiMusic_TableTd";
			}
		}
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

GuiMusic.processDownKey = function() {
	this.selectedItem++;
	if (this.selectedItem == 0) {
		this.selectedItem2 = 0;
	}
	if (this.selectedItem >= this.AlbumData.Items.length) {
		this.selectedItem--;
		if (this.selectedItem >= (this.topLeftItem  + this.getMaxDisplay())) {
			this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
			this.updateDisplayedItems();
		}
	} else {
		if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
			this.topLeftItem++;
			this.updateDisplayedItems();
		}
	}
	this.updateSelectedItems();
};

GuiMusic.processLeftKey = function() {
	this.selectedItem2--;
	if (this.selectedItem2 == -1) {
		this.selectedItem2 = 0;
		this.openMenu();
	} else {
		this.updateSelectedItems();
	}
};

GuiMusic.processRightKey = function() {
	this.selectedItem2++;
	if (this.selectedItem == -1) {
		if (this.selectedItem2 > this.topMenuItems.length-1) {
			this.selectedItem2--;
		} else {
			this.updateSelectedItems();
		}
	} else {
		if (this.selectedItem2 > this.playItems.length-1) {
			this.selectedItem2--;
		} else {
			this.updateSelectedItems();
		}
	}
};

GuiMusic.processSelectedItem = function() {
	if (this.selectedItem == -1) {
		//Is Top Menu Bar
		switch (this.selectedItem2) {
		case 0:
			//Play All
			document.getElementById(this.topMenuItems[this.selectedItem2]).className = document.getElementById(this.topMenuItems[this.selectedItem2]).className.replace("highlight"+Main.highlightColour+"Background","");
			MusicPlayer.start("Album", this.startParams[1] + "&Fields=MediaSources","GuiMusic", false);
			break;
		case 1:
			//Queue All
			MusicPlayer.start("Album", this.startParams[1] + "&Fields=MediaSources","GuiMusic", true);
			break;
		case 2:
			//Shuffle
			document.getElementById(this.topMenuItems[this.selectedItem2]).className = document.getElementById(this.topMenuItems[this.selectedItem2]).className.replace("highlight"+Main.highlightColour+"Background","");
			var url = this.startParams[1].replace("SortBy=SortName","SortBy=Random");
			MusicPlayer.start("Album", url + "&Fields=MediaSources","GuiMusic", false);
			break;
		case 3:
			//Instant Mix
			document.getElementById(this.topMenuItems[this.selectedItem2]).className = document.getElementById(this.topMenuItems[this.selectedItem2]).className.replace("highlight"+Main.highlightColour+"Background","");
			var url = Server.getCustomURL("/Albums/"+this.AlbumData.Items[0].AlbumId + "/InstantMix?format=json&Limit=50&UserId="+Server.getUserID());
			MusicPlayer.start("Album", url + "&Fields=MediaSources","GuiMusic", false);
			break;
		}
	} else {
		switch (this.selectedItem2) {
		case 0:
			//Play
			document.getElementById(this.playItems[this.selectedItem2]+this.AlbumData.Items[this.selectedItem].Id).className = document.getElementById(this.playItems[this.selectedItem2]+this.AlbumData.Items[this.selectedItem].Id).className.replace("highlight"+Main.highlightColour+"Background","");
			var url = Server.getItemInfoURL(this.AlbumData.Items[this.selectedItem].Id);
			MusicPlayer.start("Song", url, "Music", false);
			break;
		case 1:
			//Queue
			var url = Server.getItemInfoURL(this.AlbumData.Items[this.selectedItem].Id);
			MusicPlayer.start("Song", url, "Music", true);
			break;
		case 2:
			//Mix
			document.getElementById(this.playItems[this.selectedItem2]+this.AlbumData.Items[this.selectedItem].Id).className = document.getElementById(this.playItems[this.selectedItem2]+this.AlbumData.Items[this.selectedItem].Id).className.replace("highlight"+Main.highlightColour+"Background","");
			var url = Server.getCustomURL("/Songs/"+this.AlbumData.Items[this.selectedItem].Id + "/InstantMix?format=json&Limit=50&UserId="+Server.getUserID());
			MusicPlayer.start("Album", url + "&Fields=MediaSources", "Music", false);
			break;
		}
	}

	//Genre Instant Mix
	//http://192.168.1.108:28067/jellyfin/MusicGenres/Anime/InstantMix?UserId=4b4c128121aa642086bb225659a7d471&Fields=MediaSources%2CChapters&Limit=50
	//Artist Instant Mix
	//Artist/NameID/InstatnMix?
};