var ItemDetails = {
	ItemData : null,
	itemName : "",
	SimilarFilms : null,
	AdjacentData : null,
	EpisodeData : null,
	menuItems : [],
	selectedItem : 0,
	trailerItems : [],
	trailerUrl : "",
	trailerState : null,
	trailersEnabled : false,
	selectedItem2 : 0,
	topLeftItem2 : 0,
	MAXCOLUMNCOUNT2 : 1,
	MAXROWCOUNT2 : 4,
	backdropTimeout : null,
};

ItemDetails.onFocus = function() {
	Helper.setControlButtons("Favourite", "Watched", ItemDetails.trailerState == sf.service.VideoPlayer.STATE_PLAYING ||
	ItemDetails.trailerState == sf.service.VideoPlayer.STATE_BUFFERING ? "Full Screen" : null, MusicPlayer.Status == "PLAYING" || MusicPlayer.Status == "PAUSED" ? "Music" : null, "Return");
};

ItemDetails.getMaxDisplay2 = function() {
	return this.MAXCOLUMNCOUNT2 * this.MAXROWCOUNT2;
};

ItemDetails.start = function(title,url,selectedItem) {
	alert("Page Enter : ItemDetails");

	//Clear previous trailer
	if (Main.getModelYear() != "D") {
		this.trailersEnabled = true;
		sf.service.VideoPlayer.stop();
		sf.service.VideoPlayer.hide();
	}

	//Save Start Params
	this.startParams = [title,url];

	//Reset Vars
	this.trailerUrl = "";
	this.trailerItems = [];
	this.menuItems.length = 0;
	this.selectedItem = selectedItem;

	//Get Server Data
	this.ItemData = Server.getContent(url);
	if (this.ItemData == null) { Support.processReturnURLHistory(); }

	//Set PageContent
	document.getElementById("pageContent").className = "";
	document.getElementById("pageContent").innerHTML = "<div id='Title'></div> \
			<div id='guiTVEpisodeOptions' class='guiTVEpisodeOptions'></div> \
			<div id='guiTVEpisodeEpisodeImage' class='guiTVEpisodeEpisodeImage'></div> \
			<div id='guiTVEpisodeSubOptions' class='guiTVEpisodeSubOptions'></div> \
			<div id='guiTVEpisodeSubOptionImages' class='guiTVEpisodeSubOptionImages'></div> \
			<div id='guiTVShowMediaAlternative' class='guiTVShowMediaAlternative'></div> \
			<div id='InfoContainer' class='infoContainer'> \
					<div id='guiTVShowTitle' style='font-size:1.7em;'></div> \
					<div id='guiTVShowMetadata' style='margin-left:-5px;'class='MetaDataSeasonTable'></div> \
					<div id='guiTVShowOverview' class='guiFilmOverview'></div> \
			</div> \
			<div id='trailerContainer' class='videoTrailerContainer'></div> \
			<div id='imageDisk' class='imageDisk'></div> \
			<div id='guiTVShow_Poster' class='guiFilmPoster'></div>";

	//Get Page Items
	if (this.ItemData.UserData.PlaybackPositionTicks > 0) {
		this.menuItems.push("guiTV_Episode_Resume");
		this.resumeTicksSamsung = this.ItemData.UserData.PlaybackPositionTicks / 10000;
		document.getElementById("guiTV_Episode_Options").innerHTML += "<div id='guiTV_Episode_Resume' class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/menu/Resume-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>RESUME - "+Support.convertTicksToTimeSingle(this.resumeTicksSamsung)+"</div></div></div>";
	}

	//If the item is a trailer from the trailers channel, make the main play button into a Play Trailer button instead.
	if (this.ItemData.Type == "Trailer" && this.trailersEnabled){
		this.menuItems.push("guiTV_Episode_Play");
		document.getElementById("guiTV_Episode_Options").innerHTML += "<div id='guiTV_Episode_Play' class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY TRAILER</div></div></div>";
	} else if (this.ItemData.LocationType != "Virtual") {
		this.menuItems.push("guiTV_Episode_Play");
		document.getElementById("guiTV_Episode_Options").innerHTML += "<div id='guiTV_Episode_Play' class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY</div></div></div>";
	}

	if (this.ItemData.Chapters.length > 0) {
		this.menuItems.push("guiTV_Episode_Chapters");
		document.getElementById("guiTV_Episode_Options").innerHTML += "<div id='guiTV_Episode_Chapters' class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/menu/Film-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>CHAPTERS</div></div></div>";
	}

	//Options based on item type
	if (this.ItemData.Type == "Episode") {

		//Hide the PiP movie trailer player.
		document.getElementById("trailerContainer").style.visibility="hidden";

		//Get episode image
		if (this.ItemData.ImageTags.Primary) {
			var imgsrc = Server.getImageURL(this.ItemData.Id,"Primary",940,360,0,false,0);
			document.getElementById("guiTV_Episode_EpisodeImage").style.backgroundImage="url('" + imgsrc + "')";
		}

		//Get Series Data
		this.SeriesData = Server.getContent(Server.getItemInfoURL(this.ItemData.SeriesId));
		if (this.SeriesData == null) { return; }

		//Get Episode Data
		var episodesUrl = Server.getChildItemsURL(this.ItemData.SeasonId,"&IncludeItemTypes=Episode&fields=SortName,Overview");
		this.EpisodeData = Server.getContent(episodesUrl);
		if (this.EpisodeData == null) { return; }

		//Browse season episodes
		if (this.EpisodeData.Items.length > 1) {
			this.menuItems.push("guiTV_Episode_Episodes");
			document.getElementById("guiTV_Episode_Options").innerHTML += "<div id='guiTV_Episode_Episodes' class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/menu/TV-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>MORE EPISODES</div></div></div>";
		}

		//Add Cast
		if (this.SeriesData.People.length > 1) {
			this.menuItems.push("guiTV_Episode_Cast");
			document.getElementById("guiTV_Episode_Options").innerHTML += "<div id='guiTV_Episode_Cast' class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/menu/Person-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>CAST</div></div></div>";
		}

		//Add to Playlist Option
		if (this.ItemData.LocationType != "Virtual") {
			this.menuItems.push("guiTV_Episode_Playlist");
			document.getElementById("guiTV_Episode_Options").innerHTML += "<div id='guiTV_Episode_Playlist' class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/menu/AddToList-60x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>ADD TO PLAYLIST</div></div></div>";
		}

		//Set Title
		var title = Support.getNameFormat("", this.ItemData.ParentIndexNumber, this.ItemData.Name, this.ItemData.IndexNumber);
		document.getElementById("guiTVShowTitle").innerHTML = title;

		//If cover art use that else use text
		if (this.ItemData.ParentLogoImageTag) {
			var imgsrc = Server.getImageURL(this.ItemData.SeriesId,"Logo",1000,200,0,false,0);
			document.getElementById("Title").style.backgroundImage="url('"+imgsrc+"')";
			document.getElementById("Title").className = 'FilmInfoLogo';
		} else {
			if (this.ItemData.IndexNumber === undefined) {
				document.getElementById("Title").innerHTML = this.ItemData.SeriesName + " | Season " +  this.ItemData.ParentIndexNumber + " |  Episode Unknown - " + this.ItemData.Name;
			} else {
				document.getElementById("Title").innerHTML = this.ItemData.SeriesName + " | Season " +  this.ItemData.ParentIndexNumber + " |  Episode " +  this.ItemData.IndexNumber + " - " + this.ItemData.Name;
			}
			document.getElementById("Title").className = 'EpisodesSeriesInfo';
		}

		//Set Poster
		if (this.ItemData.SeriesPrimaryImageTag != "") {
			var imgsrc = Server.getImageURL(this.ItemData.ParentId,"Primary",270,400,0,false,0);
			document.getElementById("guiTVShowPoster").style.backgroundImage="url('" + imgsrc + "')";
		}

		//Set Backdrop
		this.backdropTimeout = setTimeout(function(){
			if (ItemDetails.ItemData.ParentBackdropImageTags) {
				var imgsrc = Server.getBackgroundImageURL(ItemDetails.ItemData.ParentBackdropItemId,"Backdrop",Main.backdropWidth,Main.backdropHeight,0,false,0,ItemDetails.ItemData.ParentBackdropImageTags.length);
				Support.fadeImage(imgsrc);
			}
		}, 1000);
	} else {

		//Get trailerItems
		if (this.ItemData.LocalTrailerCount > 0 && this.trailersEnabled) {
			document.getElementById("trailerContainer").style.visibility="";
			var url3 = Server.getCustomURL("/Users/"+Server.getUserID()+"/Items/"+this.ItemData.Id+"/LocalTrailers?format=json");
			this.trailerItems = Server.getContent(url3);
			if (this.trailerItems == null) { return; }

			//Trailers are always transcoded. That way they can be remote streams or local files and we don't need to care.
			this.trailerUrl = Server.getStreamUrl(this.trailerItems[0].Id,this.trailerItems[0].MediaSources[0].Id);
		} else if (this.ItemData.Type == "Trailer"){
			document.getElementById("trailerContainer").style.visibility="";
			this.trailerUrl = Server.getStreamUrl(this.ItemData.Id,this.ItemData.MediaSources[0].Id);
		} else {
			document.getElementById("trailerContainer").style.visibility="hidden";
		}

		//Get suggestions
		var url2 = Server.getCustomURL("/Movies/"+this.ItemData.Id+"/Similar?format=json&IncludeTrailers=false&Limit=5&UserId=" + Server.getUserID());
		this.SimilarFilms = Server.getContent(url2);
		if (this.SimilarFilms == null) { return; }

		if (this.ItemData.People.length > 0) {
			this.menuItems.push("guiTV_Episode_Cast");
			document.getElementById("guiTV_Episode_Options").innerHTML += "<div id='guiTV_Episode_Cast' class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/menu/Person-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>CAST</div></div></div>";
		}

		if (this.SimilarFilms.Items.length > 0) {
			this.menuItems.push("guiTV_Episode_Suggested");
			document.getElementById("guiTV_Episode_Options").innerHTML += "<div id='guiTV_Episode_Suggested' class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/menu/Movies-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>SUGGESTED</div></div></div>";
		}

		//Add to Playlist Option
		if (this.ItemData.LocationType != "Virtual") {
			this.menuItems.push("guiTV_Episode_Playlist");
			document.getElementById("guiTV_Episode_Options").innerHTML += "<div id='guiTV_Episode_Playlist' class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/menu/AddToList-60x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>ADD TO PLAYLIST</div></div></div>";
		}

		//Set Title
		this.itemName = this.ItemData.Name;
		if (this.itemName.length > 42){
			this.itemName = this.itemName.substring(0,42) + "...";
		}
		document.getElementById("guiTVShowTitle").innerHTML = this.itemName;

		//Set Film Poster
		if (this.ItemData.ImageTags.Primary) {
			var imgsrc = Server.getImageURL(this.ItemData.Id,"Primary",270,400,0,false,0);
			document.getElementById("guiTVShowPoster").style.backgroundImage="url('" + imgsrc + "')";
		}

		//Set Film CD
		if (File.getUserProperty("ShowDisc")) {
			if (this.ItemData.ImageTags.Disc) {
				var diskImgsrc = Server.getImageURL(this.ItemData.Id,"Disc",250,250,0,false,0);
				setTimeout(function(){
					document.getElementById("imageDisk").style.backgroundImage="url('" + diskImgsrc + "')";
					document.getElementById("imageDisk").className="imageDisk imageDiskEndPosition";
				}, 1000);
			}
		}

		//Set Film Backdrop
		//this.backdropTimeout = setTimeout(function(){
			if (ItemDetails.ItemData.BackdropImageTags.length > 0) {
				var imgsrc = Server.getBackgroundImageURL(ItemDetails.ItemData.Id,"Backdrop",Main.backdropWidth,Main.backdropHeight,0,false,0,ItemDetails.ItemData.BackdropImageTags.length);
				Support.fadeImage(imgsrc);
			}
		//}, 10);

		//If cover art use that else use text
		if (this.ItemData.ImageTags.Logo) {
			var imgsrc = Server.getImageURL(this.ItemData.Id,"Logo",1000,200,0,false,0);
			document.getElementById("Title").style.backgroundImage="url('"+imgsrc+"')";
			document.getElementById("Title").className = 'FilmInfoLogo';
		} else {
			document.getElementById("Title").innerHTML = this.ItemData.Name;
			document.getElementById("Title").className = 'EpisodesSeriesInfo';
			document.getElementById("Title").style.fontSize = '2em';
		}
	}

	//Set watched and favourite status
	ItemDetails.updateItemUserStatus(this.ItemData);

	//Update Overview
	if (this.ItemData.Overview != null) {
		document.getElementById("guiTVShowOverview").innerHTML = this.ItemData.Overview;
	}

	//Get ratings info.
	var htmlForMetaData = "<table><tr>";
	var toms = this.ItemData.CriticRating;
	var stars = this.ItemData.CommunityRating;
	var tomsImage = "";
	var starsImage = "";
	if (toms){
		if (toms > 59){
			tomsImage = "images/fresh-40x40.png";
		} else {
			tomsImage = "images/rotten-40x40.png";
		}
		htmlForMetaData += "<td class=MetadataItemIcon style=background-image:url("+tomsImage+")></td>";
		htmlForMetaData += "<td class=MetadataItemVSmall )>" + toms + "%</td>";
	}
	if (stars){
		if (stars <3.1){
			starsImage = "images/star_empty-46x40.png";
		} else if (stars >=3.1 && stars < 6.5) {
			starsImage = "images/star_half-46x40.png";
		} else {
			starsImage = "images/star_full-46x40.png";
		}
		htmlForMetaData += "<td class=MetadataItemIcon style=background-image:url("+starsImage+")></td>";
		htmlForMetaData += "<td class=MetadataItemVSmall>" + stars + "</td>";
	}

	if (this.ItemData.Type != "Episode") {
		if (this.ItemData.ProductionYear !== undefined) {
			htmlForMetaData += "<td class='MetadataItemSmall'>" + this.ItemData.ProductionYear + "</td>";
		}
	} else {
		if (this.ItemData.PremiereDate !== undefined) {
			htmlForMetaData += "<td class='MetadataItemSmallLong'>" + Support.AirDate(this.ItemData.PremiereDate,this.ItemData.Type) + "</td>";
			}
	}

	if (this.ItemData.OfficialRating !== undefined) {
		if (this.ItemData.OfficialRating.length < 15) {
			htmlForMetaData += "<td class='MetadataItemSmall'>" + this.ItemData.OfficialRating + "</td>";
		}
	}

	if (this.ItemData.RunTimeTicks !== undefined) {
		htmlForMetaData += "<td class='MetadataItemSmall'>" + Support.convertTicksToMinutes(this.ItemData.RunTimeTicks/10000) + "</td>";
	}

	if (this.ItemData.HasSubtitles) {
		htmlForMetaData += "<td class=MetadataItemIcon style=background-image:url(images/cc-50x40.png)></td>";
	}

	htmlForMetaData += "</tr></table>";
	document.getElementById("guiTVShowMetadata").innerHTML = htmlForMetaData;

	//Set Overview Scroller
	Support.scrollingText("guiTVShowOverview");

	//Process Media Info
	if (this.menuItems.length < 7) {
		this.getMediaInfo();
	} else{
		//Need to add text version here!
	}

	//Set MediaInfo Height (default is 25px)
	if (this.menuItems.length == 5) {
		document.getElementById("guiTVShowMediaAlternative").style.bottom = "45px";
	} else if (this.menuItems.length == 4) {
		document.getElementById("guiTVShowMediaAlternative").style.bottom = "70px";
	} else if (this.menuItems.length < 4) {
		document.getElementById("guiTVShowMediaAlternative").style.bottom = "90px";
	}

	//Update Selected Item
	this.updateSelectedItems();

	//Set Focus for Key Events
	document.getElementById("evnItemDetails").focus();

	//Load theme music if any
	if (this.ItemData.Type == "Episode") {
		MusicPlayer.start("Theme", null, "ItemDetails", null, this.ItemData.SeriesId,this.ItemData.Id);
	} else {
		MusicPlayer.start("Theme", null, "ItemDetails", null, this.ItemData.Id,this.ItemData.Id);
	}
};

