var MusicAZ = {
		Letters : ["#","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","?"],
		selectedItem : 0,
		topLeftItem : 0,

		bannerItems : [],
		tvBannerItems : ["Series","Latest","Upcoming","Genre","A-Z"],
		movieBannerItems : ["All","Unwatched","Latest","Genre","A-Z"],
		musicBannerItems : ["Recent","Frequent","Album","Album Artist", "Artist"],
		selectedBannerItem : 0,

		MAXCOLUMNCOUNT : 10,
		MAXROWCOUNT : 4,

		startParams : [],
		backdropTimeout : null
};

MusicAZ.onFocus = function() {
	Helper.setControlButtons(null, null, null, MusicPlayer.Status == "PLAYING" || MusicPlayer.Status == "PAUSED" ? "Music" : null, "Return");
};

MusicAZ.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
};


MusicAZ.start = function(entryView,selectedItem) {
	alert("Page Enter : MusicAZ");

	//Save Start Vars
	this.startParams = [entryView];

	switch (entryView) {
	case "TV":
		this.bannerItems = this.tvBannerItems;
		break;
	case "Movies":
		this.bannerItems = this.movieBannerItems;
		break;
	default:
		this.bannerItems = this.musicBannerItems;
		break;
	}

	//Reset Vars
	this.selectedItem = (selectedItem == -1) ? 0 : selectedItem;
	alert ("MusixcAZ Selected: " + this.selectedItem);
	this.topLeftItem = 0;

	//Proceed as Normal
	//Update Padding on pageContent
	Support.widgetPutInnerHTML("pageContent",
	"<div id=bannerSelection class='bannerMenu'></div><div id=Center class='SeriesCenter'><div id=content style='padding-top:40px;'></div></div>");

	//Set banner Styling
	document.getElementById("bannerSelection").style.paddingTop="25px";
	document.getElementById("bannerSelection").style.paddingBottom="5px";

	//Display first XX series
	this.updateDisplayedItems();

	//Update Selected Collection CSS
	this.updateSelectedItems(false);

	//Set Banner Items
	var bannerSelection = "";
	for (var index = 0; index < this.bannerItems.length; index++) {
		if (index != this.bannerItems.length-1) {
			bannerSelection += "<div id='bannerItem" + index + "' class='bannerItem bannerItemPadding'>" + this.bannerItems[index].replace(/_/g, ' ') + "</div>";
		} else {
			bannerSelection += "<div id='bannerItem" + index + "' class='bannerItem'>"+this.bannerItems[index].replace(/_/g, ' ') + "</div>";
		}
	}
	Support.widgetPutInnerHTML("bannerSelection", bannerSelection);

	//Update Selected Banner Item
	this.selectedBannerItem = -1;
	this.updateSelectedBannerItems();
	this.selectedBannerItem = 0;

	//Set Focus for Key Events
	document.getElementById("evnMusicAZ").focus();
};

//---------------------------------------------------------------------------------------------------
//      TOP ITEMS HANDLERS
//---------------------------------------------------------------------------------------------------
MusicAZ.updateDisplayedItems = function() {
	var htmlToAdd = "";
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.Letters.length); index++) {
		htmlToAdd += "<div id=" + this.Letters[index] + "><div style='text-align:center;font-size:2.5em;padding-top:30px;'>"+this.Letters[index] + "</div></div>";
	}
	Support.widgetPutInnerHTML("content", htmlToAdd);
};

//Function sets CSS Properties so show which user is selected
MusicAZ.updateSelectedItems = function (bypassCounter) {
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.Letters.length); index++){
		if (index == this.selectedItem) {
			document.getElementById(this.Letters[index]).style.zIndex = "5";
			document.getElementById( this.Letters[index]).className = "Letter seriesSelected";
		} else {
			document.getElementById(this.Letters[index]).style.zIndex = "2";
			document.getElementById(this.Letters[index]).className = "Letter";
		}
	}

	//Update Counter DIV
	if (this.Letters.length == 0) {
	  Support.widgetPutInnerHTML("counter", "");
	} else {
	  Support.widgetPutInnerHTML("counter", (this.selectedItem + 1) + "/" + this.Letters.length);
	}
};

