var Support = {
	previousPageDetails : [],
	selectedItem : 0,
	topLeftItem : 0,
	isTopRow : true,
	startScroll : null,
	scroller : null,
	scrollpos : 0,
	resetToTop : null,
	pageLoadedTime : null,
	screensaverVar : null,
	isScreensaverOn : true,
	clockVar : null,
	imageCachejson : null,
	TVNextUp : null,
	Favourites : null,
	FavouriteMovies : null,
	FavouriteSeries : null,
	FavouriteEpisodes : null,
	SuggestedMovies : null,
	MediaFolders : null,
	LatestTV : null,
	LatestMovies : null
};

Support.widgetPutInnerHTML = function(elementId, html) {
	var element = document.getElementById(elementId);
	widgetAPI.putInnerHTML(element, html);	
};

Support.clock = function() {
	var date = new Date();
	var h = date.getHours();
	var offset = File.getTVProperty("ClockOffset");
	h = h + offset;
	if (h < 0) {h = h + 24;};
	if (h > 23) {h = h - 24;};
	if (h < 10) {h = "0" + h;};
	var m = date.getMinutes();
	if (m < 10) {m = "0" + m;};
	var time = h + ':' + m;
	this.widgetPutInnerHTML("clock", time);
	this.widgetPutInnerHTML("playerClock", time);
	this.widgetPutInnerHTML("playerClock2", time);
	this.clockVar = setTimeout(function() {Support.clock();}, 900);
};

Support.loading = function(mSecs) {
	document.getElementById("loading").style.visibility = "";
	setTimeout(function() {
		document.getElementById("loading").style.visibility = "hidden";
	}, mSecs);
};

Support.logout = function() {
	//Turn off screensaver
	Support.screensaverOff();
	if (MusicPlayer.Status == "PLAYING" || MusicPlayer.Status == "PAUSED"){
		MusicPlayer.handleStopKey();
	}
	FileLog.write("User "+ Server.getUserName() + " logged out.");
	//document.getElementById("menuUserImage").style.backgroundImage = "";
	this.widgetPutInnerHTML("menuItems", "");
	Server.setUserID("");
	Server.setUserName("");
	Server.Logout();
	Users.start(false);
};

Support.updateHomePageURLs = function (title, url, title2Name, isURL1) {
	this.previousPageDetails[0][0] = "HomeTwoItems";
	if (isURL1 == true) {
		this.previousPageDetails[0][1] = title;
		this.previousPageDetails[0][2] = url;
	} else {
		this.previousPageDetails[0][3] = title;
		this.previousPageDetails[0][4] = url;
	}
	if (title2Name == "None") {
		this.previousPageDetails[0][0] = "HomeOneItem";
	}
};

Support.updateURLHistory = function(page, title, url, title2, url2, selectedItem, topLeftItem, isTop) {
	//Only add new page if going to new page (if url's are the same don't add) - Length must be greater than 0
	if (this.previousPageDetails.length > 0) {
		//If greater than 0 check if page isnt the same as previous page
		if (this.previousPageDetails[this.previousPageDetails.length - 1][2] != url) {
			this.previousPageDetails.push([page, title, url, title, url, selectedItem, topLeftItem, isTop]);
			alert ("Adding new item: " + this.previousPageDetails.length);
		} else {
			if (this.previousPageDetails[this.previousPageDetails.length - 1][0] != page) {
				//Required! Trust me dont remove this if!
				this.previousPageDetails.push([page, title, url, title, url, selectedItem, topLeftItem, isTop]);
				alert ("Adding new item: " + this.previousPageDetails.length);
			} else {
				alert ("New Item not added - Is duplicate of previous page: " + this.previousPageDetails.length);
			}
		}
	} else {
		this.previousPageDetails.push([page, title, url, title, url, selectedItem, topLeftItem, isTop]);
		alert ("Adding new item: " + this.previousPageDetails.length);
	}
};

//Below method used for Main Menu & Playlist Deletion
Support.removeLatestURL = function() {
	this.previousPageDetails.pop();
	alert ("Removed item: " + this.previousPageDetails.length);
};

Support.removeAllURLs = function() {
	this.previousPageDetails.length = 0;
};

Support.processReturnURLHistory = function() {
	alert ("Just before removing item" + this.previousPageDetails.length);
	//Reset Help
	document.getElementById("help").style.visibility = "hidden";
	if (this.previousPageDetails.length > 0) {
		var array = this.previousPageDetails[this.previousPageDetails.length - 1];
		var page = array[0];
		var title = array[1];
		var url = array[2];
		var title2 = array[3];
		var url2 = array[4];
		var selectedItem = array[5];
		var topLeftItem = array[6];
		var isTop = array[7];
		//Handle Navigation?
		switch (page) {
			case "HomeOneItem":
				HomeOneItem.start(title, url, selectedItem, topLeftItem);
				break;
			case "HomeTwoItems":
				HomeTwoItems.start(title, url, title2, url2, selectedItem, topLeftItem, isTop);
				break;
			case "DisplaySeries":
				DisplaySeries.start(title, url, selectedItem, topLeftItem);
				break;
			case "DisplayEpisodes":
				DisplayEpisodes.start(title, url, selectedItem, topLeftItem);
				break;
			case "DisplayOneItem":
				DisplayOneItem.start(title, url, selectedItem, topLeftItem);
				break;
			case "TVShow":
				TVShow.start(title, url, selectedItem, topLeftItem);
				break;
			case "TVUpcoming":
				TVUpcoming.start();
				break;
			case "ItemDetails":
				ItemDetails.start(title, url, selectedItem);
				break;
			case "DisplayTwoItems":
				DisplayTwoItems.start(title, url, title, url, selectedItem, topLeftItem, isTop);
				break;
			case "MusicArtist":
				MusicArtist.start(title, url, selectedItem,  topLeftItem);
				break;
			case "MusicAZ":
				MusicAZ.start(title, selectedItem);//Not actually Title - Holds page!
				break;
			case "Music":
				Music.start(title, url);
				break;
			case "CastMember":
				CastMember.start(title, url, selectedItem, topLeftItem);
				break;
			case "Photos":
				Photos.start(title, url, selectedItem, topLeftItem);
				break;
			case "Playlist": //Params 3 = type, saved in url2, Param 4 = playlistid, saved as title2
				Playlist.start(title, url, title, url2);
				break;
			case "Search":
				Search.start(title, url);
				break;
			case "Settings":
				Settings.start();
				break;
			case "TVGuide":
				url = Server.getCustomURL("/LiveTV/Channels?StartIndex=0&Limit=100&EnableFavoriteSorting=true&UserId=" + Server.getUserID());
				var guideTime = new Date();
				var timeMsec = guideTime.getTime();
				var startTime = timeMsec - 900000; //rewind the clock fifteen minutes.
				guideTime.setTime(startTime);
				TVGuide.start("Guide", url, 0, 0, 0, guideTime);
				break;
			default:
				break;
		}
		this.previousPageDetails.pop();
		alert ("Just after removing item" + this.previousPageDetails.length);
	} else {
		widgetAPI.sendReturnEvent();
	}
};

Support.destroyURLHistory = function() {
	this.previousPageDetails.length = 0;
};

Support.processIndexing = function(itemsArray) {
	var alphabet = "abcdefghijklmnopqrstuvwxyz";
	var currentLetter = 0;
	var indexLetter = [];
	var indexPosition = [];
	//Push non alphabetical chars onto index array
	var checkForNonLetter = itemsArray[0].SortName.charAt(0).toLowerCase();
	if (checkForNonLetter != 'a') {
		indexPosition.push(0);
		indexLetter.push('#');
	}
	for (var index = 0; index < itemsArray.length; index++) {
		var letter = itemsArray[index].SortName.charAt(0).toLowerCase();
		if (letter == alphabet.charAt(currentLetter-1)) {
			//If item is second or subsequent item with the same letter do nothing
		} else {
			//If Next Letter
			if (letter == alphabet.charAt(currentLetter)) {
				indexPosition.push(index);
				indexLetter.push(alphabet.charAt(currentLetter));
				currentLetter++;
			//Need to check as items may skip a letter (Bones , Downton Abbey) Above code would stick on C
			} else {
				for (var alpha = currentLetter + 1; alpha < 26; alpha++) {
					if (letter == alphabet.charAt(alpha)) {
						indexPosition.push(index);
						indexLetter.push(alphabet.charAt(alpha));
						currentLetter= currentLetter + ((alpha - currentLetter) + 1);
						break;
					}
				}
			}
		}
	}
	var returnArrays = [indexLetter, indexPosition];
	return  returnArrays;
};

//-----------------------------------------------------------------------------------------------------------------------------------------

