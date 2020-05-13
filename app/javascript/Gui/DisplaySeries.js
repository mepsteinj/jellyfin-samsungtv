var DisplaySeries = {
	ItemData : null,
	ItemIndexData : null,
	totalRecordCount : null,
	currentView : "",
	currentMediaType : "",
	selectedItem : 0,
	selectedBannerItem : 0,
	topLeftItem : 0,
	MAXCOLUMNCOUNT : 9, //Default TV
	MAXROWCOUNT : 3,
	bannerItems : [],
	tvBannerItems : ["Series","Latest","Upcoming","Genre", "A-Z"],
	movieBannerItems : ["All","Unwatched","Latest","Genre", "A-Z"],
	musicBannerItems : ["Recent","Frequent","Album","Album Artist", "Artist"],
	liveTvBannerItems : ["Guide","Channels","Recordings"],
	indexSeekPos : -1,
	indexTimeout : null,
	isResume : false,
	genreType : "",
	isAllorFolder : 0,
	isTvOrMovies : 0,
	startParams : [],
	isLatest : false
};

DisplaySeries.onFocus = function() {
	switch (this.currentMediaType) {
	case "Movies":
	case "TV":
	case "Trailer":
		Helper.setControlButtons(Main.messages.LabButtonFavourite, Main.messages.LabButtonWatched, Main.messages.LabButtonNextIndex, MusicPlayer.Status == "PLAYING" || MusicPlayer.Status == "PAUSED" ? Main.messages.LabButtonMusic : null, Main.messages.LabButtonReturn);
	break;
	case "LiveTV":
		Helper.setControlButtons(Main.messages.LabButtonFavourite, null, null, MusicPlayer.Status == "PLAYING" || MusicPlayer.Status == "PAUSED" ? Main.messages.LabButtonMusic : null, Main.messages.LabButtonReturn);
	break;
	default:
		Helper.setControlButtons(Main.messages.LabButtonFavourite, null, Main.messages.LabButtonNextIndex, MusicPlayer.Status == "PLAYING" || MusicPlayer.Status == "PAUSED" ? Main.messages.LabButtonMusic : null, Main.messages.LabButtonReturn);
	}
};

DisplaySeries.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
};

