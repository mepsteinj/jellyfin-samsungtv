var Server = {
	serverAddr : "",
	UserID : "",
	UserName : "",
	Device : "Samsung Smart TV",
	DeviceID : "00000000000000000000000000000000",
	AuthenticationToken : null,
};

//------------------------------------------------------------
//		Getter & Setter Functions
//------------------------------------------------------------

Server.getAuthToken = function() {
	return this.AuthenticationToken;
};

Server.getServerAddr = function() {
	return this.serverAddr;
};

Server.setServerAddr = function(serverAddr) {
	this.serverAddr = serverAddr;
};

Server.getUserID = function() {
	return this.UserID;
};

Server.setUserID = function(UserID) {
	this.UserID = UserID;
};

Server.getUserName = function() {
	return this.UserName;
};

Server.setUserName = function(UserName) {
	this.UserName = UserName;
};

Server.setUserFavourites = function(UserFavourites) {
	this.UserFavourites = UserFavourites;
};

Server.getUserFavourites = function(UserFavourites) {
	return this.UserFavourites;
};

Server.setDevice = function(Device) {
	this.Device = Device;
};

//Used in Settings
Server.getDevice = function() {
	return this.Device;
};

Server.setDeviceID = function(DeviceID) {
	this.DeviceID = DeviceID;
};

//Required in Transcoding functions + guiPlayer
Server.getDeviceID = function() {
	return this.DeviceID;
};

//------------------------------------------------------------
//		Generic Functions
//------------------------------------------------------------

Server.getCustomURL = function(sortParams) {
	if (sortParams != null){
		return	Server.getServerAddr() + sortParams;
	} else {
		return	Server.getServerAddr();
	}
};

Server.getItemTypeURL = function(sortParams) {
	if (sortParams != null){
		return	Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items?format=json" + sortParams;
	} else {
		return	Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items?format=json";
	}
};

Server.getThemeMedia = function(itemID) {
	return	Server.getServerAddr() + "/Items/" + itemID + "/ThemeMedia?UserId=" + Server.getUserID() + "&InheritFromParent=true&format=json";
};

Server.getChildItemsURL = function(parentID, sortParams) {
	if (sortParams != null){
		return	Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items?ParentId=" + parentID + "&format=json" + sortParams;
	} else {
		return	Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items?ParentId=" + parentID + "&format=json";
	}
};

Server.getItemInfoURL = function(parentID, sortParams) {
	if (sortParams != null){
		return	Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items/" + parentID + "?format=json" + sortParams;
	} else {
		return	Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items/" + parentID + "?format=json";
	}
};

Server.getItemIntrosUrl = function(itemId, sortParams) {
	return	Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items/" + itemId + "/Intros"; //?format=json";
};

Server.getSearchURL = function(searchTermString) {
	var parsedSearchTermString = Support.parseSearchTerm(searchTermString);
	return Server.getServerAddr() + "/Search/Hints?format=json&UserId=" + Server.getUserID() + "&SearchTerm=" + parsedSearchTermString;
};

Server.getAdditionalPartsURL = function(showID) {
	return	Server.getServerAddr() + "/Videos/" + showID + "/AdditionalParts?format=json&userId=" + Server.getUserID();
};

Server.getAdjacentEpisodesURL = function(showID, seasonID, episodeID) {
	return	Server.getServerAddr() + "/Shows/" + showID +  "/Episodes?format=json&ImageTypeLimit=1&seasonId=" + seasonID + "&userId=" + Server.getUserID() + "&AdjacentTo=" + episodeID;
};

Server.getSeasonEpisodesURL = function(showID, seasonID) {
	return	Server.getServerAddr() + "/Shows/" + showID +  "/Episodes?format=json&ImageTypeLimit=1&seasonId=" + seasonID + "&userId=" + Server.getUserID();
};