Support.updateDisplayedItems = function(items, selectedItemID, startPos, endPos, divIdUpdate, divIdPrepend, isResume, genre, showBackdrop) {
	var htmlToAdd = "";
	var progress = "";
	var imgsrc = "";
	var title = "";
	var imageData = "";
	for (var index = startPos; index < endPos; index++) {
		if (isResume == true) {
			progress = Math.round((Main.posterWidth / 100) * Math.round(items[index].UserData.PlayedPercentage));
			//Calculate Width of Progress Bar
			if (items[index].Type == "Episode") {
				title = this.getNameFormat(items[index].SeriesName, items[index].ParentIndexNumber, items[index].Name, items[index].IndexNumber);
				if (items[index].ParentThumbItemId) {
					title = this.getNameFormat("", items[index].ParentIndexNumber, items[index].Name, items[index].IndexNumber);
					imgsrc = Server.getImageURL(items[index].SeriesId, "Thumb", Main.posterWidth, Main.posterHeight, 0, false);
				} else if (items[index].ParentBackdropImageTags.length > 0) {
					title = this.getNameFormat(items[index].SeriesName, items[index].ParentIndexNumber, items[index].Name, items[index].IndexNumber,  items[index].SeriesStudio?items[index].SeriesStudio:undefined, items[index].AirTime?items[index].AirTime:undefined);
					imgsrc = Server.getImageURL(items[index].ParentBackdropItemId, "Backdrop", Main.posterWidth, Main.posterHeight, 0, false);
				} else if (items[index].ImageTags.Primary) {
					imgsrc = Server.getImageURL(items[index].Id, "Primary", Main.posterWidth, Main.posterHeight, 0, false);
				} else {
					imgsrc = "images/collection.png";
				}
				//Add watched and favourite overlays.
				htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style='background-image:url(" + imgsrc + ");background-size:contain'><div class=menuProgressBar></div><div class=menuProgressBarCurrent style='width:" + progress + "px;'></div>";
				if (items[index].UserData.Played) {
					htmlToAdd += "<div class='genreItemCount highlight" + Main.highlightColour + "Background'>&#10003</div>";
				}
				if (items[index].UserData.IsFavorite) {
					htmlToAdd += "<div class=favItem></div>";
				}
				htmlToAdd += "<div class=menuItemWithProgress>" + title +"</div></div>";

			} else {
				title = items[index].Name;
				if (items[index].ImageTags.Thumb) {
					imgsrc = Server.getImageURL(items[index].Id, "Thumb", Main.posterWidth, Main.posterHeight, items[index].UserData.PlayCount, items[index].UserData.Played);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=menuProgressBar></div><div class=menuProgressBarCurrent style='width:" + progress + "px;'></div><div class=menuItemWithProgress></div></div>";
				} else if (items[index].BackdropImageTags.length > 0) {
					imgsrc = Server.getImageURL(items[index].Id, "Backdrop", Main.posterWidth, Main.posterHeight, items[index].UserData.PlayCount, items[index].UserData.Played);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=menuProgressBar></div><div class=menuProgressBarCurrent style='width:" + progress + "px;'></div><div class=menuItemWithProgress>" + title + "</div></div>";
				} else if (items[index].ImageTags.Primary) {
					imgsrc = Server.getImageURL(items[index].Id, "Primary", Main.posterWidth, Main.posterHeight, 0, false, 0);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=menuProgressBar></div><div class=menuProgressBarCurrent style='width:" + progress + "px;'></div><div class=menuItemWithProgress>" + title + "</div></div>";
				} else {
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(images/collection.png)><div class=menuProgressBar></div><div class=menuProgressBarCurrent style='width:" + progress + "px;'></div><div class=menuItemWithProgress>" + title + "</div></div>";
				}
			}
		} else {
			//----------------------------------------------------------------------------------------------
			if (items[index].Type == "Genre") {
				var itemCount = 0;

				switch (Genre) {
				case "Movie":
					itemCount = items[index].MovieCount;
					break;
				case "Series":
					itemCount = items[index].SeriesCount;
					break;
				default:
					break;
				}
				if (items[index].ImageTags.Primary) {
					imgsrc = (File.getUserProperty("LargerView") == true) ? Server.getImageURL(items[index].Id, "Primary", 238, 356, 0, false, 0) : Server.getImageURL(items[index].Id, "Primary", 192, 280, 0, false, 0);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class='genreItemCount highlight" + Main.highlightColour + "Background'>" + itemCount + "</div></div>";
				} else {
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-color: #303030;><div class='genreItemCount highlight" + Main.highlightColour + "Background'>" + itemCount + "</div></div>";
				}
			//----------------------------------------------------------------------------------------------
			} else if (items[index].Type == "Episode") {
				title = this.getNameFormat(items[index].SeriesName, items[index].ParentIndexNumber, items[index].Name, items[index].IndexNumber, items[index].SeriesStudio?items[index].SeriesStudio:undefined, items[index].AirTime?items[index].AirTime:undefined);
				if (items[index].ParentThumbItemId) {
					imgsrc = Server.getImageURL(items[index].SeriesId, "Thumb", Main.posterWidth,Main.posterHeight, 0, items[index].UserData.Played, 0);
					imageData = "'background-image:url(" +imgsrc+ ");background-size:contain'";
					title = this.getNameFormat("", items[index].ParentIndexNumber, items[index].Name, items[index].IndexNumber, items[index].SeriesStudio?items[index].SeriesStudio:undefined, items[index].AirTime?items[index].AirTime:undefined);
				} else if (items[index].ParentBackdropImageTags.length > 0) {
					imgsrc = Server.getImageURL(items[index].ParentBackdropItemId, "Backdrop", Main.posterWidth, Main.posterHeight, 0, false);
					imageData = "'background-image:url(" +imgsrc+ ");background-size:contain'";
					title = this.getNameFormat(items[index].SeriesName, items[index].ParentIndexNumber, items[index].Name, items[index].IndexNumber,  items[index].SeriesStudio?items[index].SeriesStudio:undefined, items[index].AirTime?items[index].AirTime:undefined);
				} else  if (items[index].ImageTags.Primary) {
					imgsrc = Server.getImageURL(items[index].Id, "Primary", Main.posterWidth, Main.posterHeight, 0, items[index].UserData.Played, 0);
					imageData = "'background-image:url(" + imgsrc + ");background-size:contain'";
				} else {
					imageData = "background-color: #303030";
				}
				htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=" +imageData + ">";
				//Add overlays.
				if (items[index].LocationType == "Virtual"){
					var imageMissingOrUnaired = "";
					if (items[index].AirTime) {
						imageMissingOrUnaired = (Support.FutureDate(items[index].PremiereDate,items[index].AirTime) == true) ? "ShowListSingleUnaired" : "ShowListSingleMissing";
					} else {
						imageMissingOrUnaired = (Support.FutureDate(items[index].PremiereDate) == true) ? "ShowListSingleUnaired" : "ShowListSingleMissing";
					}
					htmlToAdd += "<div class='" + imageMissingOrUnaired+"'></div>";
				}
				if (items[index].UserData.Played) {
					htmlToAdd += "<div class='genreItemCount highlight" + Main.highlightColour + "Background'>&#10003</div>";
				}
				if (items[index].UserData.IsFavorite) {
					htmlToAdd += "<div class=favItem></div>";
				}
				htmlToAdd += "<div class=listItem>" + title + "</div></div>";
			//----------------------------------------------------------------------------------------------
			} else if (items[index].Type == "MusicAlbum"){
				title = items[index].Name;
				if (items[index].ImageTags.Primary) {
					imgsrc = Server.getImageURL(items[index].Id,"Primary",224,224,items[index].UserData.PlayCount,false,0);
					if (items[index].UserData.IsFavorite) {
						htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=favItem></div><div class='genreItemCount highlight" + Main.highlightColour + "Background'>" + items[index].RecursiveItemCount + "</div><div class=listItem>" + title + "</div></div>";
					} else {
						htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class='genreItemCount highlight" + Main.highlightColour + "Background'>"+items[index].RecursiveItemCount + "</div><div class=listItem>"+ title + "</div></div>";
					}
				} else {
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style='background-image:url(images/album.png);border:2px solid black;background-position:center;'><div class='genreItemCount highlight" + Main.highlightColour + "Background'>" + items[index].RecursiveItemCount + "</div><div class=listItem>" + title + "</div></div>";
				}
			//----------------------------------------------------------------------------------------------
			} else if (items[index].Type == "ChannelAudioItem" || items[index].Type == "AudioPodcast"){
				title = items[index].Name;
				if (items[index].ImageTags.Primary) {
					imgsrc = Server.getImageURL(items[index].Id, "Primary", 224, 224, items[index].UserData.PlayCount, false, 0);
					if (items[index].UserData.IsFavorite) {
						htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=favItem></div></div>";
					} else {
						htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")></div>";
					}
				} else {
					htmlToAdd += "<div id="+ divIdPrepend + items[index].Id + " style='background-image:url(images/album.png);border:2px solid black;background-position:center;'><div class='genreItemCount highlight" + Main.highlightColour + "Background'>" + items[index].RecursiveItemCount+"</div><div class=listItem>" + title + "</div></div>";
				}
			//----------------------------------------------------------------------------------------------
			}  else if (items[index].Type == "MusicArtist"){
				title = items[index].Name;
				var count = items[index].RecursiveItemCount;
				if (items[index].ImageTags.Primary) {
					imgsrc = Server.getImageURL(items[index].Id, "Primary", 250, 500, 0, false, 0);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")>";
				} else {
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style='background-image:url(images/artist.png);border:2px solid black;background-position:center;'>";
				}
				if (count){
					htmlToAdd += "<div class='genreItemCount highlight" + Main.highlightColour + "Background'>" + count + "</div><div class=listItem>" + title + "</div></div>";
				} else {
					htmlToAdd += "<div class=listItem>" + title + "</div></div>";
				}
			//----------------------------------------------------------------------------------------------
			} else if (items[index].Type == "Audio"){
				title = items[index].Name;
				if (items[index].AlbumPrimaryImageTag) {
					imgsrc = Server.getImageURL(items[index].AlbumId, "Primary", 224, 224, 0, false, 0);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=listItem>" + title + "</div></div>";
				} else {
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(images/album.png)><div class=listItem>" + title + "</div></div>";
				}
			//----------------------------------------------------------------------------------------------
			} else if (items[index].Type == "Series" || items[index].Type == "Movie" || items[index].Type == "BoxSet" || items[index].Type == "ChannelVideoItem" || items[index].Type == "Trailer") {
				title = items[index].Name;
				if (showBackdrop == true) {
					if (items[index].ImageTags.Thumb) {
						imgsrc = Server.getImageURL(items[index].Id, "Thumb", Main.posterWidth, Main.posterHeight, 0, false, 0);
						htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style='background-image:url(" +imgsrc+ ")'>";
					} else if (items[index].BackdropImageTags.length > 0) {
						imgsrc = Server.getBackgroundImageURL(items[index].Id,"Backdrop", Main.posterWidth,Main.posterHeight, 0, false, 0, items[index].BackdropImageTags.length);
						htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style='background-image:url(" + imgsrc + ")'><div class=listItem>" + title + "</div>";
					} else if (items[index].ImageTags.Primary) {
						imgsrc = Server.getImageURL(items[index].Id, "Primary", Main.posterWidth, Main.posterHeight, 0, false, 0);
						htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style='background-image:url(" + imgsrc + ")'><div class=listItem>" + title + "</div>";
					} else {
						htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style='background-image: #303030;'><div class=listItem>" + title + "</div>";
					}
				} else {
					if (items[index].ImageTags.Primary) {
						imgsrc = (File.getUserProperty("LargerView") == true) ? Server.getImageURL(items[index].Id, "Primary", Main.seriesPosterLargeWidth, Main.seriesPosterLargeHeight, 0, false, 0) : Server.getImageURL(items[index].Id, "Primary", Main.seriesPosterWidth, Main.seriesPosterHeight, 0, false, 0);
						htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style='background-image:url(" + imgsrc + ")'>";
					} else {
						htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style='background-image: #303030;'><div class=listItem>" + title + "</div>";
					}
				}
				//Add watched and favourite overlays.
				if (items[index].UserData.Played) {
					htmlToAdd += "<div class='genreItemCount highlight" + Main.highlightColour + "Background'>&#10003</div>";
				} else if (items[index].UserData.UnplayedItemCount > 0){
					htmlToAdd += "<div class='genreItemCount highlight" + Main.highlightColour + "Background'>" + items[index].UserData.UnplayedItemCount + "</div>";
				}
				if (items[index].UserData.IsFavorite) {
					htmlToAdd += "<div class=favItem></div>";
				}
				htmlToAdd += "</div>";
			//----------------------------------------------------------------------------------------------
			} else if (items[index].Type == "TvChannel") {
				title = items[index].Name;
				if (items[index].ImageTags.Primary) {
					imgsrc = Server.getImageURL(items[index].Id, "Primary", 224, 224, 0, false, 0);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=listItem>" + title + "</div></div>";
				} else {
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style='background-position:center;background-color:rgba(63,81,181,0.8);background-image:url(images/Live-TV-108x98.png)')><div class=listItem>" + title + "</div></div>";
				}
				//----------------------------------------------------------------------------------------------
			} else if (items[index].Type == "Recording") {
				title = items[index].Name + "<br>" + Support.AirDate(items[index].StartDate,"Recording");

				if (items[index].ImageTags.Primary) {
					imgsrc = Server.getImageURL(items[index].Id, "Primary", Main.posterWidth, Main.posterHeight, 0, false, 0);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=listItem>"+ title + "</div>";
				} else {
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style='background-position:center;background-color:rgba(63,81,181,0.8);background-image:url(images/Live-TV-108x98.png)')><div class=listItem>" + title + "</div>";
				}
				//Add watched and favourite overlays.
				if (items[index].UserData.Played) {
					htmlToAdd += "<div class='genreItemCount highlight" + Main.highlightColour + "Background'>&#10003</div>";
				} else if (items[index].UserData.UnplayedItemCount > 0){
					htmlToAdd += "<div class='genreItemCount highlight" + Main.highlightColour + "Background'>" + items[index].UserData.UnplayedItemCount + "</div>";
				}
				if (items[index].UserData.IsFavorite) {
					htmlToAdd += "<div class=favItem></div>";
				}
				htmlToAdd += "</div>";
			//----------------------------------------------------------------------------------------------
			} else if (items[index].Type == "Season") {
				if (items[index].BackdropImageTags.length > 0) {
					imgsrc = Server.getBackgroundImageURL(items[index].Id, "Primary", 114, 165, items[index].UserData.PlayCount, items[index].UserData.Played, items[index].UserData.PlayedPercentage, items[index].BackdropImageTags.length);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")></div>";
				} else {
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-color: #303030;></div>";
				}
			//----------------------------------------------------------------------------------------------
			} else if (items[index].Type == "Channel") {
				title = items[index].Name;
				if (items[index].BackdropImageTags.length > 0) {
					imgsrc = Server.getBackgroundImageURL(items[index].Id, "Backdrop", Main.posterWidth, Main.posterHeight, 0, false, 0, items[index].BackdropImageTags.length);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=listItem>" + title + "</div></div>";
				}
				else if (items[index].ImageTags.Thumb) {
					imgsrc = Server.getImageURL(items[index].Id, "Thumb", Main.posterWidth, Main.posterHeight, 0, false, 0);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=listItem>" + title + "</div></div>";
				}
				else {
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-color: #303030;><div class=listItem>" + title + "</div></div>";
				}
			//----------------------------------------------------------------------------------------------
			} else if (items[index].Type == "ChannelFolderItem") {
				title = items[index].Name;
				if (items[index].ImageTags.Primary) {
					imgsrc = Server.getImageURL(items[index].Id, "Primary", Main.posterWidth, Main.posterHeight, 0, false, 0);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=listItem>" + title + "</div></div>";
				} else {
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-color: #303030;background-image:url(images/EmptyFolder-122x98.png)><div class=listItem>"+ title + "</div></div>";
				}
			//----------------------------------------------------------------------------------------------
			} else if (items[index].Type == "ChannelVideoItem") {
				title = items[index].Name;
				if (items[index].ImageTags.Primary) {
					imgsrc = Server.getImageURL(items[index].Id, "Primary", Main.posterWidth, Main.posterHeight, 0, false, 0);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=listItem>" + title + "</div></div>";
				} else {
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-color: #303030;><div class=listItem>" + title + "</div></div>";
				}
			//----------------------------------------------------------------------------------------------
			} else if (items[index].Type == "Playlist" || items[index].Type == "CollectionFolder" ) {
				title = items[index].Name;
				if (items[index].ImageTags.Primary) {
					imgsrc = Server.getImageURL(items[index].Id, "Primary", Main.posterWidth, Main.posterHeight, 0, false, 0);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=listItem>" + title + "</div></div>";
				} else if (items[index].ImageTags.Thumb) {
					imgsrc = Server.getImageURL(items[index].Id, "Thumb", Main.posterWidth, Main.posterHeight, 0, false, 0);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=listItem>" + title + "</div></div>";
				} else if (items[index].BackdropImageTags.length > 0) {
					imgsrc = Server.getBackgroundImageURL(items[index].Id, "Backdrop", Main.posterWidth, Main.posterHeight, 0, false, 0, items[index].BackdropImageTags.length);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=listItem>" + title + "</div></div>";
				} else {
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-color: #303030;><div class=listItem>" + title + "</div></div>";
				}
			//----------------------------------------------------------------------------------------------
			}  else if (items[index].Type == "Photo") {
				title = items[index].Name;
				if (items[index].ImageTags.Primary) {
					imgsrc = Server.getImageURL(items[index].Id, "Primary", Main.posterWidth, Main.posterHeight, 0, false, 0);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=listItem></div></div>";
				} else {
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-color: #303030;><div class=listItem>" + title + "</div></div>";
				}
			//----------------------------------------------------------------------------------------------
			}  else if (items[index].Type == "Folder") {
				title = items[index].Name;
				if (items[index].ImageTags.Thumb) {
					imgsrc = Server.getImageURL(items[index].Id, "Thumb", Main.posterWidth, Main.posterHeight, 0, false, 0);
					htmlToAdd += "<div id="+ divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=listItem>" + title + "</div></div>";
				} else if (items[index].ImageTags.Primary) {
					imgsrc = Server.getImageURL(items[index].Id, "Primary", Main.posterWidth, Main.posterHeight, 0, false, 0);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=listItem>" + title + "</div></div>";
				} else {
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-color: #303030;background-image:url(images/EmptyFolder-122x98.png)><div class=listItem>"+ title + "</div></div>";
				}
			//----------------------------------------------------------------------------------------------
			}  else if (items[index].Type == "PhotoAlbum") {
				title = items[index].Name;
				if (items[index].ImageTags.Thumb) {
					imgsrc = Server.getImageURL(items[index].Id, "Thumb", Main.posterWidth, Main.posterHeight, 0, false, 0);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=listItem>" + title + "</div></div>";
				} else if (items[index].ImageTags.Primary) {
					imgsrc = Server.getImageURL(items[index].Id, "Primary", Main.posterWidth, Main.posterHeight, 0, false, 0);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=listItem>" + title + "</div></div>";
				} else {
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-color: #303030;><div class=listItem>" + title + "</div></div>";
				}
			//----------------------------------------------------------------------------------------------
			} else if (items[index].Type == "Video" || items[index].Type == "MusicVideo" ) {
				title = items[index].Name;
				if (items[index].ImageTags.Primary) {
					imgsrc = Server.getImageURL(items[index].Id, "Primary", Main.posterWidth, Main.posterHeight, 0, false, 0);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=listItem>" + title + "</div></div>";
				} else if (items[index].ImageTags.Thumb) {
					imgsrc = Server.getImageURL(items[index].Id, "Thumb", Main.posterWidth, Main.posterHeight, 0, false, 0);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=listItem>" + title + "</div></div>";
				} else if (items[index].BackdropImageTags.length > 0) {
					imgsrc = Server.getBackgroundImageURL(items[index].Id, "Backdrop", Main.posterWidth, Main.posterHeight, 0, false, 0, items[index].BackdropImageTags.length);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=listItem>" + title + "</div></div>";
				} else {
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-color: #303030;><div class=listItem>" + title + "</div></div>";
				}
			//----------------------------------------------------------------------------------------------
			} else {
				alert("Unhandled Item type: " + items[index].Type);
				title = items[index].Name;
				if (items[index].ImageTags.Thumb) {
					imgsrc = Server.getImageURL(items[index].Id, "Thumb", Main.posterWidth, Main.posterHeight, 0, false, 0);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=listItem>" + title + "</div></div>";
				} else if (items[index].BackdropImageTags.length > 0) {
					imgsrc = Server.getBackgroundImageURL(items[index].Id, "Backdrop", Main.posterWidth, Main.posterHeight, 0, false, 0, items[index].BackdropImageTags.length);
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-image:url(" + imgsrc + ")><div class=listItem>" + title + "</div></div>";
				} else {
					htmlToAdd += "<div id=" + divIdPrepend + items[index].Id + " style=background-color: #303030;><div class=listItem>" + title + "</div></div>";
				}
			}
		}
	}
	this.widgetPutInnerHTML(divIdUpdate, htmlToAdd);
};