DisplaySeries.start = function(title, url, selectedItem, topLeftItem, items) {
	alert("Page Enter : DisplaySeries");
	this.onFocus();
	//Save Start Params
	Support.pageLoadTimes("DisplaySeries", "Start", true);
	this.startParams = [title,url];

	//Reset Values
	this.indexSeekPos = -1;
	this.selectedItem = selectedItem;
	this.topLeftItem = topLeftItem;
	this.genreType = null;
	this.isLatest = false;
	this.bannerItems = [];
	this.totalRecordCount = 0;
	this.ItemData = items;

	//Set Display Size from User settings
	this.MAXCOLUMNCOUNT = (File.getUserProperty("LargerView") == true) ? 7 : 9;
	this.MAXROWCOUNT = (File.getUserProperty("LargerView") == true) ? 2 : 3;

	//If items are passed in use those, otherwise process the url.
	if (!this.ItemData) {
		//On show all items pages, there is no limit - For music there is due to speed!
		if (title == "Latest Music" || title == "Recent Music" || title == "Frequent Music") {
			this.ItemData = Server.getContent(url);
			this.totalRecordCount = 21;
		} else {
			this.ItemData = Server.getContent(url + "&Limit="+File.getTVProperty("ItemPaging"));
		}
	}

	if (this.ItemData == null) { Support.processReturnURLHistory(); }
	this.totalRecordCount = (this.totalRecordCount == 0) ? this.ItemData.TotalRecordCount : this.totalRecordCount;
	Support.pageLoadTimes("DisplaySeries","RetrievedServerData", false);

	//Update Padding on pageContent
	Support.widgetPutInnerHTML("pageContent", "<div id=bannerSelection class='bannerMenu'></div>" +
			"<div id=center class='seriesCenter'>" +
				"<div id=content></div>" +
			"</div>" +
			"<div id=seriesContent class='seriesContent'>" +
				"<div id='seriesTitle' class='seriesTitle'></div>" +
				"<div id='seriesSubData' class='seriesSubData'></div>" +
				"<div id='seriesOverview' class='seriesOverview'></div>" +
			"</div>");

	//Split Name - 1st Element = View, 2nd = Type
	var titleArray = title.split(" ");
	if (title == "All TV"){
		this.currentView = "Series";
	} else {
		this.currentView = titleArray[0];
	}
	this.currentMediaType = titleArray[1];

	switch (titleArray[0]) {
	case "Genre":
		this.genreType = (titleArray[1] == "TV") ? "Series" : "Movie";
		break;
	case "Latest":
		this.isLatest = true;
		this.ItemData.Items = this.ItemData;
		Helper.setControlButtons(0,0,null,0,0);
		break;
	}

	if (this.ItemData.Items[0].Type == "ChannelAudioItem" || this.ItemData.Items[0].Type == "AudioPodcast") {
		this.currentMediaType = "AudioPodcast";
	}
	alert(this.currentMediaType);

	switch (this.currentMediaType) {
	case "TV":
		this.isTvOrMovies = 0;
		this.bannerItems = this.tvBannerItems;
		if (File.getUserProperty("LargerView") == true) {
			document.getElementById("seriesContent").style.top="830px";
			document.getElementById("seriesOverview").style.height="250px";
		}
		break;
	case "Movies":
		this.isTvOrMovies = 1;
		this.bannerItems = this.movieBannerItems;
		if (File.getUserProperty("LargerView") == true) {
			document.getElementById("seriesContent").style.top="830px";
			document.getElementById("seriesOverview").style.height="250px";
		}
		break;
	case "Collections":
		this.isTvOrMovies = -1;
		if (File.getUserProperty("LargerView") == true) {
			document.getElementById("seriesContent").style.top="830px";
			document.getElementById("seriesOverview").style.height="250px";
		}
		break;
	case "Music":
		this.MAXCOLUMNCOUNT = 7;
		this.MAXROWCOUNT = 3;
		this.isTvOrMovies = 2;
		this.bannerItems = this.musicBannerItems;
		document.getElementById("seriesContent").style.top="880px";
		document.getElementById("seriesOverview").style.height="0px";
		break;
	case "AudioPodcast":
		this.MAXCOLUMNCOUNT = 7;
		this.MAXROWCOUNT = 3;
		this.isTvOrMovies = 2;
		document.getElementById("seriesContent").style.top="880px";
		document.getElementById("seriesOverview").style.height="0px";
		break;
	case "LiveTV":
		this.MAXCOLUMNCOUNT = 7;
		this.MAXROWCOUNT = 3;
		this.isTvOrMovies = 2;
		this.bannerItems = this.liveTvBannerItems;
		document.getElementById("seriesContent").style.top="880px";
		document.getElementById("seriesOverview").style.height="250px";
		break;
	default:
		this.isTvOrMovies = 1;
		this.bannerItems = [];
		if (File.getUserProperty("LargerView") == true) {
			document.getElementById("seriesContent").style.top="830px";
			document.getElementById("seriesOverview").style.height="250px";
		}
		break;
	}

	//Determine if display is for tv / movies or just a folder
	if (!(this.currentMediaType=="Movies" || this.currentMediaType=="TV" || this.currentMediaType=="LiveTV" || this.currentMediaType=="Music")) {
		alert ("Media Folder");
		this.isAllorFolder = 1;
		this.bannerItems = []; //NEEDED HERE!
		document.getElementById("bannerSelection").style.paddingTop="25px";
		document.getElementById("bannerSelection").style.paddingBottom="10px";
	} else {
		alert ("TV or Movies");
		this.isAllorFolder = 0;
		document.getElementById("bannerSelection").style.paddingTop="25px";
		document.getElementById("bannerSelection").style.paddingBottom="5px";
	}

	if (this.ItemData.Items.length > 0) {
		//Determine if extra top padding is needed for items <= MaxRow
		if (this.MAXROWCOUNT > 2) {
			if (this.ItemData.Items.length <= this.MAXCOLUMNCOUNT * 2) {
				if (this.ItemData.Items.length <= this.MAXCOLUMNCOUNT) {
					document.getElementById("center").style.top = "200px";
				} else {
					document.getElementById("center").style.top = "120px";
				}
			}
		} else {
			if (this.ItemData.Items.length <= this.MAXCOLUMNCOUNT) {
				document.getElementById("center").style.top = "220px";
			}
		}

		//Create banner headers only if all tv or all movies is selected
		var bannerSelection = "";
		if (this.isAllorFolder == 0) {
			for (var index = 0; index < this.bannerItems.length; index++) {
				if (index != this.bannerItems.length - 1) {
					bannerSelection += "<div id='bannerItem" + index + "' class='bannerItem bannerItemPadding'>" + this.bannerItems[index].replace(/_/g, ' ') + "</div>";
				} else {
					bannerSelection += "<div id='bannerItem" + index + "' class='bannerItem'>" + this.bannerItems[index].replace(/_/g, ' ') + "</div>";
				}
			}
		}
		Support.widgetPutInnerHTML("bannerSelection", bannerSelection);

		//Indexing Algorithm
		if (this.currentMediaType != "LiveTV") {
			this.ItemIndexData = Support.processIndexing(this.ItemData.Items);
		}

		//Display first XX series
		this.updateDisplayedItems();
		this.updateSelectedItems();

		this.selectedBannerItem = -1;
		this.updateSelectedBannerItems();
		this.selectedBannerItem = 0;

		//Set Focus for Key Events
		document.getElementById("evnDisplaySeries").focus();
		Support.pageLoadTimes("DisplaySeries", "UserControl", false);

	} else {
		//Set message to user
		Support.widgetPutInnerHTML("counter", "");
		document.getElementById("content").style.fontSize="40px";
		Support.widgetPutInnerHTML("content", "Huh.. Looks like I have no content to show you in this view I'm afraid<br>Press return to get back to the previous screen");

		document.getElementById("noItems").focus();
	}
};