Server.getImageURL = function(itemId, imageType, maxWidth, maxHeight, unplayedCount, played, playedPercentage, chapter) {
	var query = "";
	switch (imageType) {
	case "Primary":
		query = "/Items/"+ itemId +"/Images/Primary/0?maxwidth=" + maxWidth + "&maxheight=" + maxHeight + "&quality=90";
		break;
	case "Banner":
		query = "/Items/"+ itemId +"/Images/Banner/0?maxwidth=" + maxWidth + "&maxheight=" + maxHeight + "&quality=90";
		break;
	case "Backdrop":
		query = "/Items/"+ itemId +"/Images/Backdrop/0?maxwidth=" + maxWidth + "&maxheight=" + maxHeight + "&quality=90";
		break;
	case "Thumb":
		query = "/Items/"+ itemId +"/Images/Thumb/0?maxwidth=" + maxWidth + "&maxheight=" + maxHeight + "&quality=90";
		break;
	case "Logo":
		query = "/Items/"+ itemId +"/Images/Logo/0?maxwidth=" + maxWidth + "&maxheight=" + maxHeight + "&quality=90";
		break;
	case "Disc":
		query = "/Items/"+ itemId +"/Images/Disc/0?maxwidth=" + maxWidth + "&maxheight=" + maxHeight + "&quality=90";
		break;
	case "UsersPrimary":
		query = "/Users/" + itemId + "/Images/Primary?maxwidth=" + maxWidth + "&maxheight=" + maxHeight + "&quality=90";
		break;
	case "Chapter":
		query = "/Items/" + itemId + "/Images/Chapter/" + chapter + "?maxwidth=" + maxWidth + "&maxheight=" + maxHeight + "&quality=90";
		break;
	}
	if (Main.isImageCaching()) {
		var found = false;
		for (var i = 0; i <Support.imageCachejson.Images.length; i++) {
			//Is image in cache - If so use it
			if (Support.imageCachejson.Images[i].URL == query) {
				found = true;
				break;
			}
		}
		if (found == true) {
			//Use data URI from file
			return Support.imageCachejson.Images[i].DataURI;
		} else {
			//Use URL & Add to Cache
			var full = Server.getServerAddr() +	 query;
			var xhr = new XMLHttpRequest();
			xhr.open('GET', full, true);
			xhr.responseType = 'blob';
			xhr.onload = function(e) {
				if (this.status == 200) {
					var blob = this.response;
					Support.imageCachejson.Images[Support.imageCachejson.Images.length] = {"URL":query, "DataURI":window.URL.createObjectURL(blob)};
				}
			};
			xhr.send();
			return full;
		}
	} else {
		return Server.getServerAddr() +	 query;
	}
};

Server.getScreenSaverImageURL = function(itemId, imageType, maxWidth, maxHeight) {
	var query = "";
	switch (imageType) {
		case "Backdrop":
			query =	  Server.getServerAddr() + "/Items/"+ itemId +"/Images/Backdrop/0?quality=90&maxwidth=" + maxWidth + "&maxheight=" + maxHeight;
			break;
		case "Primary":
			query =	  Server.getServerAddr() + "/Items/"+ itemId +"/Images/Primary/0?quality=90&maxwidth=" + maxWidth + "&maxheight=" + maxHeight;
			break;
	}
	return query;
};

Server.getBackgroundImageURL = function(itemId, imagetype, maxWidth, maxHeight, unplayedcount, played, playedpercentage, totalbackdrops) {
	var query = "";
	var index =	 Math.floor((Math.random()*totalbackdrops)+0);
	switch (imagetype) {
		case "Backdrop":
			query =	  Server.getServerAddr() + "/Items/"+ itemId +"/Images/Backdrop/" + index + "?maxwidth=" + maxWidth + "&maxheight=" + maxHeight;
			break;
	}
	query = query + "&Quality=90";
	return query;
};