//Function sets CSS Properties so show which user is selected
ItemDetails.updateSelectedItems = function () {
	for (var index = 0; index < this.menuItems.length; index++){
		if (index == this.selectedItem) {
			document.getElementById(this.menuItems[index]).className = "FilmListSingle highlight"+Main.highlightColour+"Background";
		} else {
			document.getElementById(this.menuItems[index]).className = "FilmListSingle";
		}
	}

	document.getElementById("counter").innerHTML = (this.selectedItem + 1) + "/" + this.menuItems.length;
	document.getElementById("guiTVEpisodeSubOptions").style.display="none";
	document.getElementById("guiTVEpisodeSubOptionImages").style.display="none";

	if (this.menuItems[this.selectedItem] == "guiTVEpisodePlay" && this.trailerItems.length > 0) {
		document.getElementById("guiTVEpisodeSubOptions").style.display="";
		document.getElementById("guiTVEpisodeSubOptionImages").style.display="";
		this.subMenuItems = ["1"];
		this.selectedItem2 = 0;
		this.topLeftItem2 = 0;
		this.updateDisplayedItems2();
	} else if (this.menuItems[this.selectedItem] == "guiTVEpisodeChapters") {
		document.getElementById("guiTVEpisodeSubOptions").style.display="";
		document.getElementById("guiTVEpisodeSubOptionImages").style.display="";
		this.subMenuItems = this.ItemData.Chapters;
		this.selectedItem2 = 0;
		this.topLeftItem2 = 0;
		this.updateDisplayedItems2();
	} else if (this.menuItems[this.selectedItem] == "guiTVEpisodeEpisodes") {
			document.getElementById("guiTVEpisodeSubOptions").style.display="";
			document.getElementById("guiTVEpisodeSubOptionImages").style.display="";
			this.subMenuItems = this.EpisodeData.Items;
			//Set the previous episode at the top of the More Episodes list.
			if (this.ItemData.IndexNumber) {
				this.selectedItem2 = this.ItemData.IndexNumber -1;
			} else {
				this.selectedItem2 = 0;
			}
			if (this.EpisodeData.Items){
				this.topLeftItem2 = Math.min(Math.max(this.ItemData.IndexNumber -2,0), this.EpisodeData.Items.length -4);
				if (this.topLeftItem2 < 0){
					this.topLeftItem2 = 0;
				}
			} else {
				this.topLeftItem2 = 0;
			}


			this.updateDisplayedItems2();
	} else if (this.menuItems[this.selectedItem] == "guiTVEpisodCast") {
		document.getElementById("guiTVEpisodeSubOptions").style.display="";
		document.getElementById("guiTVEpisodeSubOptionImages").style.display="";
		if (this.ItemData.Type == "Episode") {
			this.subMenuItems = this.SeriesData.People;
			if (this.ItemData.People !== undefined){
				this.subMenuItems.push.apply(this.subMenuItems, this.ItemData.People);
			}

		} else {
			this.subMenuItems = this.ItemData.People;
		}
		this.selectedItem2 = 0;
		this.topLeftItem2 = 0;
		this.updateDisplayedItems2();
	} else if (this.menuItems[this.selectedItem] == "guiTVEpisodeSuggested") {
		document.getElementById("guiTVEpisodeSubOptions").style.display="";
		document.getElementById("guiTVEpisodeSubOptionImages").style.display="";
		this.subMenuItems = this.SimilarFilms.Items;
		this.selectedItem2 = 0;
		this.topLeftItem2 = 0;
		this.updateDisplayedItems2();
	}
};