//-----------------------------------------------------------------------------------------------------------------------------------------

Support.getNameFormat = function(seriesName, seriesNo, episodeName, episodeNo, seriesStudio, airTime) {
	var nameLabel = "";
	var seasonNumber = "";
	var seasonString = "";
	if (File.getUserProperty("SeasonLabel")){
		if (seriesName == "" || seriesName == null) {
			if (seriesNo !== undefined && episodeNo !== undefined) {
				seasonNumber = seriesNo;		
				if (seasonNumber < 10){
					seasonString = "0" + seasonNumber;
				} else {
					seasonString = seasonNumber;
				}
				var episodeNumber = episodeNo;
				var episodeString = "";
				if (episodeNumber < 10){
					episodeString = "0" + episodeNumber;
				} else {
					episodeString = episodeNumber;
				}
				if (episodeName == "" || episodeName == null) {
					nameLabel = "S" + seasonString + "E" + episodeString;
				} else {
					nameLabel = "S" + seasonString + "E" + episodeString + " - " + episodeName;
				}
			} else {
				return episodeName;
			}
		} else {
			if (seriesNo !== undefined && episodeNo !== undefined) {
				seasonNumber = seriesNo;
				if (seasonNumber < 10){
					seasonString = "0" + seasonNumber;
				} else {
					seasonString = seasonNumber;
				}
				episodeNumber = episodeNo;
				if (episodeNumber < 10){
					episodeString = "0" + episodeNumber;
				} else {
					episodeString = episodeNumber;
				}
				nameLabel = seriesName + "<br>S" + seasonString + "E" + episodeString + " - " + episodeName;
			} else {
				nameLabel = seriesName + "<br>" + episodeName;
			}
		}
	} else {
		 if (seriesName == "" || seriesName == null) {
				if (seriesNo !== undefined && episodeNo !== undefined) {
					if (episodeName == "" || episodeName == null) {
						nameLabel = "S" + seriesNo + ",E" + episodeNo;
					} else {
						nameLabel = "S" + seriesNo + ",E" + episodeNo + " - " + episodeName;
					}
				} else {
					nameLabel = episodeName;
				}
			} else {
				if (seriesNo !== undefined && episodeNo !== undefined) {
					nameLabel = seriesName + "<br>S" + seriesNo + ",E" + episodeNo + " - " + episodeName;
				} else {
					nameLabel = seriesName + "<br>" + episodeName;
				}
			}
	}
	if (airTime !== undefined){
		nameLabel += "<br>" + airTime;
	}
	if (airTime !== undefined && aeriesStudio !== undefined){
		nameLabel += " on ";
	}
	if (seriesStudio !== undefined){
		nameLabel += aeriesStudio;
	}
	return nameLabel;
};