DisplaySeries.updateDisplayedItems = function() {
	if (this.topLeftItem + this.getMaxDisplay() > this.ItemData.Items.length) {
		if (this.totalRecordCount > this.ItemData.Items.length) {
			this.loadMoreItems();
		}
	}

Support.updateDisplayedItems(this.ItemData.Items,this.selectedItem,this.topLeftItem,
		Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length), "content", "", this.isResume, this.genreType);
};

//Function sets CSS Properties so show which user is selected
DisplaySeries.updateSelectedItems = function () {
	if (this.isTvOrMovies == 2 || this.ItemData.Items[0].Type == "ChannelAudioItem") {
		//Music - Use different styles
		Support.updateSelectedNEW(this.ItemData.Items,this.selectedItem, this.topLeftItem,
		Math.min(this.topLeftItem + this.getMaxDisplay(), this.ItemData.Items.length), "music seriesSelected", "music", "", false, this.totalRecordCount);
	} else {
		if (File.getUserProperty("LargerView") == true) {
			Support.updateSelectedNEW(this.ItemData.Items, this.selectedItem, this.topLeftItem,
					Math.min(this.topLeftItem + this.getMaxDisplay(), this.ItemData.Items.length), "seriesPortraitLarge selected highlight" + Main.highlightColour + "Boarder", "seriesPortraitLarge", "", false, this.totalRecordCount);
		} else {
			Support.updateSelectedNEW(this.ItemData.Items, this.selectedItem, this.topLeftItem,
					Math.min(this.topLeftItem + this.getMaxDisplay(), this.ItemData.Items.length), "seriesPortrait seriesSelected highlight" + Main.highlightColour + "Boarder", "seriesPortrait", "", false, this.totalRecordCount);
		}

	}
	var htmlForTitle = this.ItemData.Items[this.selectedItem].Name + "<div style='display:inline-block; position:absolute;'><table style='padding-left:20px;'><tr>";
	var toms = this.ItemData.Items[this.selectedItem].CriticRating;
	var stars = this.ItemData.Items[this.selectedItem].CommunityRating;
	var tomsImage = "";
	var starsImage = "";
	if (toms){
		if (toms > 59){
			tomsImage = "images/fresh-40x40.png";
		} else {
			tomsImage = "images/rotten-40x40.png";
		}
		htmlForTitle += "<td class=MetadataItemIcon style=background-image:url("+tomsImage+")></td>";
		htmlForTitle += "<td class=MetadataItemVSmall>" + toms + "%</td>";
	}
	if (stars){
		if (stars <3.1){
			starsImage = "images/star_empty-46x40.png";
		} else if (stars >=3.1 && stars < 6.5) {
			starsImage = "images/star_half-46x40.png";
		} else {
			starsImage = "images/star_full-46x40.png";
		}
		htmlForTitle += "<td class=MetadataItemIcon style=background-image:url("+starsImage+")></td>";
		htmlForTitle += "<td class=MetadataItemVSmall>" + stars + "</td>";
	}

	if (this.ItemData.Items[this.selectedItem].Type !== undefined
			&& this.ItemData.Items[this.selectedItem].ProductionYear !== undefined) {
		//"" is required to ensure type string is stored!
		var text = "" + Support.SeriesRun(this.ItemData.Items[this.selectedItem].Type, this.ItemData.Items[this.selectedItem].ProductionYear, this.ItemData.Items[this.selectedItem].Status, this.ItemData.Items[this.selectedItem].EndDate);

		if (text.indexOf("Present") > -1) {
			htmlForTitle += "<td class='metadataItemSmallLong'>" + text + "</td>";
		} else {
			htmlForTitle += "<td class='metadataItemSmall'>" + text + "</td>";
		}
	}

	if (this.ItemData.Items[this.selectedItem].OfficialRating !== undefined) {
		htmlForTitle +="<td class='metadataItemSmall'>" + this.ItemData.Items[this.selectedItem].OfficialRating + "</td>";
	}
	if (this.ItemData.Items[this.selectedItem].RecursiveItemCount !== undefined) {
		if (this.isAllorFolder == 1) {
			htmlForTitle += "<td class='metadataItemSmall'>" + this.ItemData.Items[this.selectedItem].RecursiveItemCount + " Items</td>";
			if (this.ItemData.Items[this.selectedItem].RecursiveItemCount == 1){
				htmlForTitle += "<td class='metadataItemSmall'>" + this.ItemData.Items[this.selectedItem].RecursiveItemCount + " Item</td>";
			}
		}
		if (this.isTvOrMovies == 2) {
			htmlForTitle += "<td class='metadataItemSmall'>" + this.ItemData.Items[this.selectedItem].RecursiveItemCount + " Songs</td>";
			if (this.ItemData.Items[this.selectedItem].RecursiveItemCount == 1){
				htmlForTitle += "<td class='metadataItemSmall'>" + this.ItemData.Items[this.selectedItem].RecursiveItemCount + " Song</td>";
			}
		} else {
			if (this.ItemData.Items[this.selectedItem].SeasonCount !== undefined) {
				if (this.ItemData.Items[this.selectedItem].SeasonCount == 1){
					htmlForTitle += "<td class='metadataItemSmall'>" + this.ItemData.Items[this.selectedItem].SeasonCount + " Season</td>";
				} else {
					htmlForTitle += "<td class='metadataItemSmall'>" + this.ItemData.Items[this.selectedItem].SeasonCount + " Seasons</td>";
				}
			}
		}
	}

	if (this.ItemData.Items[this.selectedItem].RunTimeTicks !== undefined) {
		htmlForTitle += "<td class='metadataItemSmall'>" + Support.convertTicksToMinutes(this.ItemData.Items[this.selectedItem].RunTimeTicks/10000) + "</td>";
	}

	if (this.ItemData.Items[this.selectedItem].HasSubtitles) {
		htmlForTitle += "<td class=metadataItemIcon style=background-image:url(images/cc-50x40.png)></td>";
	}
	htmlForTitle += "</tr></table></div>";
	
	var htmlForSubData = "";
	if (this.ItemData.Items[this.selectedItem].Genres !== undefined) {
		htmlForSubData = this.ItemData.Items[this.selectedItem].Genres.join(" / ");
	}

	var htmlForOverview = "";
	if (this.ItemData.Items[this.selectedItem].Overview !== undefined) {
		htmlForOverview = this.ItemData.Items[this.selectedItem].Overview;
	}
	if (this.isTvOrMovies == 2) {
		if (this.ItemData.Items[this.selectedItem].CurrentProgram !== undefined) {
			var programmeURL = Server.getItemInfoURL(this.ItemData.Items[this.selectedItem].CurrentProgram.Id,"");
			var ProgrammeData = Server.getContent(programmeURL);
			Support.widgetPutInnerHTML("seriesTitle", this.ItemData.Items[this.selectedItem].Name);
			Support.widgetPutInnerHTML("seriesSubData", "<font color='red'>On Now: </font>" + this.ItemData.Items[this.selectedItem].CurrentProgram.Name);
			document.getElementById("seriesOverview").style.top = "960px"
			Support.widgetPutInnerHTML("seriesOverview", ProgrammeData.Overview);
			Support.scrollingText("seriesOverview");
		} else {
		  Support.widgetPutInnerHTML("seriesTitle", htmlForTitle);
		  Support.widgetPutInnerHTML("seriesSubData", htmlForSubData);
		  Support.widgetPutInnerHTML("seriesOverview", htmlForOverview);
			Support.scrollingText("seriesOverview");
		}
	} else {
		if (File.getUserProperty("LargerView") == true) {
			Support.widgetPutInnerHTML("seriesTitle", htmlForTitle);
			Support.widgetPutInnerHTML("seriesOverview", htmlForOverview);
			Support.scrollingText("seriesOverview");
		} else {
			document.getElementById("seriesContent").style.top = "960px";
			Support.widgetPutInnerHTML("seriesTitle", htmlForTitle);
		}
	}

	//Background Image
	//Blocking code to skip getting data for items where the user has just gone past it
	//Only for collections (usually small) as a performance enhance - If screen is full of items anyway who cares what the background is.
	var imgsrc = "";
	if  ((this.currentMediaType == "Collections" && this.ItemData.Items[this.selectedItem].Type == "BoxSet") ||
			(this.currentMediaType == "Collections" && this.ItemData.Items[this.selectedItem].Type == "Movie") ||
			(this.currentMediaType == "Music")) {
		var currentSelectedItem = this.selectedItem;
		setTimeout(function(){
			if (DisplaySeries.selectedItem == currentSelectedItem) {
					//A movie.
					if (DisplaySeries.ItemData.Items[currentSelectedItem].BackdropImageTags.length > 0) {
						imgsrc = Server.getBackgroundImageURL(DisplaySeries.ItemData.Items[currentSelectedItem].Id, "Backdrop", Main.backdropWidth,Main.backdropHeight, 0, false, 0, DisplaySeries.ItemData.Items[currentSelectedItem].BackdropImageTags.length);
						Support.fadeImage(imgsrc);
					//A music album.
					} else if (DisplaySeries.ItemData.Items[currentSelectedItem].ParentBackdropImageTags) {
						imgsrc = Server.getBackgroundImageURL(DisplaySeries.ItemData.Items[currentSelectedItem].ParentBackdropItemId, "Backdrop", Main.backdropWidth,Main.backdropHeight, 0, false, 0, DisplaySeries.ItemData.Items[currentSelectedItem].ParentBackdropImageTags.length);
						Support.fadeImage(imgsrc);
					}
			}
		}, 1000);
	}
};