ItemDetails.keyDown = function()
{
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
			if (this.selectedItem > 0) {
				this.selectedItem--;
				this.updateSelectedItems();
			}
		break;
		case tvKey.KEY_DOWN:
			this.selectedItem++;
			if (this.selectedItem > this.menuItems.length-1) {
				this.selectedItem--;
			} else {
				this.updateSelectedItems();
			}
		break;
		case tvKey.KEY_LEFT:
			alert ("LEFT");
				this.processLeftKey();
			break;
		case tvKey.KEY_RIGHT:
			alert ("RIGHT");
			this.processRightKey();
			break;
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			if (this.trailersEnabled){
				if (this.trailerState == sf.service.VideoPlayer.STATE_PLAYING ||
						this.trailerState == sf.service.VideoPlayer.STATE_BUFFERING ||
						this.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
					sf.service.VideoPlayer.stop();
					//Turn On Screensaver
					Support.screensaverOn();
					Support.screensaver();
				}
				if (this.trailerState != null) {
					sf.service.VideoPlayer.hide();
				}
			}
			Support.processReturnURLHistory();
			break;
		case tvKey.KEY_STOP:
			if (this.trailersEnabled){
				if (this.trailerState == sf.service.VideoPlayer.STATE_PLAYING ||
						this.trailerState == sf.service.VideoPlayer.STATE_BUFFERING ||
						this.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
					sf.service.VideoPlayer.stop();
					sf.service.VideoPlayer.hide();
				}
				//Set the trailer button back to Play
				if (this.ItemData.Type == "Trailer"){
					document.getElementById("guiTV_Episode_Play").innerHTML = "<div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY TRAILER</div></div>";
				} else if (this.selectedItem == 0) {
					document.getElementById("guiTV_Episode_SubOptions").innerHTML = "<div id=0 class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY TRAILER</div></div></div>";
				}
			}
			break;
		case tvKey.KEY_PLAY:
			if (this.trailersEnabled){
				if (this.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
					sf.service.VideoPlayer.resume();
				}
			}
			break;
		case tvKey.KEY_PAUSE:
			if (this.trailersEnabled){
				if (this.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
					sf.service.VideoPlayer.resume();
				} else {
					sf.service.VideoPlayer.pause();
				}
			}
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
		case tvKey.KEY_RED:
			if (this.ItemData.UserData.IsFavorite == true) {
				Server.deleteFavourite(this.ItemData.Id);
				this.ItemData.UserData.IsFavorite = false;
			} else {
				Server.setFavourite(this.ItemData.Id);
				this.ItemData.UserData.IsFavorite = true;
			}
			ItemDetails.updateItemUserStatus(this.ItemData);
			break;
		case tvKey.KEY_GREEN:
			if (this.ItemData.MediaType == "Video") {
				if (this.ItemData.UserData.Played == true) {
					Server.deleteWatchedStatus(this.ItemData.Id);
					this.ItemData.UserData.Played = false;
				} else {
					Server.setWatchedStatus(this.ItemData.Id);
					this.ItemData.UserData.Played = true;
				}
				ItemDetails.updateItemUserStatus(this.ItemData);
			}
			break;
		case tvKey.KEY_YELLOW:
			if (this.trailersEnabled){
				if (this.trailerState == sf.service.VideoPlayer.STATE_PLAYING ||
						this.trailerState == sf.service.VideoPlayer.STATE_PAUSED ||
						this.trailerState == sf.service.VideoPlayer.STATE_BUFFERING) {
					sf.service.VideoPlayer.setFullScreen(true);
					document.getElementById('sf-service-videoplayer-full-infobar').style.display= 'none';
					document.getElementById('sf-service-videoplayer-full-helpbar').style.display= 'none';
				}
			}
			break;
		case tvKey.KEY_BLUE:
			MusicPlayer.showMusicPlayer("ItemDetails",this.menuItems[this.selectedItem],document.getElementById(this.menuItems[this.selectedItem]).className);
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
	}
};