//-----------------------------------------------------------------------------------------------------------------------------------------

//ByPass Counter required for views that have 2 lists (Like Home Page) so I only display the counter of the active list
Support.updateSelectedNEW = function(array, selectedItemID, startPos, endPos, strIfSelected, strIfNot, divIdPrepend, dontUpdateCounter, totalRecordCount) {
	for (var index = startPos; index < endPos; index++){
		if (index == selectedItemID) {
			document.getElementById(divIdPrepend + array[index].Id).style.zIndex = "5";
			document.getElementById(divIdPrepend + array[index].Id).className = strIfSelected;
		} else {
			document.getElementById(divIdPrepend + array[index].Id).style.zIndex = "2";
			document.getElementById(divIdPrepend + array[index].Id).className = strIfNot;
		}
	}
	//Update Counter DIV
	if (dontUpdateCounter == true) { //Done like this so it will process null
	} else {
		if (array.length == 0) {
			this.widgetPutInnerHTML("counter", "");
		} else {
			if (totalRecordCount !== undefined || totalRecordCount != null) {
				this.widgetPutInnerHTML("counter", (selectedItemID + 1) + "/" + totalRecordCount);
			} else {
				this.widgetPutInnerHTML("counter", (selectedItemID + 1) + "/" + array.length);
			}
		}
	}
};

//-----------------------------------------------------------------------------------------------------------------------------------------