MusicAZ.updateSelectedBannerItems = function() {
	for (var index = 0; index < this.bannerItems.length; index++) {
		if (index == this.selectedBannerItem) {
			if (index != this.bannerItems.length-1) {
				document.getElementById("bannerItem" + index).className = "bannerItem bannerItemPadding highlight" + Main.highlightColour + "Text";
			} else {
				document.getElementById("bannerItem" + index).className = "bannerItem highlight" + Main.highlightColour + "Text";
			}
		} else {
			if (index != this.bannerItems.length-1) {
				if (this.bannerItems[index] == "A-Z") {
					document.getElementById("bannerItem" + index).className = "bannerItem bannerItemPadding offWhite";
				} else {
					document.getElementById("bannerItem" + index).className = "bannerItem bannerItemPadding";
				}
			} else {
				if (this.bannerItems[index] == "A-Z") {
					document.getElementById("bannerItem" + index).className = "bannerItem offWhite";
				} else {
					document.getElementById("bannerItem" + index).className = "bannerItem";
				}
			}
		}
	}
	if (this.selectedItem == -1) {
	  Support.widgetPutInnerHTML("counter", (this.selectedBannerItem+1) + "/" + this.bannerItems.length);
	}
};

MusicAZ.keyDown = function() {
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

	switch(keyCode){
		case tvKey.KEY_LEFT:
			alert("LEFT");
			this.processTopMenuLeftKey();
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT");
			this.processTopMenuRightKey();
			break;
		case tvKey.KEY_DOWN:
			alert ("DOWN");
			this.processTopMenuDownKey();
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			this.processTopMenuEnterKey();
			break;
		case tvKey.KEY_RED:
			//Disabled v0.570d
			//this.processIndexing();
			break;
		case tvKey.KEY_UP:
			this.processTopMenuUpKey();
			break;
		case tvKey.KEY_TOOLS:
			widgetAPI.blockNavigation(event);
			this.openMenu();
			break;
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			Support.processReturnURLHistory();
			break;
		case tvKey.KEY_BLUE:
			//Focus the music player
			if (this.selectedItem == -1) {
				if (this.selectedBannerItem == this.bannerItems.length-1) {
					MusicPlayer.showMusicPlayer("MusicAZ","bannerItem" + this.selectedBannerItem,"bannerItem highlight" + Main.highlightColour + "Text");
				} else {
					MusicPlayer.showMusicPlayer("MusicAZ","bannerItem" + this.selectedBannerItem,"bannerItem bannerItemPadding highlight" + Main.highlightColour + "Text");
				}
			} else {
				MusicPlayer.showMusicPlayer("MusicAZ", this.Letters[this.selectedItem], document.getElementById(this.Letters[this.selectedItem]).className);
			}
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
	}
};

MusicAZ.openMenu = function() {
	if (this.selectedItem == -1) {
		Support.updateURLHistory("MusicAZ", this.startParams[0], null, null, null, this.selectedItem,this.topLeftItem, true);
		if (this.selectedBannerItem == this.bannerItems.length - 1) {
			MainMenu.requested("MusicAZ", "bannerItem" + this.selectedBannerItem, "bannerItem highlight" + Main.highlightColour + "Text");
		} else {
			MainMenu.requested("MusicAZ", "bannerItem" + this.selectedBannerItem, "bannerItem bannerItemPadding highlight" + Main.highlightColour + "Text");
		}
	} else {
		Support.updateURLHistory("MusicAZ", this.startParams[0], null, null, null, this.selectedItem, this.topLeftItem, true);
		MainMenu.requested("MusicAZ", this.Letters[this.selectedItem], document.getElementById(this.Letters[this.selectedItem]).className);
	}
};