Server.getStreamUrl = function(itemId, mediaSourceId){
	var streamParams = '/Stream.ts?VideoCodec=h264&Profile=high&Level=41&MaxVideoBitDepth=8&MaxWidth=1920&VideoBitrate=10000000&AudioCodec=aac&audioBitrate=360000&MaxAudioChannels=6&MediaSourceId='+mediaSourceId + '&api_key=' + Server.getAuthToken();
	var streamUrl = Server.getServerAddr() + '/Videos/' + itemId + streamParams + '&DeviceId=' + Server.getDeviceID();
	return streamUrl;
};

Server.setRequestHeaders = function (xmlHttp, UserId) {
	if (this.UserID == null) {
		xmlHttp.setRequestHeader("Authorization", "MediaBrowser Client=\"Samsung TV\", Device=\"" + this.Device + "\", DeviceId=\"" + this.DeviceID + "\", Version=\"" + Main.getVersion() + "\", UserId=\"" + UserId+"\"");
	} else {
		xmlHttp.setRequestHeader("Authorization", "MediaBrowser Client=\"Samsung TV\", Device=\"" + this.Device + "\", DeviceId=\"" + this.DeviceID + "\", Version=\"" + Main.getVersion() + "\", UserId=\"" + this.UserID+"\"");
		if (this.AuthenticationToken != null) {
			xmlHttp.setRequestHeader("X-MediaBrowser-Token", this.AuthenticationToken);
		}
	}
	xmlHttp.setRequestHeader("Content-Type", 'application/json; charset=UTF-8');
	return xmlHttp;
};

Server.getMoviesViewQueryPart = function() {
	var parentId = Server.getUserViewId("movies", "UserView");
	if (parentId == null) {
		return "";
	} else {
		return "&ParentId=" + parentId;
	}
};

Server.getTvViewQueryPart = function() {
	var parentId = Server.getUserViewId("tvshows", "UserView");
	if (parentId == null) {
		return "";
	} else {
		return "&ParentId=" + parentId;
	}
};

Server.getUserViewId = function (collectionType, type) {
	var folderId = null;
	var userViews = Server.getUserViews();
	for (var i = 0; i < userViews.Items.length; i++){
		if ((type === undefined || userViews.Items[i].Type == type) && userViews.Items[i].CollectionType == collectionType){
			folderId = userViews.Items[i].Id;
		}
	}
	return folderId;
};

Server.getUserViews = function () {
	var url = this.serverAddr + "/Users/" + Server.getUserID() + "/Views?format=json&SortBy=SortName&SortOrder=Ascending";
	var userViews = Server.getContent(url);
	return userViews;
};

//------------------------------------------------------------
//		Settings Functions
//------------------------------------------------------------

Server.updateUserConfiguration = function(contentToPost) {
	var url = this.serverAddr + "/Users/" + Server.getUserID() + "/Configuration";
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(contentToPost);
	}
};

//------------------------------------------------------------
//		Player Functions
//------------------------------------------------------------

Server.getSubtitles = function(url) {
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("GET", url , false); //must be false
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);

		if (xmlHttp.status != 200) {
			alert (xmlHttp.status);
			return null;
		} else {
			return xmlHttp.responseText;
		}
	} else {
		alert ("Bad xmlHTTP Request");
		Server.Logout();
		GuiNotifications.setNotification("Bad xmlHTTP Request<br>Token: " + Server.getAuthToken(),"Server Error",false);
		GuiUsers.start(true);
		return null;
	}
};

Server.videoStarted = function(showId, mediaSourceID, playMethod) {
	var url = this.serverAddr + "/Sessions/Playing";
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		var contentToPost = '{"QueueableMediaTypes":["Video"],"CanSeek":false,"ItemId":' + showId + ',"MediaSourceId":' + mediaSourceID + ',"IsPaused":false,"IsMuted":false,"PositionTicks":0,"PlayMethod":' + playMethod + '}';
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(contentToPost);
	}
};