DisplaySeries.updateSelectedBannerItems = function() {
	for (var index = 0; index < this.bannerItems.length; index++) {
		if (index == this.selectedBannerItem) {
			if (index != this.bannerItems.length-1) {
				document.getElementById("bannerItem" + index).className = "bannerItem bannerItemPadding highlight"+Main.highlightColour+"Text";
			} else {
				document.getElementById("bannerItem" + index).className = "bannerItem highlight"+Main.highlightColour+"Text";
			}
		} else {
			if (index != this.bannerItems.length-1) {
				if (this.bannerItems[index] == this.currentView) {
					document.getElementById("bannerItem" + index).className = "bannerItem bannerItemPadding offWhite";
				} else {
					document.getElementById("bannerItem" + index).className = "bannerItem bannerItemPadding";
				}
			} else {
				if (this.bannerItems[index] == this.currentView) {
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

DisplaySeries.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	if (document.getElementById("notifications").style.visibility == "") {
		Notifications.delNotification();
		widgetAPI.blockNavigation(event);
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}

	//Clear Indexing Letter Display timeout & Hide
	//clearTimeout(this.indexTimeout);
	document.getElementById("displaySeriesIndexing").style.opacity = 0;

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
			this.toggleWatchedStatus();
			break;
		case tvKey.KEY_RED:
			if (this.selectedItem > -1) {
				if (this.ItemData.Items[this.selectedItem].UserData.IsFavorite == true) {
					Server.deleteFavourite(this.ItemData.Items[this.selectedItem].Id);
					this.ItemData.Items[this.selectedItem].UserData.IsFavorite = false;
				} else {
					Server.setFavourite(this.ItemData.Items[this.selectedItem].Id);
					this.ItemData.Items[this.selectedItem].UserData.IsFavorite = true;
				}
				DisplaySeries.updateDisplayedItems();
				DisplaySeries.updateSelectedItems();
			}
			break;
		case tvKey.KEY_YELLOW:
			if (!this.isLatest){
				DisplaySeries.processIndexing();
			}
			break;
		case tvKey.KEY_BLUE:
			//Focus the music player
			if (this.selectedItem == -1) {
				if (this.selectedBannerItem == this.bannerItems.length-1) {
					MusicPlayer.showMusicPlayer("DisplaySeries", "bannerItem" + this.selectedBannerItem, "bannerItem highlight" + Main.highlightColour + "Text");
				} else {
					MusicPlayer.showMusicPlayer("DisplaySeries", "bannerItem" + this.selectedBannerItem, "bannerItem bannerItemPadding highlight" + Main.highlightColour + "Text");
				}
			} else {
				MusicPlayer.showMusicPlayer("DisplaySeries", this.ItemData.Items[this.selectedItem].Id, document.getElementById(this.ItemData.Items[this.selectedItem].Id).className);
			}
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

DisplaySeries.processSelectedItem = function() {
	var url = "";
	var url1 = "";
	if (this.selectedItem == -1) {
		switch (this.bannerItems[this.selectedBannerItem]) {
		case "All":
			url = Server.getItemTypeURL("&IncludeItemTypes=Movie" + Server.getMoviesViewQueryPart() + "&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&recursive=true");
			DisplaySeries.start("All Movies", url, 0, 0);
			break;
		case "Series":
			url = Server.getItemTypeURL("&IncludeItemTypes=Series" + Server.getTVViewQueryPart() + "&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&recursive=true");
			DisplaySeries.start("All TV", url, 0, 0);
			break;
		case "Unwatched":
			if (this.isTvOrMovies == 1) {
				url = Server.getItemTypeURL("&IncludeItemTypes=Movie" + Server.getMoviesViewQueryPart() + "&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&recursive=true&Filters=IsUnPlayed");
				DisplaySeries.start("Unwatched Movies", url, 0, 0);
			}
			break;
		case "Upcoming":
			TVUpcoming.start();
			break;
		case "Latest":
			if (this.isTvOrMovies == 1) {
				url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Movie" + Server.getMoviesViewQueryPart() + "&IsFolder=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
				DisplaySeries.start("Latest Movies", url, 0, 0);
			} else if (this.isTvOrMovies == 0){
				url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Episode&IsFolder=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
				DisplaySeries.start("Latest TV",url, 0, 0);
			} else {
				url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Audio&Limit=21&fields=SortName,Genres");
				DisplaySeries.start("Latest Music", url, 0, 0);
			}
			break;
		case "Genre":
			if (this.isTvOrMovies == 1) {
				url1 = Server.getCustomURL("/Genres?format=json&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Movie" + Server.getMoviesViewQueryPart() + "&Recursive=true&ExcludeLocationTypes=Virtual&Fields=ParentId,SortName,ItemCounts&userId=" + Server.getUserID());
				DisplaySeries.start("Genre Movies", url1, 0, 0);
			} else {
				url1 = Server.getCustomURL("/Genres?format=json&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Series" + Server.getTVViewQueryPart() + "&Recursive=true&ExcludeLocationTypes=Virtual&Fields=ParentId,SortName,ItemCounts&userId=" + Server.getUserID());
				DisplaySeries.start("Genre TV", url1, 0, 0);
			}
			break;
		case "Channels":
			Support.updateURLHistory("DisplaySeries", this.startParams[0], this.startParams[1], null, null, 0, 0, false);
			url = Server.getCustomURL("/LiveTV/Channels?StartIndex=0&EnableFavoriteSorting=true&userId=" + Server.getUserID());
			DisplaySeries.start("Channels LiveTV", url, 0, 0);
			break;
		case "Recordings":
			Support.updateURLHistory("DisplaySeries", this.startParams[0], this.startParams[1], null, null, 0, 0, false);
			url = Server.getCustomURL("/LiveTV/Recordings?IsInProgress=false&SortBy=StartDate&SortOrder=Descending&StartIndex=0&fields=SortName&UserId=" + Server.getUserID());
			DisplaySeries.start("Recordings LiveTV", url, 0, 0);
			break;
		case "Guide":
			Support.updateURLHistory("DisplaySeries", this.startParams[0], this.startParams[1], null, null, 0, 0, false);
			url = Server.getCustomURL("/LiveTV/Channels?StartIndex=0&Limit=100&EnableFavoriteSorting=true&UserId=" + Server.getUserID());
			var guideTime = new Date();
			var timeMsec = guideTime.getTime();
			var startTime = timeMsec - 900000; //rewind the clock fifteen minutes.
			guideTime.setTime(startTime);
			TVGuide.start("Guide", url, 0, 0, 0, guideTime);
			break;
		case "Recent":
		case "Frequent":
		case "Album":
		case "Album Artist":
		case "Artist":
			Support.enterMusicPage(this.bannerItems[this.selectedBannerItem]);
			break;
		case"A-Z":
			if (this.isTvOrMovies == 1) {
				MusicAZ.start("Movies", 0);
			} else {
			  MusicAZ.start("TV", 0);
			}
			break;
		}
	} else {
		Support.processSelectedItem("DisplaySeries", this.ItemData,this.startParams, this.selectedItem, this.topLeftItem, null, this.genreType, this.isLatest);
	}
};

DisplaySeries.toggleWatchedStatus = function () {
	var urlSeasons = "";
	var seasons = "";
	if (this.selectedItem > -1) {
		var titleArray = this.startParams[0].split(" ");
		switch (titleArray[1]) {
		case "Movies":
		case "Trailer":
			if (this.ItemData.Items[this.selectedItem].UserData.Played == true) {
				Server.deleteWatchedStatus(this.ItemData.Items[this.selectedItem].Id);
				this.ItemData.Items[this.selectedItem].UserData.Played = false;
			} else {
				Server.setWatchedStatus(this.ItemData.Items[this.selectedItem].Id);
				this.ItemData.Items[this.selectedItem].UserData.Played = true;
			}
			DisplaySeries.updateDisplayedItems();
			DisplaySeries.updateSelectedItems();
			break;
		case "TV": //Mark all episodes of all seasons as watched
			if (this.ItemData.Items[this.selectedItem].UserData.Played == true) {
				Server.deleteWatchedStatus(this.ItemData.Items[this.selectedItem].Id);
				urlSeasons = Server.getChildItemsURL(this.ItemData.Items[this.selectedItem].Id,"&IncludeItemTypes=Season&fields=SortName");
				seasons = Server.getContent(urlSeasons);
				for (var s = 0; s < seasons.Items.length; s++){
					Server.deleteWatchedStatus(seasons.Items[s].Id);
				}
				this.ItemData.Items[this.selectedItem].UserData.Played = false;
			} else {
				Server.setWatchedStatus(this.ItemData.Items[this.selectedItem].Id);
				urlSeasons = Server.getChildItemsURL(this.ItemData.Items[this.selectedItem].Id,"&IncludeItemTypes=Season&fields=SortName");
				seasons = Server.getContent(urlSeasons);
				for (var s = 0; s < seasons.Items.length; s++){
					Server.setWatchedStatus(seasons.Items[s].Id);
				}
				this.ItemData.Items[this.selectedItem].UserData.Played = true;
			}
			DisplaySeries.updateDisplayedItems();
			DisplaySeries.updateSelectedItems();
			break;
		}
	}
};

DisplaySeries.playSelectedItem = function () {
	Support.playSelectedItem("DisplaySeries", this.ItemData, this.startParams, this.selectedItem, this.topLeftItem, null);
};

DisplaySeries.openMenu = function() {
	if (this.selectedItem == -1) { //Banner menu
		if (this.currentView == "All" || this.currentView == "Series") {
			document.getElementById("bannerItem0").class = "bannerItem bannerItemPadding offWhite";
			MainMenu.requested("DisplaySeries","bannerItem0","bannerItem bannerItemPadding highlight" + Main.highlightColour + "Text");
		} else {
			document.getElementById("bannerItem0").class = "bannerItem bannerItemPadding";
			MainMenu.requested("DisplaySeries","bannerItem0","bannerItem bannerItemPadding highlight" + Main.highlightColour + "Text");
		}
	} else if (this.isTvOrMovies == 2) { //Music
		Support.updateURLHistory("DisplaySeries", this.startParams[0], this.startParams[1], null, null, this.selectedItem, this.topLeftItem, null);
		MainMenu.requested("DisplaySeries", this.ItemData.Items[this.selectedItem].Id, "music Selected");
	} else { //TV or Movies
		Support.updateURLHistory("DisplaySeries", this.startParams[0], this.startParams[1], null, null, this.selectedItem, this.topLeftItem, null);
		MainMenu.requested("DisplaySeries", this.ItemData.Items[this.selectedItem].Id, (File.getUserProperty("LargerView") == true) ? "seriesPortraitLarge selected" : "seriesPortrait selected");
	}
};

DisplaySeries.processLeftKey = function() {
	if (this.selectedItem == -1) {
		this.selectedBannerItem--;
		this.updateSelectedBannerItems();
		if (this.selectedBannerItem == -1) { //Going left from the end of the top menu.
			this.selectedBannerItem = 0;
			this.openMenu();
		}
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

DisplaySeries.processRightKey = function() {
	if (this.selectedItem == -1) {
		this.selectedBannerItem++;
		if (this.selectedBannerItem >= this.bannerItems.length) {
			this.selectedBannerItem--;
		}
		this.updateSelectedBannerItems();
	} else {
		this.selectedItem++;
		if (this.selectedItem >= this.ItemData.Items.length) {
			if (this.totalRecordCount > this.ItemData.Items.length) {
				this.loadMoreItems();
				if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
					this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
				}
				this.updateDisplayedItems();
			} else {
				this.selectedItem = this.selectedItem - 1;
			}
		} else {
			if (this.selectedItem >= this.topLeftItem+this.getMaxDisplay() ) {
				this.topLeftItem = this.selectedItem;
				this.updateDisplayedItems();
			}
		}
		this.updateSelectedItems();
	}
};

DisplaySeries.processUpKey = function() {
	this.selectedItem = this.selectedItem - this.MAXCOLUMNCOUNT;
	if (this.selectedItem < 0) {
		if (this.isAllorFolder == 0 && this.startParams[0] != "All Collections" && this.bannerItems.length > 0 ) {
			this.selectedBannerItem = 0;
			this.selectedItem = -1;
			//Hide red - If Music use different styles
			if (this.isTvOrMovies == 2) {
				//Music - Use different styles
				Support.updateSelectedNEW(this.ItemData.Items, this.selectedItem, this.topLeftItem,
						Math.min(this.topLeftItem + this.getMaxDisplay(), this.ItemData.Items.length), "music selected", "music", "");
			} else {
				if (File.getUserProperty("LargerView") == true) {
					Support.updateSelectedNEW(this.ItemData.Items, this.selectedItem, this.topLeftItem,
							Math.min(this.topLeftItem + this.getMaxDisplay(), this.ItemData.Items.length), "seriesPortraitLarge selected", "seriesPortraitLarge", "");
				} else {
					Support.updateSelectedNEW(this.ItemData.Items, this.selectedItem, this.topLeftItem,
							Math.min(this.topLeftItem + this.getMaxDisplay(), this.ItemData.Items.length), "seriesPortrait selected", "seriesPortrait", "");
				}

			}
			//update selected banner item
			this.updateSelectedBannerItems();
		} else {
			this.selectedItem = 0;
			//update selected item
			this.updateSelectedItems();
		}
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

DisplaySeries.processDownKey = function() {
	if (this.selectedItem == -1) {
		this.selectedItem = 0;
		this.selectedBannerItem = -1;
		this.updateSelectedBannerItems();
	} else {
		this.selectedItem = this.selectedItem + this.MAXCOLUMNCOUNT;
		if (this.selectedItem >= this.ItemData.Items.length) {
			if (this.totalRecordCount > this.ItemData.Items.length) {
				this.loadMoreItems();

				if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
					this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
					this.updateDisplayedItems();
				}

			} else {
				this.selectedItem = (this.ItemData.Items.length-1);
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

DisplaySeries.processChannelUpKey = function() {
	if (this.selectedItem > -1) {
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
	}
};

DisplaySeries.processChannelDownKey = function() {
	if (this.selectedItem > -1) {
		this.selectedItem = this.selectedItem + this.getMaxDisplay();
		if (this.selectedItem >= this.ItemData.Items.length) {

			if (this.totalRecordCount > this.ItemData.Items.length) {
				this.loadMoreItems();

				if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
					this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
					this.updateDisplayedItems();
				}
			} else {
				this.selectedItem = (this.ItemData.Items.length-1);
				if (this.selectedItem >= (this.topLeftItem  + this.getMaxDisplay())) {
					this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
					this.updateDisplayedItems();
				}
			}
		} else {
			this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
			this.updateDisplayedItems();
		}
		this.updateSelectedItems();
	}
};

DisplaySeries.processIndexing = function() {
	if (this.currentMediaType == "LiveTV") {
		return;
	}
	if (this.selectedItem > -1) {
		var indexLetter = this.ItemIndexData[0];
		var indexPos = this.ItemIndexData[1];

		var letterSelected = this.ItemData.Items[this.selectedItem].SortName.charAt(0).toLowerCase();
		if(new RegExp("^([^a-z])").test(letterSelected)){
			letterSelected = "#";
		}

		var indexSeekPos = 0; //Safety
		for (var i = 0; i < indexLetter.length; i++) {
			if (letterSelected == indexLetter[i]) {
				indexSeekPos = i+1;
				break;
			}
		}

		if (indexSeekPos >= indexPos.length) {
			//Check if more items, if so load next batch
			if (this.totalRecordCount > this.ItemData.Items.length) {
				this.loadMoreItems();
				//If we were skipping through the alphabet we need to bail here.
				if (this.indexTimeout){
					return;
				}
			} else {
				indexSeekPos = 0;
				this.topLeftItem = 0;
			}
		}

		this.selectedItem = indexPos[indexSeekPos];
		this.topLeftItem = this.selectedItem; //safety net

		for (var i = this.selectedItem; i > this.selectedItem-this.MAXCOLUMNCOUNT; i--) {
			if (i % this.MAXCOLUMNCOUNT == 0) {
				this.topLeftItem = i;
				break;
			}
		}
    Support.widgetPutInnerHTML("displaySeriesIndexing", indexLetter[indexSeekPos].toUpperCase());
		document.getElementById("displaySeriesIndexing").style.opacity = 1;

		clearTimeout(this.indexTimeout);
		this.indexTimeout = setTimeout(function(){
			document.getElementById("displaySeriesIndexing").style.opacity = 0;
			DisplaySeries.updateDisplayedItems();
			DisplaySeries.updateSelectedItems();
		}, 500);


	}
};

DisplaySeries.loadMoreItems = function() {
	if (this.totalRecordCount > this.ItemData.Items.length) {
		Support.pageLoadTimes("DisplaySeries", "GetRemainingItems", true);

		//Show Loading Div
		document.getElementById("playerLoading").style.visibility = "";

		//Remove User Control
		document.getElementById("noKeyInput").focus();

		//Load Data
		var originalLength = this.ItemData.Items.length;
		var ItemDataRemaining = Server.getContent(this.startParams[1] + "&Limit="+File.getTVProperty("ItemPaging") + "&StartIndex=" + originalLength);
		if (ItemDataRemaining == null) { return; }
		Support.pageLoadTimes("DisplaySeries", "GotRemainingItems", false);

		for (var index = 0; index < ItemDataRemaining.Items.length; index++) {
			this.ItemData.Items[index+originalLength] = ItemDataRemaining.Items[index];
		}
		Support.widgetPutInnerHTML("counter", (this.selectedItem + 1) + "/" + this.ItemData.Items.length);

		//Reprocess Indexing Algorithm
		this.ItemIndexData = Support.processIndexing(this.ItemData.Items);

		//Hide Loading Div
		document.getElementById("playerLoading").style.visibility = "hidden";

		//Pass back Control
		document.getElementById("evnDisplaySeries").focus();

		Support.pageLoadTimes("DisplaySeries", "AddedRemainingItems", false);
	}
};

DisplaySeries.returnFromMusicPlayer = function() {
	this.selectedItem = 0;
	this.updateDisplayedItems();
	this.updateSelectedItems();
};