ItemDetails.updateItemUserStatus = function(item) { //Watched and Favourite status
	var addSpan = "";
	if (item.UserData.IsFavorite == true && this.ItemData.UserData.Played == true) {
		addSpan = "<span class='itemPageFavourite' style='padding-left:20px;'></span><span class='itemPageWatched highlight"+Main.highlightColour+"Background'>&#10003</span>";
	} else if (item.UserData.Played == true) {
		addSpan = "<span class='itemPageWatched highlight"+Main.highlightColour+"Background'>&#10003</span>";
	} else if (item.UserData.IsFavorite == true) {
		addSpan = "<span class='itemPageFavourite' style='padding-left:20px;'></span>";
	}
	var title = Support.getNameFormat("", this.ItemData.ParentIndexNumber, this.ItemData.Name, this.ItemData.IndexNumber);
	document.getElementById("guiTVShowTitle").innerHTML = (this.ItemData.Type == "Episode") ? title : this.itemName;
	document.getElementById("guiTVShowTitle").innerHTML += addSpan;
};

ItemDetails.openMenu = function() {
	Support.updateURLHistory("ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
	document.getElementById(this.menuItems[this.selectedItem]).className = "FilmListSingle";
	MainMenu.requested("ItemDetails",this.menuItems[this.selectedItem], "filmListSingle highlight" + Main.highlightColour + "Background");
};

ItemDetails.processLeftKey = function() {
	if (this.trailerState == sf.service.VideoPlayer.STATE_PLAYING ||
			this.trailerState == sf.service.VideoPlayer.STATE_BUFFERING) {
		sf.service.VideoPlayer.pause();
	}
	if (this.trailerState != null) {
		sf.service.VideoPlayer.hide();
	}
	this.openMenu();
};

ItemDetails.processRightKey = function() {
	if (this.menuItems[this.selectedItem] == "guiTV_Episode_Play" &&
			this.ItemData.LocalTrailerCount > 0 && this.trailersEnabled) {
		document.getElementById(this.menuItems[this.selectedItem]).className = "FilmListSingle";
		this.updateSelectedItems2();
		document.getElementById("evnItemDetailsSub").focus();
	} else if (this.menuItems[this.selectedItem] == "guiTV_Episode_Play" ||
				this.menuItems[this.selectedItem] == "guiTV_Episode_Resume" ||
				this.menuItems[this.selectedItem] == "guiTV_Episode_Playlist" ) {
		return;
	} else {
		this.processSelectedItem();
	}
};

ItemDetails.processSelectedItem = function() {
	switch (this.menuItems[this.selectedItem]) {
	case "guiTV_Episode_Play":
	case "guiTV_Episode_Resume":
		if (this.ItemData.Type == "Trailer" && this.trailersEnabled){
			//Trailer playback
			if (this.trailerState == sf.service.VideoPlayer.STATE_PLAYING ||
					this.trailerState == sf.service.VideoPlayer.STATE_BUFFERING ||
					this.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
				sf.service.VideoPlayer.stop();
				sf.service.VideoPlayer.hide();
				//Turn on Screensaver
				Support.screensaverOn();
				Support.screensaver();
				//Update buttons
				Helper.setControlButtons("Favourite","Watched",null,null,"Return");
				document.getElementById("guiTV_Episode_Play").innerHTML = "<div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY TRAILER</div></div>";
			} else {
				this.playTrailer(this.trailerUrl);
				//Update buttons
				Helper.setControlButtons("Favourite","Watched","Full Screen",null,"Return");
				document.getElementById("guiTV_Episode_Play").innerHTML = "<div class='FilmListSingleImage' style=background-image:url(images/menu/Stop-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>STOP TRAILER</div></div>";
			}
		} else {
			//Feature playback
			//Stop the trailer
			if (this.trailerState == sf.service.VideoPlayer.STATE_PLAYING ||
					this.trailerState == sf.service.VideoPlayer.STATE_BUFFERING ||
					this.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
				sf.service.VideoPlayer.stop();
			}
			if (this.trailerState != null) {
				sf.service.VideoPlayer.hide();
			}
			Support.updateURLHistory("ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
			var url = Server.getItemInfoURL(this.ItemData.Id,"&ExcludeLocationTypes=Virtual");
			var playbackPos = (this.menuItems[this.selectedItem] == "guiTV_Episode_Resume") ? this.ItemData.UserData.PlaybackPositionTicks / 10000 : 0;
			alert (url);
			GuiPlayer.start("PLAY",url,playbackPos,"ItemDetails");
		}
		break;
	case "guiTV_Episode_Chapters":
	case "guiTV_Episode_Episodes":
	case "guiTV_Episode_Cast":
	case "guiTV_Episode_Suggested":
		document.getElementById(this.menuItems[this.selectedItem]).className = "FilmListSingle";
		this.updateSelectedItems2();
		document.getElementById("evnItemDetailsSub").focus();
		break;
	case "guiTV_Episode_Playlist":
		//Stop the trailer.
		if (this.trailerState == sf.service.VideoPlayer.STATE_PLAYING ||
				this.trailerState == sf.service.VideoPlayer.STATE_BUFFERING ||
				this.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
			sf.service.VideoPlayer.stop();
		}
		if (this.trailerState != null) {
			sf.service.VideoPlayer.hide();
		}
		GuiAddToPlaylist.start(this.ItemData.Id,"ItemDetails",this.ItemData.MediaType);
		break;
	default:
		break;
	}
};

//----------------------------------------------------------------------------------------------------------------------------------

ItemDetails.updateDisplayedItems2 = function() {
	var htmlToAdd = "";
	var htmlToAdd2 = "";
	for (var index = this.topLeftItem2; index < Math.min(this.topLeftItem2 + this.getMaxDisplay2(),this.subMenuItems.length);index++) {
		switch (this.menuItems[this.selectedItem]) {
		case "guiTV_Episode_Play":
			if (this.trailerState == sf.service.VideoPlayer.STATE_PLAYING ||
					this.trailerState == sf.service.VideoPlayer.STATE_BUFFERING ||
					this.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
				htmlToAdd += "<div id="+index+" class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/menu/Stop-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>STOP TRAILER</div></div></div>";
			} else {
				htmlToAdd += "<div id="+index+" class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY TRAILER</div></div></div>";
			}
			break;
		case "guiTV_Episode_Chapters":
			var resumeTicksSamsung = this.subMenuItems[index].StartPositionTicks / 10000;
			htmlToAdd += "<div id="+index+" class='FilmListSubSingle'><div style='width:340px;'>"+this.subMenuItems[index].Name+"<br>"+Support.convertTicksToTimeSingle(resumeTicksSamsung)+"</div></div>";
			var imgsrc = Server.getImageURL(this.ItemData.Id,"Chapter",210,116,null,null,null,index);
			htmlToAdd2 += "<div class='EpisodeSubListSingleImage' style=background-image:url(" +imgsrc+ ")></div>";
			break;
		case "guiTV_Episode_Episodes":
			var title = "";
			if (this.subMenuItems[index].IndexNumber === undefined) {
				title = this.subMenuItems[index].Name;
			} else {
				title = this.subMenuItems[index].IndexNumber + " - " + this.subMenuItems[index].Name;
			}
			htmlToAdd += "<div id="+index+" class='FilmListSubSingle'><div style='width:340px;'>"+ title;
			var progress = Math.round((340 / 100) * Math.round(this.subMenuItems[index].UserData.PlayedPercentage));
			if (progress > 1){
				htmlToAdd += "<div class=menuProgressBar></div><div class=menuProgressBarCurrent style='width:"+progress+"px;'></div>";
			}
			htmlToAdd +=  "</div></div>";
			if (this.subMenuItems[index].ImageTags.Primary) {
				var imgsrc = Server.getImageURL(this.subMenuItems[index].Id,"Primary",210,116,0,false,0);
				htmlToAdd2 += "<div class='EpisodeSubListSingleImage' style=background-image:url(" +imgsrc+ ")>";
			} else {
				htmlToAdd2 += "<div class='EpisodeSubListSingleImage'>";
			}
			//Add watched and favourite overlays.
			if (this.subMenuItems[index].UserData.Played) {
				htmlToAdd2 += "<div class='moreEpisodesWatchedItem highlight"+Main.highlightColour+"Background' style=align:right>&#10003</div>";
			}
			if (this.subMenuItems[index].UserData.IsFavorite) {
				htmlToAdd2 += "<div class=moreEpisodesFavouriteItem></div>";
			}
			if (this.subMenuItems[index].LocationType == "Virtual"){
				imageMissingOrUnaired = (Support.FutureDate(this.subMenuItems[index].PremiereDate) == true) ? "ShowListSingleUnaired" : "ShowListSingleMissing";
				htmlToAdd2 += "<div class='"+imageMissingOrUnaired+"'></div>";
			}
			htmlToAdd2 += "</div>";

			break;
		case "guiTV_Episode_Cast":
			if (this.subMenuItems[index].Type == "Actor" && this.subMenuItems[index].Role !== undefined){
				htmlToAdd += "<div id="+index+" class='FilmListSubSingle'><div style='width:460px;'>"+this.subMenuItems[index].Name+"<br>as "+this.subMenuItems[index].Role+"</div></div>";
			} else {
				htmlToAdd += "<div id="+index+" class='FilmListSubSingle'><div style='width:460px;'>"+this.subMenuItems[index].Name+"<br>"+this.subMenuItems[index].Type+"</div></div>";
			}
			var imgsrc = Server.getImageURL(this.subMenuItems[index].Id,"Primary",210,116,0,false,0);
			htmlToAdd2 += "<div class='EpisodeSubListSingleImage' style=background-image:url(" +imgsrc+ ")></div>";
			break;
		case "guiTV_Episode_Suggested":
			htmlToAdd += "<div id="+index+" class='FilmListSubSingle'><div style='width:480px;'>"+this.subMenuItems[index].Name+"</div></div>";
			var imgsrc = Server.getImageURL(this.subMenuItems[index].Id,"Primary",210,116,0,false,0);
			htmlToAdd2 += "<div class='EpisodeSubListSingleImage' style=background-image:url(" +imgsrc+ ")></div>";
			break;
		}
	}
	document.getElementById("guiTV_Episode_SubOptions").innerHTML = htmlToAdd;
	document.getElementById("guiTV_Episode_SubOptionImages").innerHTML = htmlToAdd2;
};

ItemDetails.updateSelectedItems2 = function() {
	for (var index = this.topLeftItem2; index < Math.min(this.topLeftItem2 + this.getMaxDisplay2(),this.subMenuItems.length);index++) {
		if (this.menuItems[this.selectedItem] == "guiTV_Episode_Play") {
			if (index == this.selectedItem2) {
					document.getElementById(index).className = "FilmListSingle highlight"+Main.highlightColour+"Background";
			} else {
					document.getElementById(index).className = "FilmListSingle";
			}
		} else {
			if (index == this.selectedItem2) {
				document.getElementById(index).className = "FilmListSubSingle highlight"+Main.highlightColour+"Background";
			} else {
				document.getElementById(index).className = "FilmListSubSingle";
			}
		}
	}
	document.getElementById("counter").innerHTML = (this.selectedItem2 + 1) + "/" + this.subMenuItems.length;
};

ItemDetails.subKeyDown = function() {
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

	switch(keyCode)
	{
		case tvKey.KEY_UP:
			this.selectedItem2--;
			if (this.selectedItem2 < 0) {
				this.selectedItem2++;
			}
			if (this.selectedItem2 < this.topLeftItem2) {
				this.topLeftItem2--;
				this.updateDisplayedItems2();
			}
			this.updateSelectedItems2();
		break;
		case tvKey.KEY_DOWN:
			this.selectedItem2++;
			if (this.selectedItem2 > this.subMenuItems.length-1) {
				this.selectedItem2--;
			}
			if (this.selectedItem2 >= this.topLeftItem2 + this.getMaxDisplay2()) {
				this.topLeftItem2++;
				this.updateDisplayedItems2();
			}
			this.updateSelectedItems2();
			break;
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			if (this.trailerState == sf.service.VideoPlayer.STATE_PLAYING ||
					this.trailerState == sf.service.VideoPlayer.STATE_BUFFERING ||
					this.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
				sf.service.VideoPlayer.stop();
				//Turn On Screensaver
				Support.screensaverOn();
				Support.screensaver();
			}
			if (this.trailerState != null) {
				sf.service.VideoPlayer.hide();
			}
			Support.processReturnURLHistory();
			break;
		case tvKey.KEY_LEFT:
			alert("RETURN Sub");
			widgetAPI.blockNavigation(event);
			document.getElementById("counter").innerHTML = (this.selectedItem + 1) + "/" + this.menuItems.length;
			if (this.menuItems[this.selectedItem] == "guiTV_Episode_Play") {
				document.getElementById(this.menuItems[this.selectedItem]).className = "FilmListSingle highlight"+Main.highlightColour+"Background";
				document.getElementById(this.selectedItem2).className = "FilmListSingle";
			} else {
				document.getElementById(this.menuItems[this.selectedItem]).className = "FilmListSingle highlight"+Main.highlightColour+"Background";
				document.getElementById(this.selectedItem2).className = "FilmListSubSingle";
			}
			document.getElementById("evnItemDetails").focus();
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			this.processSelectedItem2();
			break;
		case tvKey.KEY_PLAY:
			alert("PLAY");
			this.playSelectedItem2();
			break;
		case tvKey.KEY_STOP:
			if (this.trailersEnabled){
				if (this.trailerState == sf.service.VideoPlayer.STATE_PLAYING ||
						this.trailerState == sf.service.VideoPlayer.STATE_BUFFERING ||
						this.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
					sf.service.VideoPlayer.stop();
					sf.service.VideoPlayer.hide();
				}
				//If the trailer button is visible when a trailer ends, update it.
				if (this.selectedItem == 0) {
					var htmlToAdd = "<div id=0 class='FilmListSingle highlight"+Main.highlightColour+"Background'><div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY TRAILER</div></div></div>";
					document.getElementById("guiTV_Episode_SubOptions").innerHTML = htmlToAdd;
				}
				//Turn On Screensaver
				Support.screensaverOn();
				Support.screensaver();
			}
			break;
		case tvKey.KEY_PAUSE:
			if (this.trailersEnabled){
				if (this.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
					sf.service.VideoPlayer.resume();
				} else {
					sf.service.VideoPlayer.pause();
				}
			}
			break;
		case tvKey.KEY_RED:
			if (this.ItemData.UserData.IsFavorite == true) {
				Server.deleteFavourite(this.ItemData.Id);
				this.ItemData.UserData.IsFavorite = false;
			} else {
				Server.setFavourite(this.ItemData.Id);
				this.ItemData.UserData.IsFavorite = true;
			}
			ItemDetails.updateItemUserStatus(this.ItemData);
			break;
		case tvKey.KEY_GREEN:
			if (this.ItemData.MediaType == "Video") {
				if (this.ItemData.UserData.Played == true) {
					Server.deleteWatchedStatus(this.ItemData.Id);
					this.ItemData.UserData.Played = false;
				} else {
					Server.setWatchedStatus(this.ItemData.Id);
					this.ItemData.UserData.Played = true;
				}
				ItemDetails.updateItemUserStatus(this.ItemData);
			}
			break;
		case tvKey.KEY_YELLOW:
			if (this.trailersEnabled){
				if (this.trailerState == sf.service.VideoPlayer.STATE_PLAYING ||
						this.trailerState == sf.service.VideoPlayer.STATE_PAUSED ||
						this.trailerState == sf.service.VideoPlayer.STATE_BUFFERING) {
					sf.service.VideoPlayer.setFullScreen(true);
					document.getElementById('sf-service-videoplayer-full-infobar').style.display= 'none';
					document.getElementById('sf-service-videoplayer-full-helpbar').style.display= 'none';
				}
			}
			break;
		case tvKey.KEY_BLUE:
			MusicPlayer.showMusicPlayer("ItemDetailsSub", this.selectedItem2,document.getElementById(this.selectedItem2).className);
			break;
		case tvKey.KEY_TOOLS:
			widgetAPI.blockNavigation(event);
			Support.updateURLHistory("ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
			document.getElementById(this.selectedItem2).className = "FilmListSubSingle";
			MainMenu.requested("ItemDetailsSub",this.selectedItem2,"FilmListSubSingle highlight"+Main.highlightColour+"Background");
			break;
		case tvKey.KEY_INFO:
			alert ("INFO KEY");
			Helper.toggleHelp("ItemDetails");
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
	}
};

ItemDetails.processSelectedItem2 = function() {
	switch (this.menuItems[this.selectedItem]) {
	case "guiTV_Episode_Play":
		//Trailer playback
		var htmlToAdd = "";
		if (this.trailerState == sf.service.VideoPlayer.STATE_PLAYING ||
				this.trailerState == sf.service.VideoPlayer.STATE_BUFFERING ||
				this.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
			sf.service.VideoPlayer.stop();
			sf.service.VideoPlayer.hide();
			//Turn on Screensaver
			Support.screensaverOn();
			Support.screensaver();
			//Update buttons
			Helper.setControlButtons("Favourite","Watched",null,null,"Return");
			htmlToAdd += "<div id=0 class='FilmListSingle highlight"+Main.highlightColour+"Background'><div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY TRAILER</div></div></div>";
		} else {
			this.playTrailer(this.trailerUrl);
			//Update buttons
			Helper.setControlButtons("Favourite","Watched","Full Screen",null,"Return");
			htmlToAdd += "<div id=0 class='FilmListSingle highlight"+Main.highlightColour+"Background'><div class='FilmListSingleImage' style=background-image:url(images/menu/Stop-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>STOP TRAILER</div></div></div>";
		}
		document.getElementById("guiTV_Episode_SubOptions").innerHTML = htmlToAdd;
		break;
	case "guiTV_Episode_Chapters":
		Support.updateURLHistory("ItemDetails",this.startParams[0],this.startParams[1],null,null,0,null,true);
		var url = Server.getItemInfoURL(this.ItemData.Id,"&ExcludeLocationTypes=Virtual");
		GuiPlayer.start("PLAY",url,this.subMenuItems[this.selectedItem2].StartPositionTicks / 10000,"ItemDetails");
		break;
	case "guiTV_Episode_Episodes":
		var url = Server.getItemInfoURL(this.subMenuItems[this.selectedItem2].Id);
		ItemDetails.start(this.subMenuItems[this.selectedItem2].Name,url,0);
		break;
	case "guiTV_Episode_Suggested":
		Support.updateURLHistory("ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
		var url = Server.getItemInfoURL(this.subMenuItems[this.selectedItem2].Id);
		ItemDetails.start(this.subMenuItems[this.selectedItem2].Name,url,0);
		break;
	case "guiTV_Episode_Trailer":
		Support.updateURLHistory("ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
		var url = Server.getItemInfoURL(this.subMenuItems[this.selectedItem2].Id,"&ExcludeLocationTypes=Virtual");
		GuiPlayer.start("PLAY",url,0,"ItemDetails");
		break;
	case "guiTV_Episode_Cast":
		if (this.trailersEnabled){
			if (this.trailerState == sf.service.VideoPlayer.STATE_PLAYING ||
					this.trailerState == sf.service.VideoPlayer.STATE_PAUSED ||
					this.trailerState == sf.service.VideoPlayer.STATE_BUFFERING) {
				sf.service.VideoPlayer.stop();
				sf.service.VideoPlayer.hide();
			}
		}
		Support.updateURLHistory("ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
		var url = Server.getItemInfoURL(this.subMenuItems[this.selectedItem2].Id);
		GuiCastMember.start(this.subMenuItems[this.selectedItem2].Name,url,0,0);
		break;
	}
};

ItemDetails.playSelectedItem2 = function() {
	if (this.menuItems[this.selectedItem] == "guiTV_Episode_Play" && this.trailersEnabled){
		if (this.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
			sf.service.VideoPlayer.resume();
		}
	} else if (this.menuItems[this.selectedItem] == "guiTV_Episode_Chapters") {
		Support.updateURLHistory("ItemDetails",this.startParams[0],this.startParams[1],null,null,0,null,true);
		var url = Server.getItemInfoURL(this.ItemData.Id,"&ExcludeLocationTypes=Virtual");
		GuiPlayer.start("PLAY",url,this.subMenuItems[this.selectedItem2].StartPositionTicks / 10000,"ItemDetails");
	} else if (this.menuItems[this.selectedItem] == "guiTV_Episode_Episodes") {
		Support.updateURLHistory("ItemDetails",this.startParams[0],this.startParams[1],null,null,0,null,true);
		var url = Server.getItemInfoURL(this.subMenuItems[this.selectedItem2].Id,"&ExcludeLocationTypes=Virtual");
		GuiPlayer.start("PLAY",url,null,"ItemDetails");
	} else {
		return;
	}
};

ItemDetails.setTrailerPosition = function() {
	// Sets the mini-player position.
	sf.service.VideoPlayer.setPosition({
		left: 1080,
		top: 35,
		width: 800,
		height: 600
	});
};

ItemDetails.getTrailerEvents = function() {
	var opt = {};
	var _THIS_ = this;
	opt.onerror = function(error, info){
		FileLog.write('Trailor: ERROR : ' + (_THIS_.error2String[error]||error) + (info ? ' (' + info + ')' : ''));
	};
	opt.onend = function(){
		Helper.setControlButtons("Favourite","Watched",null,null,"Return");

		//If the trailer button is visible when a trailer ends, update it.
		if (ItemDetails.selectedItem == 0) {
			var htmlToAdd = "";
			htmlToAdd += "<div id=0 class='FilmListSingle highlight" + Main.highlightColour + "Background'><div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY TRAILER</div></div></div>";
			document.getElementById("guiTV_Episode_SubOptions").innerHTML = htmlToAdd;
		}

		//Reset the Play Trailer button for channel trailers
		if (ItemDetails.ItemData.Type == "Trailer" && ItemDetails.trailersEnabled){
			document.getElementById("guiTV_Episode_Play").innerHTML = "<div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY TRAILER</div></div>";
		}

		//Turn On Screensaver
		Support.screensaverOn();
		Support.screensaver();

		sf.service.VideoPlayer.hide();
		FileLog.write('Trailor: END');
		document.getElementById("evnItemDetails").focus();
		ItemDetails.updateSelectedItems();
	};
	opt.onstatechange = function(state, info){
		FileLog.write('Trailor: StateChange : ' + (_THIS_.state2String[state]||state) + (info ? ' (' + info + ')' : ''));
		_THIS_.trailerState = state;
	};
	return (opt);
};

ItemDetails.setTrailerStateHandlers = function() {
	//Set miniplayer vars.
	this.trailerState = sf.service.VideoPlayer.STATE_STOPPED;
	this.error2String = {};
	this.error2String[sf.service.VideoPlayer.ERR_NOERROR] = 'NoError';
	this.error2String[sf.service.VideoPlayer.ERR_NETWORK] = 'Network';
	this.error2String[sf.service.VideoPlayer.ERR_NOT_SUPPORTED] = 'Not Supported';
	this.state2String = {};
	this.state2String[sf.service.VideoPlayer.STATE_PLAYING] = 'Playing';
	this.state2String[sf.service.VideoPlayer.STATE_STOPPED] = 'Stopped';
	this.state2String[sf.service.VideoPlayer.STATE_PAUSED] = 'Paused';
	this.state2String[sf.service.VideoPlayer.STATE_BUFFERING] = 'Buffering';
	this.state2String[sf.service.VideoPlayer.STATE_SCANNING] = 'Scanning';
};

ItemDetails.setTrailerKeyHandlers = function() {
	//Key handlers for fullscreen mode.
	sf.service.VideoPlayer.setKeyHandler(sf.key.YELLOW, function () {
		sf.service.VideoPlayer.setFullScreen(false);
		ItemDetails.updateSelectedItems();
		if (ItemDetails.ItemData.Type != "Trailer"){
			ItemDetails.updateSelectedItems2();
		}
		ItemDetails.updateDisplayedItems2();
		document.getElementById("evnItemDetails").focus();
	});
	sf.service.VideoPlayer.setKeyHandler(sf.key.RETURN, function () {
		sf.service.VideoPlayer.setFullScreen(false);
		ItemDetails.updateSelectedItems();
		if (ItemDetails.ItemData.Type != "Trailer"){
			ItemDetails.updateSelectedItems2();
		}
		ItemDetails.updateDisplayedItems2();
		document.getElementById("evnItemDetails").focus();
	});
	sf.service.VideoPlayer.setKeyHandler(sf.key.PLAY, function () {
		if (ItemDetails.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
			sf.service.VideoPlayer.resume();
		}
	});
	sf.service.VideoPlayer.setKeyHandler(sf.key.STOP, function () {
		sf.service.VideoPlayer.setFullScreen(false);
		sf.service.VideoPlayer.stop();
		sf.service.VideoPlayer.hide();
		//Turn On Screensaver
		Support.screensaverOn();
		Support.screensaver();
		ItemDetails.updateSelectedItems();
		if (ItemDetails.ItemData.Type != "Trailer"){
			ItemDetails.updateSelectedItems2();
		}
		ItemDetails.updateDisplayedItems2();
		//Reset the Play Trailer button for channel trailers
		if (ItemDetails.ItemData.Type == "Trailer" && ItemDetails.trailersEnabled){
			document.getElementById("guiTV_Episode_Play").innerHTML = "<div class='FilmListSingleImage' style=background-image:url(images/menu/Play-46x37.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY TRAILER</div></div>";
		}
		document.getElementById("evnItemDetails").focus();
	});
	sf.service.VideoPlayer.setKeyHandler(sf.key.PAUSE, function () {
		if (ItemDetails.trailerState == sf.service.VideoPlayer.STATE_PAUSED) {
			sf.service.VideoPlayer.resume();
		} else {
			sf.service.VideoPlayer.pause();
		}
	});
	//These button are disabled during full screen trailers.
	sf.service.VideoPlayer.setKeyHandler(sf.key.TOOLS, function () {
	});
	sf.service.VideoPlayer.setKeyHandler(sf.key.ENTER, function () {
	});
	sf.service.VideoPlayer.setKeyHandler(sf.key.FF, function () {
	});
	sf.service.VideoPlayer.setKeyHandler(sf.key.REW, function () {
	});
};

ItemDetails.playTrailer = function(trailerUrl) {
	//Handle Music player
	if (MusicPlayer.Status == "PLAYING" || MusicPlayer.Status == "PAUSED") {
		MusicPlayer.stopPlayback();
	}

	//Turn off Screensaver
	Support.screensaverOff();

	//Set the miniplayer
	document.getElementById('sf-service-videoplayer-mini-infobar').style.display= 'none';
	this.setTrailerStateHandlers();
	this.setTrailerKeyHandlers();
	var opt = this.getTrailerEvents();
	sf.service.VideoPlayer.init(opt);
	this.setTrailerPosition();

	//Begin trailer playback
	sf.service.VideoPlayer.show();
	sf.service.VideoPlayer.play({
		//url: 'http://dskhzskakdl.samsungcloudsolution.com/UwBWAEMAMAAwADAAMgAxAA%3D%3D/NgAxAEYAYQBtAGkAbAB5AE0AYQBuAGEAZwBlAHIA/%5BEng%5DFamily_01_20120712.mp4?AWSAccessKeyId=AKIAJFR4V46LB32XRHJQ&Expires=1660266865&Signature=d23NN7uS59k%2Be6bpTHPt3f2%2BXus%3D',
		url: trailerUrl,
		fullScreen: false
	});
};

ItemDetails.getMediaInfo = function() {
	//this.ItemData.MediaSources[0].Video3DFormat is reported as either HalfSideBySide or HalfTopAndBottom.
	//this.ItemData.MediaSources[0].Name is in the format 3D/Resolution/videoCodec/audioCodec. 3D/ is omitted for 2D.
	var container = this.ItemData.MediaSources[0].Container;
	var res = this.ItemData.MediaSources[0].Name.split("/");
	var videoCodec = null; var videoRatio = null; var audioCodec = null; var audioChannels = null;

	var MEDIASTREAMS = this.ItemData.MediaSources[0].MediaStreams;

	var videoCount = 0; audioCount = 0;
	for (var mediaStream = 0; mediaStream < MEDIASTREAMS.length; mediaStream++) {
		if (MEDIASTREAMS[mediaStream].Type == "Video") {
			videoCount++;
		}
		if (MEDIASTREAMS[mediaStream].Type == "Audio") {
			audioCount++;
		}
	}

	for (var mediaStream = 0; mediaStream < MEDIASTREAMS.length; mediaStream++) {
		if (MEDIASTREAMS[mediaStream].Type == "Video" && (videoCount == 1 || MEDIASTREAMS[mediaStream].IsDefault == true)) {
			videoCodec = MEDIASTREAMS[mediaStream].Codec;
			videoRatio  = MEDIASTREAMS[mediaStream].AspectRatio;
		}
		if (MEDIASTREAMS[mediaStream].Type == "Audio" && (audioCount == 1 || MEDIASTREAMS[mediaStream].IsDefault == true)) {
			audioCodec = MEDIASTREAMS[mediaStream].Codec;
			audioChannels  = MEDIASTREAMS[mediaStream].Channels;
		}
	}

	var items = [container,videoRatio,audioCodec,res[0],audioChannels,videoCodec];
	document.getElementById("guiTVShowMediaAlternative").innerHTML = this.processMediaInfo(items);
};

ItemDetails.processMediaInfo = function(itemsArray) {
	var htmlToAdd = "";
	for (var index = 0; index < itemsArray.length; index++) {
		switch (itemsArray[index]) {
		//Container
		case "mkv":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/media_mkv-2.png)></div>";
			break;
		case "avi":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/media_avi-2.png)></div>";
			break;
		case "mp4":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/media_mp4.png)></div>";
			break;
		//VideoCodec
		case "h264":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_h264.png)></div>";
			break;
		case "hevc":
		case "h265":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_h265.png)></div>";
			break;
		case "mpeg4":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_mpeg4visual.png)></div>";
			break;
		//AspectRatios
		case "16:9":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/widescreen.png)></div>";
			break;
		case "2.35:1":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/aspect_235.png)></div>";
			break;
		case "2.40:1":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/aspect_240.png)></div>";
			break;
		//AudioCodec
		case "aac":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_aac-2.png)></div>";
			break;
		case "ac3":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_ac3.png)></div>";
			break;
		case "pcm":
		case "pcm_s16le":
		case "pcm_s24le":
		case "pcm_s32le":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_pcm.png)></div>";
			break;
		case "truehd":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_ddtruehd.png)></div>";
			break;
		case "mp3":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_mp3.png)></div>";
			break;
		case "dts":
		case "dca":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_dts.png)></div>";
			break;
		case "flac":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_flac.png)></div>";
			break;
		case "vorbis":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_vorbis.png)></div>";
			break;
		//AudioChannels
		case 1:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_1.png)></div>";
			break;
		case 2:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_2.png)></div>";
			break;
		case 3:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_3.png)></div>";
			break;
		case 4:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_4.png)></div>";
			break;
		case 5:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_5.png)></div>";
			break;
		case 6:
		case 5.1:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_6.png)></div>";
			break;
		case 7:
		case 6.1:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_7.png)></div>";
			break;
		case 8:
		case 7.1:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_8.png)></div>";
			break;
		//Specials
		case "3D":
			if (this.ItemData.MediaSources[0].Video3DFormat == "HalfSideBySide") {
				htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/media_SBS.png)></div>";
			} else if (this.ItemData.MediaSources[0].Video3DFormat == "HalfTopAndBottom") {
				htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/media_TAB.png)></div>";
			} else {
				htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/media_3d.png)></div>";
			}
			break;
		//Resolution
		case "SD":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/res_SD.png)></div>";
			break;
		case "480P":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/res_480.png)></div>";
			break;
		case "720P":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/res_720.png)></div>";
			break;
		case "1080P":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/res_1080.png)></div>";
			break;
		default:
			break;
		}
	}
	return htmlToAdd;
};