Server.videoStopped = function(showId, mediaSourceID, ticks, playMethod) {
	var url = this.serverAddr + "/Sessions/Playing/Stopped";
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		var contentToPost = '{"QueueableMediaTypes":["Video"],"CanSeek":false,"ItemId":' + showId + ',"MediaSourceId":' + mediaSourceID + ',"IsPaused":false,"IsMuted":false,"PositionTicks":' + (ticks*10000) + ',"PlayMethod":' + playMethod + '}';
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(contentToPost);
	}
};

Server.videoPaused = function(showId, mediaSourceID, ticks, playMethod) {
	var url = this.serverAddr + "/Sessions/Playing/Progress";
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		var contentToPost = '{"QueueableMediaTypes":["Video"],"CanSeek":false,"ItemId":' + showId + ',"MediaSourceId":' + mediaSourceID + ',"IsPaused":true,"IsMuted":false,"PositionTicks":'+(ticks*10000)+',"PlayMethod":' + PlayMethod + '}';
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(contentToPost);
	}
};

Server.videoTime = function(showId, mediaSourceID, ticks, playMethod) {
	var url = this.serverAddr + "/Sessions/Playing/Progress";
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		var contentToPost = '{"QueueableMediaTypes":["Video"],"CanSeek":false,"ItemId":' + showId + ',"MediaSourceId":' + mediaSourceID + ',"IsPaused":false,"IsMuted":false,"PositionTicks":' + (ticks*10000) + ',"PlayMethod":' + playMethod + '}';
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(contentToPost);
	}
};

Server.stopHLSTranscode = function() {
	var url = this.serverAddr + "/Videos/ActiveEncodings?DeviceId=" + this.DeviceID;
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
	}
};

//------------------------------------------------------------
//		Item Watched Status Functions
//------------------------------------------------------------

Server.setWatchedStatus = function(id) {
	var url = this.serverAddr + "/Users/" + this.UserID + "/PlayedItems/" + id;
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
	}
};

Server.deleteWatchedStatus = function(id) {
	var url = this.serverAddr + "/Users/" + this.UserID + "/PlayedItems/" + id;
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("DELETE", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
	}
};

//------------------------------------------------------------
//		 Item Favourite Status Functions
//------------------------------------------------------------

Server.setFavourite = function(id) {
	var url = this.serverAddr + "/Users/" + this.UserID + "/FavoriteItems/" + id;
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
	}
};

Server.deleteFavourite = function(id) {
	var url = this.serverAddr + "/Users/" + this.UserID + "/FavoriteItems/" + id;
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("DELETE", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
	}
};

//------------------------------------------------------------
//		 GuiIP Functions
//------------------------------------------------------------

Server.createPlaylist = function(name, ids, mediaType) {
	var url = this.serverAddr + "/Playlists?Name=" + name + "&Ids=" + ids + "&userId="+Server.getUserID() + "&MediaType=" + mediaType;
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
	}
};

Server.deletePlaylist = function(playlistId) {
	var url = this.serverAddr + "/Items/" + playlistId;
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("DELETE", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
	}
};

Server.addToPlaylist = function(playlistId, ids) {
	var url = this.serverAddr + "/Playlists/"+ playlistId + "/Items?Ids=" + ids + "&userId=" + Server.getUserID();
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
	}
};

Server.removeFromPlaylist = function(playlistId, ids) {
	var url = this.serverAddr + "/Playlists/"+ playlistId + "/Items?EntryIds=" + ids + "&userId=" + Server.getUserID();
	alert(url);
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("DELETE", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
	}
};

Server.POST = function(url, item) {
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		if (item){
			xmlHttp.send(JSON.stringify(item));
		} else {
			xmlHttp.send(null);
		}
	}
};

Server.DELETE = function(url, item) {
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("DELETE", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		if (item){
			xmlHttp.send(JSON.stringify(item));
		} else {
			xmlHttp.send(null);
		}
	}
};