MusicAZ.processTopMenuLeftKey = function() {
	if (this.selectedItem == -1) {
		this.selectedBannerItem--;
		if (this.selectedBannerItem == -1) { //Going left from the end of the top menu.
			this.selectedBannerItem = 0;
			this.openMenu();
			return;
		}
		this.updateSelectedBannerItems();
	} else if (this.selectedItem % this.MAXCOLUMNCOUNT == 0){ //Going left from the first column.
		this.openMenu();
	} else {
		this.selectedItem--;
		if (this.selectedItem < 0) {
			this.selectedItem = 0;
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

MusicAZ.processTopMenuRightKey = function() {
	if (this.selectedItem == -1) {
		this.selectedBannerItem++;
		if (this.selectedBannerItem >= this.bannerItems.length) {
			this.selectedBannerItem--;
		}
		this.updateSelectedBannerItems();
	} else {
		this.selectedItem++;
		if (this.selectedItem >= this.Letters.length) {
			this.selectedItem--;
		} else {
			if (this.selectedItem >= this.topLeftItem+this.getMaxDisplay() ) {
				this.topLeftItem = this.selectedItem;
				this.updateDisplayedItems();
			}
		}
		this.updateSelectedItems();
	}
};

MusicAZ.processTopMenuUpKey = function() {
	if (this.selectedItem > (this.MAXCOLUMNCOUNT *2) -1){
		this.selectedItem = this.selectedItem - this.MAXCOLUMNCOUNT +1; //Moving up from the bottom row.
	} else {
		this.selectedItem = this.selectedItem - this.MAXCOLUMNCOUNT; //Moving up to the top row or the menu.
	}
	if (this.selectedItem < 0) {
		this.selectedBannerItem = 0;
		this.selectedItem = -1;
		this.updateSelectedItems();
		//update selected banner item
		this.updateSelectedBannerItems();
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

MusicAZ.processTopMenuDownKey = function() {
	if (this.selectedItem == -1) {
		this.selectedItem = 0;
		this.selectedBannerItem = -1;
		this.updateSelectedBannerItems();
	} else {
		if (this.selectedItem < this.MAXCOLUMNCOUNT +1){
			this.selectedItem = this.selectedItem + this.MAXCOLUMNCOUNT; //Moving down from the top row.
		} else {
			this.selectedItem = this.selectedItem + this.MAXCOLUMNCOUNT -1; //Moving down to the bottom row.
		}

		if (this.selectedItem >= this.Letters.length) {
			if (this.totalRecordCount > this.Letters.length) {
				this.loadMoreItems();

				if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
					this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
					this.updateDisplayedItems();
				}

			} else {
				this.selectedItem = (this.Letters.length-1);
				if (this.selectedItem >= (this.topLeftItem  + this.getMaxDisplay())) {
					this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
					this.updateDisplayedItems();
				}
			}
		} else {
			if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
				this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
				this.updateDisplayedItems();
			}
		}
	}
	this.updateSelectedItems();
};

MusicAZ.processTopMenuEnterKey = function() {
	alert ("TopMenuEnterKey");
	clearTimeout(this.backdropTimeout);

	//Add URL History
	Support.updateURLHistory("MusicAZ", this.startParams[0], null, null, null, this.selectedItem, this.topLeftItem, null);

	if (this.selectedItem == -1) {
		switch (this.bannerItems[this.selectedBannerItem]) {
		case "All":
			var url = Server.getItemTypeURL("&IncludeItemTypes=Movie" + Server.getMoviesViewQueryPart() + "&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&recursive=true");
			DisplaySeries.start("All Movies", url, 0, 0);
			break;
		case "Series":
			var url = Server.getItemTypeURL("&IncludeItemTypes=Series" + Server.getTVViewQueryPart() + "&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&recursive=true");
			DisplaySeries.start("All TV", url, 0, 0);
			break;
		case "Unwatched":
			if (DisplaySeries.isTvOrMovies == 1) {
				var url = Server.getItemTypeURL("&IncludeItemTypes=Movie" + Server.getMoviesViewQueryPart() + "&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&recursive=true&Filters=IsUnPlayed");
				DisplaySeries.start("Unwatched Movies", url, 0, 0);
			}   else {
				var url = Server.getItemTypeURL("&IncludeItemTypes=Series" + Server.getTVViewQueryPart() + "&SortBy=SortName&SortOrder=Ascending&isPlayed=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&recursive=true");
			  DisplaySeries.start("Unwatched TV", url, 0, 0);
			}
			break;
		case "Upcoming":
			TVUpcoming.start();
			break;
		case "Latest":
			if (DisplaySeries.isTvOrMovies == 1) {
				var url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Movie" + Server.getMoviesViewQueryPart() + "&isPlayed=false&IsFolder=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
				DisplaySeries.start("Latest Movies", url, 0, 0);
			} else if (DisplaySeries.isTvOrMovies == 0){
				var url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Episode&isPlayed=false&IsFolder=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
				DisplaySeries.start("Latest TV", url, 0, 0);
			} else {
				var url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Audio&Limit=21&fields=SortName,Genres");
				DisplaySeries.start("Latest Music", url, 0, 0);
			}
			break;
		case "Genre":
			if (DisplaySeries.isTvOrMovies == 1) {
				var url1 = Server.getCustomURL("/Genres?format=json&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Movie"+Server.getMoviesViewQueryPart()+"&Recursive=true&ExcludeLocationTypes=Virtual&Fields=ParentId,SortName,ItemCounts&userId=" + Server.getUserID());
				DisplaySeries.start("Genre Movies", url, 0, 0);
			} else {
				var url1 = Server.getCustomURL("/Genres?format=json&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Series" + Server.getTVViewQueryPart() + "&Recursive=true&ExcludeLocationTypes=Virtual&Fields=ParentId,SortName,ItemCounts&userId=" + Server.getUserID());
			  DisplaySeries.start("Genre TV", url, 0, 0);
			}
			break;
		case "Album":
		case "Album Artist":
		case "Artist":
			Support.removeLatestURL(); //Staying on the same page
			MusicAZ.start(this.bannerItems[this.selectedBannerItem],this.selectedItem);
			break;
		case"A-Z":
			Support.removeLatestURL(); //Staying on the same page
			if (DisplaySeries.isTvOrMovies == 1) {
				MusicAZ.start("Movies", this.selectedItem);
			} else {
				MusicAZ.start("TV", this.selectedItem);
			}
			break;
		case "Recent": //Music Only
			var url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items?format=json&SortBy=DatePlayed&SortOrder=Descending&IncludeItemTypes=Audio&Filters=IsPlayed&Limit=21&Recursive=true&fields=SortName,Genres");
			DisplaySeries.start("Recent Music", url, 0, 0);
			break;
		case "Frequent": //Music Only
			var url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items?format=json&SortBy=PlayCount&SortOrder=Descending&IncludeItemTypes=Audio&Limit=21&Filters=IsPlayed&Recursive=true&fields=SortName,Genres");
		  DisplaySeries.start("Frequent Music", url, 0, 0);
			break;
		}
	} else {
		var urlString = (this.selectedItem == 0) ? "&NameLessThan=A" : "&NameStartsWith=" + this.Letters[this.selectedItem];
		urlString = (this.selectedItem == 27) ? "&NameStartsWithOrGreater=~" : urlString;

		switch (this.startParams[0]) {
			case "Album":
				var url = Server.getItemTypeURL("&IncludeItemTypes=MusicAlbum&Recursive=true&ExcludeLocationTypes=Virtual&fields=SortName,Genres&CollapseBoxSetItems=false" + urlString);
				DisplaySeries.start("Album Music", url, 0, 0);
			break;
			case "Album Artist":
				var url = Server.getCustomURL("/Artists/AlbumArtists?format=json&SortBy=SortName&SortOrder=Ascending&Recursive=true&ExcludeLocationTypes=Virtual&Fields=ParentId,SortName,Genres,ItemCounts&userId=" + Server.getUserID() + urlString);
				MusicArtist.start("Album Artist", url, 0, 0);
				break;
			case "Artist":
				var url = Server.getCustomURL("/Artists?format=json&SortBy=SortName&SortOrder=Ascending&Recursive=true&ExcludeLocationTypes=Virtual&Fields=ParentId,SortName,Genres,ItemCounts&userId=" + Server.getUserID() + urlString);
				DisplaySeries.start("Artist Music", url, 0, 0);
				break;
			case "TV":
				var url = Server.getCustomURL("/Items?format=json&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Series" + Server.getTVViewQueryPart() + "&Recursive=true&CollapseBoxSetItems=false&fields=SortName,Overview,Genres,RunTimeTicks&userId=" + Server.getUserID() + urlString);
			  DisplaySeries.start("Letter TV", url, 0, 0);
				break;
			case "Movies":
				var url = Server.getCustomURL("/Items?format=json&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Movie" + Server.getMoviesViewQueryPart() + "&Recursive=true&CollapseBoxSetItems=false&fields=SortName,Overview,Genres,RunTimeTicks&userId=" + Server.getUserID() + urlString);
				DisplaySeries.start("Letter Movies", url, 0, 0);
				break;
			default:
				break;
		}
	}
};

MusicAZ.returnFromMusicPlayer = function() {
	this.selectedItem = 0;
	this.updateDisplayedItems();
	this.updateSelectedItems();
};