Support.processSelectedItem = function(page, itemData, startParams, selectedItem, topLeftItem, isTop, genreType, isLatest) {
	var url = "";
	if (page == "HomeTwoItems") {
		this.updateURLHistory(page, startParams[0], startParams[1], startParams[2], startParams[3], selectedItem, topLeftItem, isTop);
	} else {
		if (startParams == null) {
			this.updateURLHistory(page, null, null, null, null, selectedItem, topLeftItem,null);
		} else {
			this.updateURLHistory(page, startParams[0], startParams[1], null, null, selectedItem, topLeftItem, null);
		}
	}
	if (itemData.Items[selectedItem].CollectionType != null) {
		alert("CollectionType: " + itemData.Items[selectedItem].CollectionType);
		switch (itemData.Items[selectedItem].CollectionType) {
		case "boxsets":
			//URL Below IS TEMPORARY TO GRAB SERIES OR FILMS ONLY - IN FUTURE SHOULD DISPLAY ALL
			url = Server.getChildItemsURL(itemData.Items[selectedItem].Id, "&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
			DisplaySeries.start("All Collections",url,0,0);
			break;
		case "tvshows" :
			url = Server.getChildItemsURL(itemData.Items[selectedItem].Id, "&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Series&Recursive=true&CollapseBoxSetItems=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
			DisplaySeries.start("All TV",url,0,0);
			break;
		case "movies" :
			url = Server.getChildItemsURL(itemData.Items[selectedItem].Id, "&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Movie&Recursive=true&CollapseBoxSetItems=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
			DisplaySeries.start("All Movies", url, 0, 0);
			break;
		case "music" :
			if (Main.isMusicEnabled()) {
				url = Server.getChildItemsURL(itemData.Items[selectedItem].Id, "&IncludeItemTypes=MusicAlbum&Recursive=true&ExcludeLocationTypes=Virtual&fields=ParentId,SortName&CollapseBoxSetItems=false");
				DisplaySeries.start("Album Music", url, 0, 0);
			} else {
				Support.removeLatestURL();
			}
			break;
		case "photos" :
			url = Server.getChildItemsURL(itemData.Items[selectedItem].Id, "&SortBy=SortName&SortOrder=Ascending&fields=PrimaryImageAspectRatio,SortName");
			Photos.start(itemData.Items[selectedItem].Name, url, 0, 0);
			break;
		case "playlists":
			url = Server.getChildItemsURL(itemData.Items[selectedItem].Id, "&SortBy=SortName&SortOrder=Ascending&fields=SortName");
			DisplayOneItem.start(itemData.Items[selectedItem].Name, url, 0, 0);
			break;
		default:
			url = Server.getChildItemsURL(itemData.Items[selectedItem].Id, "&SortBy=SortName&SortOrder=Ascending&fields=PrimaryImageAspectRatio,SortName");
			if (page == "Photos"){
				Photos.start(itemData.Items[selectedItem].Name, url, 0, 0);
			} else {
				DisplayOneItem.start(itemData.Items[selectedItem].Name, url, 0, 0);
			}
			break;
		}
	} else {
		alert("Type: " + itemData.Items[selectedItem].Type + " MeidaType: "+itemData.Items[selectedItem].MediaType);
		switch (itemData.Items[selectedItem].Type) {
		case "ManualCollectionsFolder":
			url = Server.getChildItemsURL(itemData.Items[selectedItem].Id, "&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
			DisplaySeries.start("All Collections", url, 0, 0);
			break;
		case "BoxSet":
			url = Server.getChildItemsURL(itemData.Items[selectedItem].Id, "&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
			DisplaySeries.start("All Collections", url, 0, 0);
			break;
		case "Series":
			//Is Latest Items Screen - If so skip to Episode view of latest episodes
			if (isLatest) {
				url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items/Latest?format=json&Limit=" + itemData.Items[selectedItem].ChildCount + "&ParentId=" + itemData.Items[selectedItem].Id+"&isPlayed=false&IsFolder=false&GroupItems=false&fields=SortName,Overview,Genres,RunTimeTicks");
				DisplayEpisodes.start("New TV", url, 0, 0);
			} else {
				url = Server.getItemInfoURL(itemData.Items[selectedItem].Id, null);
				TVShow.start(itemData.Items[selectedItem].Name, url, 0, 0);
			}
			break;
		case "Movie":
			url = Server.getItemInfoURL(itemData.Items[selectedItem].Id,null);
			if (page == "DisplaySeries"){
				ItemDetails.start(itemData.Items[selectedItem].Name, url, 0);
			} else {
				ItemDetails.start(itemData.Items[selectedItem].Name, url, 0);
			}
			break;
		case "Episode":
			url = Server.getItemInfoURL(itemData.Items[selectedItem].Id, null);
			ItemDetails.start(itemData.Items[selectedItem].Name, url, 0);
			break;
		case "Genre":
			url = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=" + genreType + "&Recursive=true&CollapseBoxSetItems=false&fields=ParentId,SortName,Overview,RunTimeTicks&Genres=" + itemData.Items[selectedItem].Name);
			var name = (genreType == "Series") ? "Genre TV" : "Genre Movies";
			DisplaySeries.start(name, url, 0, 0);
			break;
		case "MusicArtist":
			var artist = itemData.Items[selectedItem].Name.replace(/ /g, '+');
			artist = artist.replace(/&/g, '%26');
			url = Server.getItemTypeURL("&SortBy=Album%2CSortName&SortOrder=Ascending&IncludeItemTypes=Audio&Recursive=true&CollapseBoxSetItems=false&Artists=" + artist);
			Music.start(itemData.Items[selectedItem].Name, url, itemData.Items[selectedItem].Type);
			break;
		case "MusicAlbum":
			var url = Server.getChildItemsURL(itemData.Items[selectedItem].Id, "&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Audio&Recursive=true&CollapseBoxSetItems=false");
			Music.start(itemData.Items[selectedItem].Name, url, itemData.Items[selectedItem].Type);
			break;
		case "Folder":
		case "PhotoAlbum":
		case "CollectionFolder":
			url = Server.getChildItemsURL(itemData.Items[selectedItem].Id, "&SortBy=SortName&SortOrder=Ascending&fields=PrimaryImageAspectRatio,SortName,ParentId");
			if (page == "Photos"){
				Photos.start(itemData.Items[selectedItem].Name, url, 0, 0);
			} else {
				DisplayOneItem.start(itemData.Items[selectedItem].Name, url, 0, 0);
			}
			break;
		case "Channel":
			url = Server.getCustomURL("/Channels/" + itemData.Items[selectedItem].Id + "/Items?userId="+Server.getUserID() + "&fields=SortName&format=json");
			DisplayOneItem.start(itemData.Items[selectedItem].Name, url, 0, 0);
			break;
		case "ChannelFolderItem":
			url = Server.getCustomURL("/Channels/" + itemData.Items[selectedItem].ChannelId + "/Items?userId="+Server.getUserID() + "&folderId=" + itemData.Items[selectedItem].Id + "&fields=SortName&format=json");
			DisplayOneItem.start(itemData.Items[selectedItem].Name, url, 0, 0);
			break;
		case "TvChannel":
			this.playSelectedItem("DisplaySeries", itemData, startParams, selectedItem, topLeftItem, null);
			break;
		case "Playlist":
			url = Server.getCustomURL("/Playlists/" + itemData.Items[selectedItem].Id + "/Items?userId=" + Server.getUserID() + "&fields=SortName&SortBy=SortName&SortOrder=Ascending&format=json");
			Playlist.start(itemData.Items[selectedItem].Name, url, itemData.Items[selectedItem].MediaType, itemData.Items[selectedItem].Id);
			break;
		default:
			switch (itemData.Items[selectedItem].MediaType) {
			case "Photo":
				ImagePlayer.start(itemData, selectedItem);
				break;
			case "Video":
				url = Server.getItemInfoURL(itemData.Items[selectedItem].Id, null);
				ItemDetails.start(itemData.Items[selectedItem].Name, url, 0);
				break;
			case "Audio":
				this.removeLatestURL(); //Music player loads within the previous page - thus remove!
				url = Server.getItemInfoURL(itemData.Items[selectedItem].Id, null);
				MusicPlayer.start("Song", url, page, false, false, itemData.Items[selectedItem].Id);
				break;
			default:
				this.removeLatestURL();
				break;
			}
			break;
		}
	}
};

//-----------------------------------------------------------------------------------------------------------------------------------------

Support.playSelectedItem = function(page, itemData, startParams, selectedItem, topLeftItem, isTop) {
	var url = "";
	startParams[2] = (startParams[2] === undefined) ? null : startParams[2];
	startParams[3] = (startParams[3] === undefined) ? null : startParams[3];
	alert("playSelectedItem: CollectionType " + itemData.Items[selectedItem].CollectionType);
	alert("playSelectedItem: MediaType " + itemData.Items[selectedItem].MediaType);
	alert("playSelectedItem: Type " + itemData.Items[selectedItem].Type);
	if (itemData.Items[selectedItem].Type == "Folder") {
		if (page == "Photos") {
			this.updateURLHistory(page, startParams[0], startParams[1], startParams[2], startParams[3], selectedItem, topLeftItem, isTop);
			ImagePlayer.start(itemData, selectedItem, true);
		}
	} else if (itemData.Items[selectedItem].MediaType == "Video" && itemData.Items[selectedItem].Type != "TvChannel" && itemData.Items[selectedItem].Type != "Playlist") {
		if (itemData.Items[selectedItem].LocationType == "Virtual"){
			return;
		}
		this.updateURLHistory(page,startParams[0], startParams[1], startParams[2], startParams[3], selectedItem, topLeftItem, isTop);
		url = Server.getItemInfoURL(itemData.Items[selectedItem].Id, "&ExcludeLocationTypes=Virtual");
		Player.start("PLAY", url, itemData.Items[selectedItem].UserData.PlaybackPositionTicks / 10000, page);
	} else if (itemData.Items[selectedItem].Type == "Playlist") {
		url = Server.getCustomURL("/Playlists/" + itemData.Items[selectedItem].Id + "/Items?userId="+Server.getUserID() + "&StartIndex=0&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,MediaSources");
		if (itemData.Items[selectedItem].MediaType == "Video"){
			this.updateURLHistory(page, startParams[0], startParams[1], startParams[2], startParams[3], selectedItem, topLeftItem, isTop);
			Player.start("PlayAll", url, 0, page);
		} else if (itemData.Items[selectedItem].MediaType == "Audio"){
			MusicPlayer.start("Album", url, page, false);
		} else {
			return;
		}
	} else if (itemData.Items[selectedItem].MediaType == "ChannelVideoItem") {
		this.updateURLHistory(page,startParams[0], startParams[1], startParams[2], startParams[3], selectedItem, topLeftItem, isTop);
		url = Server.getItemInfoURL(itemData.Items[selectedItem].Id, "&ExcludeLocationTypes=Virtual");
		Player.start("PLAY", url, itemData.Items[selectedItem].UserData.PlaybackPositionTicks / 10000,page);
	}  else if (itemData.Items[selectedItem].Type == "TvChannel") {
		this.updateURLHistory(page, startParams[0], startParams[1], startParams[2], startParams[3], selectedItem, topLeftItem, isTop);
		url = Server.getItemInfoURL(itemData.Items[selectedItem].Id,"&ExcludeLocationTypes=Virtual");
		Player.start("PLAY", url, 0, page);
	}  else if (itemData.Items[selectedItem].CollectionType == "Photos") {
		this.updateURLHistory(page, startParams[0], startParams[1], startParams[2], startParams[3], selectedItem, topLeftItem, isTop);
		ImagePlayer.start(itemData, selectedItem, true);
	} else if (itemData.Items[selectedItem].Type == "PhotoAlbum") {
		this.updateURLHistory(page, startParams[0], startParams[1], startParams[2], startParams[3], selectedItem, topLeftItem, isTop);
		ImagePlayer.start(itemData, selectedItem, true);
	} else if (itemData.Items[selectedItem].Type == "Series") {
		this.updateURLHistory(page, startParams[0], startParams[1], null, null, selectedItem, topLeftItem, null);
		url= Server.getChildItemsURL(itemData.Items[selectedItem].Id, "&ExcludeLocationTypes=Virtual&IncludeItemTypes=Episode&Recursive=true&SortBy=SortName&SortOrder=Ascending&Fields=ParentId,SortName,MediaSources");
		Player.start("PlayAll", url, 0, page);
	} else if (itemData.Items[selectedItem].Type == "Season") {
		this.updateURLHistory(page, startParams[0], startParams[1], null, null, selectedItem, topLeftItem, null);
		var urlToPlay= Server.getChildItemsURL(itemData.Items[selectedItem].Id, "&ExcludeLocationTypes=Virtual&IncludeItemTypes=Episode&Recursive=true&SortBy=SortName&SortOrder=Ascending&Fields=ParentId,SortName,MediaSources");
		Player.start("PlayAll", urlToPlay, 0, page);
	} else if (itemData.Items[selectedItem].Type == "Movie" || itemData.Items[selectedItem].Type == "Episode") {
		this.updateURLHistory(page, startParams[0], startParams[1], null, null, selectedItem, topLeftItem, null);
		url = Server.getItemInfoURL(itemData.Items[selectedItem].Id,"&ExcludeLocationTypes=Virtual");
		Player.start("PLAY", url, 0, page);
	} else if (itemData.Items[selectedItem].Type == "MusicAlbum") {
		this.updateURLHistory(page, startParams[0], startParams[1], null, null, selectedItem, topLeftItem, null);
		url = Server.getChildItemsURL(itemData.Items[selectedItem].Id, "&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Audio&Recursive=true&CollapseBoxSetItems=false&Fields=MediaSources");
		MusicPlayer.start("Album", url, "DisplaySeries", false);
	} else if (itemData.Items[selectedItem].Type == "Audio") {
		this.updateURLHistory(page, startParams[0], startParams[1], null, null, selectedItem, topLeftItem, null);
		url = Server.getItemInfoURL(itemData.Items[selectedItem].Id);
		MusicPlayer.start("Song", url, "DisplaySeries", false);
	}
};

//-----------------------------------------------------------------------------------------------------------------------------------------

Support.scrollingText = function(divToScroll) {
	clearTimeout(this.startScroll);
	clearTimeout(this.resetToTop);
	clearInterval(this.scroller);

	var div = $('#' + divToScroll+'');
	div.scrollTop(0);
	this.scrollpos = 0;

	this.startScroll = setTimeout(function(){
		this.scroller = setInterval(function(){
			var pos = div.scrollTop() + 1;
			div.scrollTop(pos);

			if (this.scrollpos == pos) {
				clearInterval(this.scroller);
				this.resetToTop = setTimeout(function(){
					Support.scrollingText(divToScroll);
				}, 10000); //Length of pause at the bottom
			} else {
				this.scrollpos = pos;
			}
		}, 200); //Scrolling speed
	}, 10000);  //Intial delay
};

Support.getLocalizationName = function(index) {
	var name = "";
	switch(index) {
		case "Home":
			name = Main.messages.LabHome;
			break;
		case "Favourites":
			name = Main.messages.LabFavourites;
			break;
		case "TVShows":
			name = Main.messages.LabTVShows;
			break;
		case "Home_Movies":
			name = Main.messages.LabHomeMovies;
			break;
		case "Collections":
			name = Main.messages.LabCollections;
			break;
		case "Movies":
			name = Main.messages.LabMovies;
			break;
		case "Photos":
			name = Main.messages.LabPhotos;
			break;
		case "Music":
			name = Main.messages.LabMusic;
			break;
		case "Playlists":
			name = Main.messages.LabPlaylists;
			break;
		case "Live_TV":
			name = Main.messages.LabLiveTV;
			break;
		case "Channels":
			name = Main.messages.LabChannels;
			break;
		case "Media Folders":
		case "Media_Folders":
			name = Main.messages.LabMediaFolders;
			break;
		case "Search":
			name = Main.messages.LabSearch;
			break;
		case "Settings":
			name = Main.messages.LabSettings;
			break;
		case "Log_Out":
			name = Main.messages.LabLogOut;
			break;
		case "Latest Movies":
			name = Main.messages.LabLatestMovies;
			break;
		default:
			alert("Unhandled index");
			name = index;
			break;
	}
	return name;
}

Support.generateMainMenu = function() {
	var menuItems = [];
	menuItems.push("Home");
	//Check Favourites
	var urlFav = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&Filters=IsFavorite&fields=SortName&recursive=true");
	var hasFavourites = Server.getContent(urlFav);
	if (hasFavourites == null) { return; }
	if (hasFavourites.TotalRecordCount > 0) {
		menuItems.push("Favourites");
	}
	var userViews = Server.getUserViews();
	for (var i = 0; i < userViews.Items.length; i++){
		if (userViews.Items[i].CollectionType == "tvshows" ||
			userViews.Items[i].CollectionType == "homevideos" ||
			userViews.Items[i].CollectionType == "boxsets" ||
			userViews.Items[i].CollectionType == "movies" ||
			userViews.Items[i].CollectionType == "photos" ||
			userViews.Items[i].CollectionType == "music"){
			var name = "";
			if (userViews.Items[i].CollectionType == "tvshows") {
				name = "TVShows";
			} else if (userViews.Items[i].CollectionType == "homevideos") {
				name = "Home_Movies";
			} else if (userViews.Items[i].CollectionType == "boxsets") {
				name = "Collections";
			} else if (userViews.Items[i].CollectionType == "movies") {
				name = "Movies";
			} else if (userViews.Items[i].CollectionType == "photos") {
				name = "Photos";
			} else if (userViews.Items[i].CollectionType == "music") {
				name = "Music";
			}
			if ($.inArray(name, menuItems) < 0) {
				menuItems.push(name);
			}
		}
	}
	//Check Server Playlists
	var urlPlaylists = Server.getItemTypeURL("/SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Playlist&Recursive=true&Limit=0");
	var hasPlaylists = Server.getContent(urlPlaylists);
	if (hasPlaylists == null) { return; }
	if (hasPlaylists.TotalRecordCount > 0) {
		menuItems.push("Playlists");
	}
	//Check Live TV
	var liveTvAdded = false;
	var urlLiveTV = Server.getCustomURL("/LiveTV/Info?format=json");
	var hasLiveTV = Server.getContent(urlLiveTV);
	if (hasLiveTV == null) { return; }
	if (Main.isLiveTVEnabled() && hasLiveTV.IsEnabled) {
		for (var index = 0; index < hasLiveTV.EnabledUsers.length; index++) {
			if (Server.getUserID() == hasLiveTV.EnabledUsers[index]) {
				menuItems.push("Live_TV");
				liveTvAdded = true;
				break;
			}
		}
	}
	//Guide goes here
	//Recordings
	var urlRecordings = Server.getCustomURL("/LiveTV/Recordings?IsInProgress=false&SortBy=SortName&SortOrder=Ascending&StartIndex=0&fields=SortName&format=json");
	var hasRecordings = Server.getContent(urlRecordings);
	if (hasRecordings == null) { return; }
	if (hasRecordings.TotalRecordCount > 0) {
		if (!liveTvAdded){
			menuItems.push("Live_TV");
		}
	}
	//Check Channels
	if (Main.isChannelsEnabled()) {
		var urlChannels = Server.getCustomURL("/Channels?userId=" + Server.getUserID() + "&format=json");
		var hasChannels = Server.getContent(urlChannels);
		if (hasChannels == null) { return; }
		if (hasChannels.Items.length > 0) {
			menuItems.push("Channels");
		}
	}
	//Check Media Folders
	var urlMF = Server.getItemTypeURL("&Limit=0");
	var hasMediaFolders = Server.getContent(urlMF);
	if (hasMediaFolders == null) { return; }
	if (hasMediaFolders.TotalRecordCount > 0) {
		menuItems.push("Media_Folders");
	}
	return menuItems;
};

Support.generateTopMenu = function() {
	var menuItems = [];
	var userViews = Server.getUserViews();
	for (var i = 0; i < userViews.Items.length; i++){
		if (userViews.Items[i].CollectionType == "tvshows" ||
			userViews.Items[i].CollectionType == "boxsets" ||
			userViews.Items[i].CollectionType == "movies" ||
			userViews.Items[i].CollectionType == "photos" ||
			userViews.Items[i].CollectionType == "music"){
			var name = "";
			if (userViews.Items[i].CollectionType == "tvshows") {
				name = "TVShows";
			} else if (userViews.Items[i].CollectionType == "boxsets") {
				name = "Collections";
			} else if (userViews.Items[i].CollectionType == "movies") {
				name = "Movies";
			} else if (userViews.Items[i].CollectionType == "photos") {
				name = "Photos";
			} else if (userViews.Items[i].CollectionType == "music") {
				name = "Music";
			}
			if ($.inArray(name, menuItems) < 0) {
				menuItems.push(name);
			}
		}
	}
	//Check Media Folders
	var urlMF = Server.getItemTypeURL("&Limit=0");
	var hasMediaFolders = Server.getContent(urlMF);
	if (hasMediaFolders == null) { return; }
	if (hasMediaFolders.TotalRecordCount > 0) {
		menuItems.push("Media_Folders");
	}
	return menuItems;
};

Support.initViewUrls = function() {
	alert("Initialising View URL's for this user");
	this.TVNextUp = Server.getServerAddr() + "/Shows/NextUp?format=json&UserId=" + Server.getUserID() + "&IncludeItemTypes=Episode&ExcludeLocationTypes=Virtual&Limit=24&Fields=PrimaryImageAspectRatio,SeriesInfo,DateCreated,SyncInfo,SortName&ImageTypeLimit=1&EnableImageTypes=Primary,Backdrop,Banner,Thumb&EnableTotalRecordCount=false";
	this.Favourites = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&Filters=IsFavorite&fields=SortName&recursive=true");
	this.FavouriteMovies = Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items?format=json&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Movie" + Server.getMoviesViewQueryPart() + "&Filters=IsFavorite&Limit=10&Recursive=true&Fields=PrimaryImageAspectRatio,SyncInfo&CollapseBoxSetItems=false&ExcludeLocationTypes=Virtual";
	this.FavouriteSeries = Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items?format=json&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Series" + Server.getTVViewQueryPart() + "&Filters=IsFavorite&Limit=10&Recursive=true&Fields=PrimaryImageAspectRatio,SyncInfo&CollapseBoxSetItems=false&ExcludeLocationTypes=Virtual";
	this.FavouriteEpisodes = Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items?format=json&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Episode&Filters=IsFavorite&Limit=10&Recursive=true&Fields=PrimaryImageAspectRatio,SyncInfo&CollapseBoxSetItems=false&ExcludeLocationTypes=Virtual";
	this.SuggestedMovies = Server.getCustomURL("/Movies/Recommendations?format=json&userId=" + Server.getUserID() + "&categoryLimit=2&ItemLimit=6&Fields=PrimaryImageAspectRatio,MediaSourceCount,SyncInfo&ImageTypeLimit=1&EnableImageTypes=Primary,Backdrop,Banner,Thumb");
	this.MediaFolders = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&CollapseBoxSetItems=false&fields=SortName");
	this.LatestTV = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Episode&IsFolder=false&fields=SortName,Overview,Genres,RunTimeTicks");
	this.LatestMovies = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Movie" + Server.getMoviesViewQueryPart() + "&IsFolder=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
};

Support.getViewUrl = function(viewName) {
	alert("returning url for " + viewName + " : " + this[viewName]);
	return this[viewName];
};

Support.removeSplashScreen = function () {
	setTimeout(function(){
		document.getElementById("splashScreen").style.opacity=0;
		setTimeout(function(){
			document.getElementById("splashScreen").style.visibility="hidden";
		}, 1600);
	}, 2000);
	FileLog.write("Removing the splash screen.");
};

//-----------------------------------------------------------------------------------------------------------------------------------------

Support.processHomePageMenu = function(menuItem) {
	var url1 = "";
	var url2 = "";
	var title1 = "";
	var title2 = "";
	var resumeItems = "";
	var url = "";
	switch (menuItem) {
	case "Home":
		Support.removeAllURLs();
		url = Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items?SortBy=DatePlayed&SortOrder=Descending&MediaTypes=Video&Filters=IsResumable&Limit=10&Recursive=true&Fields=PrimaryImageAspectRatio,BasicSyncInfo&CollapseBoxSetItems=false&ExcludeLocationTypes=Virtual&ImageTypeLimit=1&EnableImageTypes=Primary,Backdrop,Banner,Thumb&EnableTotalRecordCount=false";
		resumeItems = Server.getContent(url);
		if (resumeItems.Items.length > 0 && File.getUserProperty("ContinueWatching") == true){
			url1 = url;
			title1 = "Continue Watching";
			url2 = Support.getViewUrl(File.getUserProperty("View1"));
			title2 = File.getUserProperty("View1Name");
			FileLog.write("HV1 Title: " + title1);
			FileLog.write("HV2 Title: " + title2);
		} else {
			url1 = Support.getViewUrl(File.getUserProperty("View1"));
			title1 = File.getUserProperty("View1Name");
			FileLog.write("HV1 Title: " + title1);
			if (File.getUserProperty("View2") != null) {
				url2 = Support.getViewUrl(File.getUserProperty("View2"));
				title2 = File.getUserProperty("View2Name");
				FileLog.write("HV2 Title: " + title2);
			}
		}
		if (url2 != null) {
			HomeTwoItems.start(title1, url1, title2, url2, 0, 0, true);
		} else {
			HomeOneItem.start(title1, url1, 0, 0);
		}
		break;
	case "Favourites":
		url = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&Filters=IsFavorite&fields=SortName&recursive=true");
		DisplayOneItem.start("Favourites", url, 0, 0);
		break;
	case "Media_Folders":
		url = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&CollapseBoxSetItems=false&fields=SortName");
		DisplayOneItem.start("Media Folders", url, 0, 0);
		break;
	case "Channels":
		url = Server.getCustomURL("/Channels?userId=" + Server.getUserID() + "&format=json");
		DisplayOneItem.start("Channels", url, 0, 0);
		break;
	case "Collections":
		url = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=BoxSet&Recursive=true&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
		DisplaySeries.start("All Collections", url,0,0);
		break;
	case "TVShows":
		url = Server.getItemTypeURL("&IncludeItemTypes=Series"+Server.getTVViewQueryPart()+"&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&recursive=true");
		DisplaySeries.start("All TV",url,0,0);
		break;
	case "Movies":
		url = Server.getItemTypeURL("&IncludeItemTypes=Movie" + Server.getMoviesViewQueryPart() + "&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&recursive=true");
		DisplaySeries.start("All Movies", url, 0, 0);
		break;
	case "Music":
		this.enterMusicPage(File.getUserProperty("MusicView"));
		break;
	case "Playlists":
		url = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&fields=SortName&IncludeItemTypes=Playlist&Recursive=true");
		DisplayOneItem.start("Playlists", url, 0, 0);
		break;
	case "Photos":
		var photosFolderId = Server.getUserViewId("photos");
		if (photosFolderId != null){
			url = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&Fields=SortName&StartIndex=0&Limit=500&Recursive=false&IncludeItemTypes=&MediaTypes=&ParentId=" + photosFolderId);
			Photos.start("Photos", url, 0, 0);
		}
		break;
	case "Live_TV":
		url = Server.getCustomURL("/LiveTV/Channels?StartIndex=0&Limit=100&EnableFavoriteSorting=true&UserId=" + Server.getUserID());
		var guideTime = new Date();
		var timeMsec = guideTime.getTime();
		var startTime = timeMsec - 300000; //rewind the clock five minutes.
		guideTime.setTime(startTime);
		TVGuide.start("Guide", url, 0, 0, 0, guideTime);
		break;
	case "Home_Movies":
		var homeVideosFolderId = Server.getUserViewId("homevideos");
		if (homeVideosFolderId != null){
			url = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&fields=PrimaryImageAspectRatio,SortName&ParentId=" + homeVideosFolderId);
			DisplayOneItem.start("Home Movies", url, 0, 0);
		}
		break;
	case "Search":
		Search.start();
		break;
	case "Settings":
		Settings.start();
		break;
	case "Log_Out":
		if (File.getUserProperty("ForgetSavedPassword")) {
			File.setUserProperty("Password","");
			File.setUserProperty("ForgetSavedPassword",false);
		}
		Support.logout();
		break;
	}
};

Support.enterMusicPage = function(musicView) {
	var url = "";
	if (File.getUserProperty("SkipMusicAZ")){
		switch (musicView) {
			case "Album":
				url = Server.getItemTypeURL("&IncludeItemTypes=MusicAlbum&Recursive=true&SortBy=SortName&SortOrder=Ascending&ExcludeLocationTypes=Virtual&fields=SortName,Genres&CollapseBoxSetItems=false");
				DisplaySeries.start("Album Music", url, 0, 0);
				break;
			case "Album Artist":
				url = Server.getCustomURL("/Artists/AlbumArtists?format=json&SortBy=SortName&SortOrder=Ascending&Recursive=true&ExcludeLocationTypes=Virtual&Fields=ParentId,SortName,Genres,ItemCounts&userId=" + Server.getUserID());
				MusicArtist.start("Album Artist", url, 0, 0);
				break;
			case "Artist":
				url = Server.getCustomURL("/Artists?format=json&SortBy=SortName&SortOrder=Ascending&Recursive=true&ExcludeLocationTypes=Virtual&Fields=ParentId,SortName,Genres,ItemCounts&userId=" + Server.getUserID());
				DisplaySeries.start("Artist Music", url, 0, 0);
				break;
			case "Recent":
				url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items?format=json&SortBy=DatePlayed&SortOrder=Descending&IncludeItemTypes=Audio&Filters=IsPlayed&Limit=21&Recursive=true&fields=SortName,Genres");
				DisplaySeries.start("Recent Music", url, 0, 0);
				break;
			case "Frequent":
				url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items?format=json&SortBy=PlayCount&SortOrder=Descending&IncludeItemTypes=Audio&Limit=21&Filters=IsPlayed&Recursive=true&fields=SortName,Genres");
				DisplaySeries.start("Frequent Music", url, 0, 0);
				break;
		}
	} else {
		switch (musicView) {
			case "Album":
			case "Album Artist":
			case "Artist":
				MusicAZ.start(musicView,0);
				break;
			case "Recent":
				url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items?format=json&SortBy=DatePlayed&SortOrder=Descending&IncludeItemTypes=Audio&Filters=IsPlayed&Limit=21&Recursive=true&fields=SortName,Genres");
				DisplaySeries.start("Recent Music", url, 0, 0);
				break;
			case "Frequent":
				url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items?format=json&SortBy=PlayCount&SortOrder=Descending&IncludeItemTypes=Audio&Limit=21&Filters=IsPlayed&Recursive=true&fields=SortName,Genres");
				DisplaySeries.start("Frequent Music", url, 0, 0);
				break;
		}
	}
};

Support.parseSearchTerm = function(searchTermString) {
	var parsedString = searchTermString.replace(/ /gi, "%20");
	//Probably more chars to parse here!
	return parsedString;
};

Support.fadeImage = function(imgsrc) {
	var bg = $('#pageBackground').css('background-image');
	bg = bg.replace('url(','').slice(0, -1);
	if (bg.substring(0,5) == "'file") {
		bg = bg.substring(bg.indexOf("images")).slice(0, -1);
	}
	//Do nothing if the image is the same as the old one.
	if (bg != imgsrc) {
		//Copy the current background image to the holder.
		document.getElementById("pageBackgroundHolder").style.backgroundImage = "url('" + bg + "')";
		//Make the standard pageBackground transparent.
		document.getElementById("pageBackground").className = "pageBackground quickFade";
		document.getElementById("pageBackground").style.opacity = "0";
		setTimeout(function(){
			document.getElementById("pageBackground").style.backgroundImage = "url('" + imgsrc + "')";
			document.getElementById("pageBackground").className = "pageBackground";
			document.getElementById("pageBackground").style.opacity = "1";
		}, 350);
	}
};

//-----------------------------------------------------------------------------------------------------------------------------------------

Support.screensaver = function () {
	if (Main.isScreensaverEnabled()) {
		clearTimeout(this.screensaverVar);
		this.screensaverVar  = setTimeout(function(){
			if (this.isScreensaverOn == true) {
				ImagePlayerScreensaver.start();
			}
		}, File.getUserProperty("ScreensaverTimeout"));
	}
};

Support.screensaverOn = function () {
	this.isScreensaverOn = true;
};

Support.screensaverOff = function () {
	if (Main.isScreensaverEnabled()) {
		clearTimeout(this.screensaverVar);
		this.isScreensaverOn = false;

		if (Main.getIsScreensaverRunning()) {
			Main.setIsScreensaverRunning(); //Sets to False
			ImagePlayerScreensaver.stopScreensaver(); //Kill Screensaver
		}
	}
};

//-----------------------------------------------------------------------------------------------------------------------------------------

Support.pageLoadTimes = function(page, process, reset) {
	if (reset == true) {
		this.pageLoadedTime = new Date().getTime();
	} else {
		var time = new Date().getTime() - this.pageLoadedTime;
		switch (process) {
			case "Start":
			FileLog.write("Loading : " + page + " : New Page Loaded : Time 0");
			break;
			case "RetrievedServerData":
				FileLog.write("Loading : " + page + " : Retrieved Data From Server : Time " + time + "ms");
			break;
			case "UserControl":
				FileLog.write("Loading : " + page + " : User Control : Time " + time + "ms");
			break;
			case "GetRemainingItems":
				FileLog.write("Loading : " + page + " : Getting Additional Data > 200 Items : Time " + time + "ms");
			break;
			case "GotRemainingItems":
				FileLog.write("Loading : " + page + " : Got Additional Data > 200 Items : Time " + time + "ms");
			break;
			case "AddedRemainingItems":
				FileLog.write("Loading : " + page + " : Added Additional Data > 200 Items to original 200 Items : Time " + time + "ms");
			break;
			default:
			break;
		}
	}
};

//-----------------------------------------------------------------------------------------------------------------------------------------

Support.noItemsKeyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);
	if (document.getElementById("notifications").style.visibility == "") {
		Notifications.delNotification();
		widgetAPI.blockNavigation(event);
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	//Update Screensaver Timer
	this.screensaver();
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
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			this.processReturnURLHistory();
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
	}
};

//-----------------------------------------------------------------------------------------------------------------------------------------

Support.convertTicksToTime = function (currentTime, duration) {
	var totalTimeHour = Math.floor(duration / 3600000);
	var timeHour = Math.floor(currentTime / 3600000);
	var totalTimeMinute = Math.floor((duration % 3600000) / 60000);
	var timeMinute = Math.floor((currentTime % 3600000) / 60000);
	var totalTimeSecond = Math.floor((duration % 60000) / 1000);
	var timeSecond = Math.floor((currentTime % 60000) / 1000);
	var timeHTML = timeHour + ":";
	if (timeMinute == 0) {
		timeHTML += "00:";
	} else if (timeMinute < 10) {
		 timeHTML += "0" + timeMinute + ":";
	} else {
		 timeHTML += timeMinute + ":";
	}
	if (timeSecond == 0) {
		timeHTML += "00/";
	} else if (timeSecond < 10) {
		 timeHTML += "0" + timeSecond + "/";
	} else {
		 timeHTML += timeSecond + "/";
	}
	timeHTML += totalTimeHour + ":";

	if (totalTimeMinute == 0) {
		 timeHTML += "00:";
	} else if (totalTimeMinute < 10)
		timeHTML += "0" + totalTimeMinute + ":";
	else {
		 timeHTML += totalTimeMinute + ":";
	}
	if (totalTimeSecond == 0) {
		 timeHTML += "00";
	} else if (totalTimeSecond < 10) {
		timeHTML += "0" + totalTimeSecond;
	} else
		timeHTML += totalTimeSecond;
	return timeHTML;
};

Support.convertTicksToTimeSingle = function (currentTime) {
   var timeHour = Math.floor(currentTime / 3600000);
   var timeMinute = Math.floor((currentTime % 3600000) / 60000);
   var timeSecond = Math.floor((currentTime % 60000) / 1000);
   var timeHTML = timeHour + ":";
   if (timeMinute == 0) {
	   timeHTML += "00:";
   } else if (timeMinute < 10) {
		timeHTML += "0" + timeMinute + ":";
   } else {
		timeHTML += timeMinute + ":";
   }
   if (timeSecond == 0) {
	   timeHTML += "00";
   } else if (timeSecond < 10) {
		timeHTML += "0" + timeSecond;
   } else {
		timeHTML += timeSecond;
   }
   //ShowMin will show only the time without any leading 00
   if (timeHour == 0) {
	   timeHTML = timeHTML.substring(2, timeHTML.length);
   }
   return timeHTML;
};

Support.convertTicksToMinutes = function (currentTime) {
	var timeMinute = Math.floor((currentTime / 3600000) * 60);
	return timeMinute + " mins";
};

//-------------------------------------------------------------------------------------------------------------

Support.SeriesRun = function(type, prodyear, status, enddate) {
	var output = "";
	if (type != "Series") {
		return prodyear;
	} else if (prodyear) {
		output += prodyear;
		if (status == "Continuing") {
			output += "-Present";
		} else if (enddate) {
			var year = enddate.substring(0, 4);
			var month = enddate.substring(5, 7);
			var day = enddate.substring(8, 10);
			var endyear = new Date(year, month - 1, day);
			var yyyy = endyear.getFullYear();
			if (yyyy != prodyear) {
				output += "-" + yyyy;
			}
		}
		return output;
	}
};

//Cannot parse the date from the API into a Date Object
//Substring out relevant areas
Support.AirDate = function(apiDate, type) {
	var dateString = "";
	var year = apiDate.substring(0,4);
	var month = apiDate.substring(5,7);
	var day = apiDate.substring(8,10);
	var hour = apiDate.substring(11,13);
	var min = apiDate.substring(14,16);
	var d = new Date(apiDate);
	var weekday = new Array(7);
	var shortWeekday = new Array(7);	
	weekday[0]=  "Sunday";
	weekday[1] = "Monday";
	weekday[2] = "Tuesday";
	weekday[3] = "Wednesday";
	weekday[4] = "Thursday";
	weekday[5] = "Friday";
	weekday[6] = "Saturday";
	var dayName = weekday[d.getDay()];
	shortWeekday[0]=  "Sun.";
	shortWeekday[1] = "Mon.";
	shortWeekday[2] = "Tues.";
	shortWeekday[3] = "Wed.";
	shortWeekday[4] = "Thurs.";
	shortWeekday[5] = "Fri.";
	shortWeekday[6] = "Sat.";
	if (type == "Recording"){
		dateString = day + '/' + month + '/' + year + " " + hour + ":" + min;
	} else if (type != "Episode") {
		dateString = year;
	} else {
		dateString = dayName + " " + day + '/' + month + '/' + year;
	}
	return dateString;
};


Support.FutureDate = function(apiDate, airTime) {
	var year = apiDate.substring(0, 4);
	var month = apiDate.substring(5, 7);
	var day = apiDate.substring(8, 10);
	var hour = 0;
	var min = 0;
	var twelveHr = "AM";
	if (airTime){
		if (airTime.length > 7){
			hour = airTime.substring(0, 2);
			twelveHr = airTime.substring(6, 8);
			min = airTime.substring(3, 5);
		} else {
			hour = airTime.substring(0, 1);
			twelveHr = airTime.substring(5, 7);
			min = airTime.substring(2, 4);
		}
	}
	if (twelveHr == "PM") {
		hour = parseInt(hour, 10) + 12;
	}
	var airdate = new Date(year, month - 1, day, hour, min, 0); //Month is stored in array starting at index 0!
	var now = new Date();
	var secsInFuture = (airdate.getTime() - now.getTime()) / 1000;
	
	return secsInFuture > 0;
};

//
//Replaced with AirDate Function
Support.formatDateTime = function(apiDate, formatOption) {
	//Below based on date serialisation 2006-04-07T23:00:00.0000000Z
	//formatOption 0 = Date Only (Default) 1 = Date & Time
	var year = apiDate.substring(0,4);
	var month = apiDate.substring(5,7);
	var day = apiDate.substring(8,10);
	var time = apiDate.substring(11,16);
	var dataTime = "";
	switch (formatOption) {
	case 0:
		dataTime = day + "/" + month + "/" + year;
		break;
	case 1:
		dataTime = day + "/" + month + "/" + year + " : " + time;
		break;
	}
	//Should never get here!!!!!
	return dataTime;
};


Support.setImagePlayerOverlay = function(string, format) {
	switch (format) {
	case 0:
		this.widgetPutInnerHTML("imagePlayerScreenSaverOverlay", string.substring(0, 10));
		break;
	case 1:
		this.widgetPutInnerHTML("imagePlayerScreenSaverOverlay", string);
		break;
	case 2:
		this.widgetPutInnerHTML("imagePlayerScreenSaverOverlay", "");
		break;
	}
};


Support.styleSubtitles = function (element) {
	document.getElementById(element).style.color = File.getUserProperty("SubtitleColour");
	document.getElementById(element).style.fontSize = File.getUserProperty("SubtitleSize");
	document.getElementById(element).style.textShadow = "0px 0px 10px rgba(0, 0, 0, 1)";
};


Support.getStarRatingImage = function(rating) {
	switch (Math.round(rating)) {
	case 0:
	default:
		return "<img src='images/Star_Empty.png'><img src='images/Star_Empty.png'><img src='images/Star_Empty.png'><img src='images/Star_Empty.png'><img src='images/Star_Empty.png'>";
		break;
	case 1:
		return "<img src='images/Star_Half.png'><img src='images/Star_Empty.png'><img src='images/Star_Empty.png'><img src='images/Star_Empty.png'><img src='images/Star_Empty.png'>";
		break;
	case 2:
		return "<img src='images/Star_Full.png'><img src='images/Star_Empty.png'><img src='images/Star_Empty.png'><img src='images/Star_Empty.png'><img src='images/Star_Empty.png'>";
		break;
	case 3:
		return "<img src='images/Star_Full.png'><img src='images/Star_Half.png'><img src='images/Star_Empty.png'><img src='images/Star_Empty.png'><img src='images/Star_Empty.png'>";
		break;
	case 4:
		return "<img src='images/Star_Full.png'><img src='images/Star_Full.png'><img src='images/Star_Empty.png'><img src='images/Star_Empty.png'><img src='images/Star_Empty.png'>";
		break;
	case 5:
		return "<img src='images/Star_Full.png'><img src='images/Star_Full.png'><img src='images/Star_Half.png'><img src='images/Star_Empty.png'><img src='images/Star_Empty.png'>";
		break;
	case 6:
		return "<img src='images/Star_Full.png'><img src='images/Star_Full.png'><img src='images/Star_Full.png'><img src='images/Star_Empty.png'><img src='images/Star_Empty.png'>";
		break;
	case 7:
		return "<img src='images/Star_Full.png'><img src='images/Star_Full.png'><img src='images/Star_Full.png'><img src='images/Star_Half.png'><img src='images/Star_Empty.png'>";
		break;
	case 8:
		return "<img src='images/Star_Full.png'><img src='images/Star_Full.png'><img src='images/Star_Full.png'><img src='images/Star_Full.png'><img src='images/Star_Empty.png'>";
		break;
	case 9:
		return "<img src='images/Star_Full.png'><img src='images/Star_Full.png'><img src='images/Star_Full.png'><img src='images/Star_Full.png'><img src='images/Star_Half.png'>";
		break;
	case 10:
		return "<img src='images/Star_Full.png'><img src='images/Star_Full.png'><img src='images/Star_Full.png'><img src='images/Star_Full.png'><img src='images/Star_Full.png'>";
		break;
	}
};

///Returns the number of minutes since a program started or 0 if it hasn't started yet.

Support.tvGuideProgramElapsedMins = function(program) {
	var startDate = new Date(program.StartDate);
	var now = new Date();
	var elapsed = (now.getTime() - startDate.getTime()) / 60000;
	elapsed = ~~elapsed;
	if (elapsed == 0) {
		elapsed = 1; //When one program is ending and another starting, the latter is marked as live.
	} else if (elapsed < 0) {
		elapsed = 0;
	}
	return elapsed;
};

///Returns the number of minutes of guide space the program should ocupy.

Support.tvGuideProgramDurationMins = function(program) {
	var startDate = new Date(program.StartDate);
	var endDate = new Date(program.EndDate);
	var duration = (endDate.getTime() - startDate.getTime()) / 60000;
	duration = ~~duration;
	if (duration < 0) {
		duration = 0;
	}
	return duration;
};

///Returns a date object with the minutes reset to the most recent hour or half hour.

Support.tvGuideStartTime = function(date) {
	if (date === undefined) {
		date = new Date();
	}
	var mins = 0;
	if (date.getMinutes() > 29) {
		mins = 30;
	}
	date.setMinutes(mins);
	return (date);
};

///Returns the number of minutes between the time shown at the start of the TV guide and now.

Support.tvGuideOffsetMins = function() {
	var now = new Date();
	var offset = (now.getTime() - TVGuide.guideStartTime.getTime()) / 60000;
	return(~~offset);
};