//------------------------------------------------------------
//		GuiIP Functions
//------------------------------------------------------------

Server.testConnectionSettings = function (server, fromFile) {
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("GET", "http://" + server + "/jellyfin/System/Info/Public?format=json",false);
		xmlHttp.setRequestHeader("Content-Type", 'application/json');
		xmlHttp.onreadystatechange = function () {
			GuiNotifications.setNotification("hello","Network Status",true);
			if (xmlHttp.readyState == 4) {
				if(xmlHttp.status === 200) {
					if (fromFile == false) {
						var json = JSON.parse(xmlHttp.responseText);
						File.saveServerToFile(json.Id,json.ServerName,server);
					}
					//Set Server.serverAddr!
					Server.setServerAddr("http://" + server + "/jellyfin");
					//Check Server Version
					if (ServerVersion.checkServerVersion()) {
						GuiUsers.start(true);
					} else {
						ServerVersion.start();
					}
				} else if (xmlHttp.status === 0) {
					GuiNotifications.setNotification("Your Jellyfin server is not responding.","Network Error "+xmlHttp.status,true);
					Support.removeSplashScreen();
					if (fromFile == true) {
						setTimeout(function(){
							GuiPage_Servers.start();
						}, 3000);

					} else {
						setTimeout(function(){
							GuiNewServer.start();
						}, 3000);
					}
				} else {
					GuiNotifications.setNotification("Jellyfin server connection error.","Network Error "+xmlHttp.status,true);
					Support.removeSplashScreen();
					if (fromFile == true) {
						setTimeout(function(){
							GuiPage_Servers.start();
						}, 3000);

					} else {
						setTimeout(function(){
							GuiNewServer.start();
						}, 3000);
					}
				}
			}
		};
		xmlHttp.send(null);
	} else {
		alert("Failed to create XHR");
	}
};

//------------------------------------------------------------
//		GuiUsers Functions
//------------------------------------------------------------

Server.Authenticate = function(userId, userName, password) {
	var url = Server.getServerAddr() + "/Users/AuthenticateByName?format=json";
	var params =  JSON.stringify({"Username":userName,"Pw":password});
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "POST", url , false ); //Authenticate must be false - need response before continuing!
	xmlHttp = this.setRequestHeaders(xmlHttp);
	xmlHttp.send(params);
	if (xmlHttp.status != 200) {
		return false;
	} else {
		var session = JSON.parse(xmlHttp.responseText);
		this.AuthenticationToken = session.AccessToken;
		this.setUserID(session.User.Id);
		this.setUserName(userName);
		FileLog.write("User " + userName + " authenticated. ");
		return true;
	}
};

Server.Logout = function() {
	var url = this.serverAddr + "/Sessions/Logout";
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
	}
	//Close down any running items
	GuiImagePlayerScreensaver.kill();
	GuiImagePlayer.kill();
	GuiMusicPlayer.stopOnAppExit();
	GuiPlayer.stopOnAppExit();
	FileLog.write("---------------------------------------------------------------------");
};

//------------------------------------------------------------
//		Get Content - JSON REQUESTS
//------------------------------------------------------------

Server.getContent = function(url) {
	var xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("GET", url , false); //must be false
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
		if (xmlHttp.status != 200) {
			FileLog.write("Server Error: The HTTP status returned by the server was " + xmlHttp.status);
			FileLog.write(url);
			GuiNotifications.setNotification("The HTTP status code returned by the server was " + xmlHttp.status + ".", "Server Error:");
			return null;
		} else {
			//alert(xmlHttp.responseText);
			return JSON.parse(xmlHttp.responseText);
		}
	} else {
		alert ("Bad xmlHTTP Request");
		Server.Logout();
		GuiNotifications.setNotification("Bad xmlHTTP Request<br>Token: " + Server.getAuthToken(),"Server Error",false);
		GuiUsers.start(true);
		return null;
	}
};