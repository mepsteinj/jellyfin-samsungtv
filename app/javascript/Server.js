var Server = {
	serverAddr : "",
	userID : "",
	userName : "",
	device : "Samsung Smart TV",
	deviceID : "00000000000000000000000000000000",
	authenticationToken : null,
	xmlHttp : null,
};

//------------------------------------------------------------
//		Getter & Setter Functions
//------------------------------------------------------------

Server.getAuthToken = function() {
	return this.authenticationToken;
};

Server.setAuthToken = function(authToken) {
	this.authenticationToken = authToken;
};

Server.getServerAddr = function() {
	return this.serverAddr;
};

Server.setServerAddr = function(serverAddr) {
	this.serverAddr = serverAddr;
};

Server.getUserID = function() {
	return this.userID;
};

Server.setUserID = function(userID) {
	this.userID = userID;
};

Server.getUserName = function() {
	return this.userName;
};

Server.setUserName = function(userName) {
	this.userName = userName;
};

Server.setDevice = function(device) {
	this.device = device;
};

//Used in Settings
Server.getDevice = function() {
	return this.device;
};

Server.setDeviceID = function(deviceID) {
	this.deviceID = deviceID;
};

//Required in Transcoding functions + guiPlayer
Server.getDeviceID = function() {
	return this.deviceID;
};

Server.initHttpRequest = function() {
	if (this.xmlHttp != null) {
		this.xmlHttp.destroy();
	}
	this.xmlHttp = new XMLHttpRequest();
};

Server.getHttpData = function(method, url, async, params) {
	this.initHttpRequest();
	if (this.xmlHttp) {
		alert(url);
		this.xmlHttp.open(method, url, async); //must be true!
		this.setRequestHeaders();
		if (params != null) {
			this.xmlHttp.send(params);
		} else {
			this.xmlHttp.send(null);
		}
	}
};

//------------------------------------------------------------
//		Generic Functions
//------------------------------------------------------------

Server.getCustomURL = function(sortParams) {
	if (sortParams != null) {
		return	Server.getServerAddr() + sortParams;
	} else {
		return	Server.getServerAddr();
	}
};

Server.getItemTypeURL = function(sortParams) {
	if (sortParams != null) {
		return	Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items?format=json" + sortParams;
	} else {
		return	Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items?format=json";
	}
};

Server.getThemeMedia = function(itemID) {
	return	Server.getServerAddr() + "/Items/" + itemID + "/ThemeMedia?UserId=" + Server.getUserID() + "&InheritFromParent=true&format=json";
};

Server.getChildItemsURL = function(parentID, sortParams) {
	if (sortParams != null) {
		return	Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items?ParentId=" + parentID + "&format=json" + sortParams;
	} else {
		return	Server.getServerAddr() + "/Users/" + Server.getUserID() + "/Items?ParentId=" + parentID + "&format=json";
	}
};

Server.getItemInfoURL = function(parentID, sortParams) {
	if (sortParams != null) {
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
		for (var i = 0; i <Support.imageCacheJson.Images.length; i++) {
			//Is image in cache - If so use it
			if (Support.imageCacheJson.Images[i].URL == query) {
				found = true;
				break;
			}
		}
		if (found == true) {
			//Use data URI from file
			return Support.imageCacheJson.Images[i].DataURI;
		} else {
			//Use URL & Add to Cache
			var full = Server.getServerAddr() +	 query;
			this.initHttpRequest();
			this.xmlHttp.open('GET', full, true);
			this.xmlHttp.responseType = 'blob';
			this.xmlHttp.onload = function(e) {
				if (this.status == 200) {
					var blob = this.response;
					Support.imageCacheJson.Images[Support.imageCacheJson.Images.length] = {"URL":query, "DataURI":window.URL.createObjectURL(blob)};
				}
			};
			this.xmlHttp.send();
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
	var streamParams = '/Stream.ts?VideoCodec=h264&Profile=high&Level=41&MaxVideoBitDepth=8&MaxWidth=1920&VideoBitrate=10000000&AudioCodec=aac&audioBitrate=360000&MaxAudioChannels=6&MediaSourceId=' + mediaSourceId + '&api_key=' + this.getAuthToken();
	var streamUrl = this.getServerAddr() + '/Videos/' + itemId + streamParams + '&DeviceId=' + this.getDeviceID();
	return streamUrl;
};

Server.setRequestHeaders = function (userId) {
	if (this.getUserID() == null) {
		this.xmlHttp.setRequestHeader("Authorization", "MediaBrowser Client=\"Samsung TV\", Device=\"" + this.getDevice() + "\", DeviceId=\"" + this.getDeviceID() + "\", Version=\"" + Main.getVersion() + "\", UserId=\"" + userId + "\"");
	} else {
		this.xmlHttp.setRequestHeader("Authorization", "MediaBrowser Client=\"Samsung TV\", Device=\"" + this.getDevice() + "\", DeviceId=\"" + this.getDeviceID() + "\", Version=\"" + Main.getVersion() + "\", UserId=\"" + this.getUserID() +"\"");
		if (this.getAuthToken() != null) {
			this.xmlHttp.setRequestHeader("X-MediaBrowser-Token", this.getAuthToken());
		}
	}
	this.xmlHttp.setRequestHeader("Content-Type", 'application/json; charset=UTF-8');
};

Server.getMoviesViewQueryPart = function() {
	var parentId = Server.getUserViewId("movies", "UserView");
	if (parentId == null) {
		return "";
	} else {
		return "&ParentId=" + parentId;
	}
};

Server.getTVViewQueryPart = function() {
	var parentId = this.getUserViewId("tvshows", "UserView");
	if (parentId == null) {
		return "";
	} else {
		return "&ParentId=" + parentId;
	}
};

Server.getUserViewId = function (collectionType, type) {
	var folderId = null;
	var userViews = this.getUserViews();
	for (var i = 0; i < userViews.Items.length; i++){
		if ((type === undefined || userViews.Items[i].Type == type) && userViews.Items[i].CollectionType == collectionType){
			folderId = userViews.Items[i].Id;
		}
	}
	return folderId;
};

Server.getUserViews = function () {
	var url = this.getServerAddr() + "/Users/" + this.getUserID() + "/Views?format=json&SortBy=SortName&SortOrder=Ascending";
	var userViews = this.getContent(url);
	return userViews;
};

//------------------------------------------------------------
//		Settings Functions
//------------------------------------------------------------

Server.updateUserConfiguration = function(contentToPost) {
	var url = this.getServerAddr() + "/Users/" + this.getUserID() + "/Configuration";
	this.getHttpData("POST", url, true, contentToPost);
};

//------------------------------------------------------------
//		Player Functions
//------------------------------------------------------------

Server.getSubtitles = function(url) {
	this.initHttpRequest();
	if (this.xmlHttp) {
		this.xmlHttp.open("GET", url , false); //must be false
		this.setRequestHeaders();
		this.xmlHttp.send(null);

		if (this.xmlHttp.status != 200) {
			alert (this.xmlHttp.status);
			return null;
		} else {
			return this.xmlHttp.responseText;
		}
	} else {
		alert ("Bad xmlHTTP Request");
		this.Logout();
		Notifications.setNotification(Main.messages.LabBadRequest + this.getAuthToken(), Main.messages.LabServerError, false);
		Users.start(true);
		return null;
	}
};

Server.videoStarted = function(showId, mediaSourceID, playMethod) {
	var url = this.getServerAddr() + "/Sessions/Playing";
	var contentToPost = '{"QueueableMediaTypes":["Video"],"CanSeek":false,"ItemId":' + showId + ',"MediaSourceId":' + mediaSourceID + ',"IsPaused":false,"IsMuted":false,"PositionTicks":0,"PlayMethod":' + playMethod + '}';
	this.getHttpData("POST", url, true, contentToPost);
};

Server.videoStopped = function(showId, mediaSourceID, ticks, playMethod) {
	var url = this.getServerAddr() + "/Sessions/Playing/Stopped";
	var contentToPost = '{"QueueableMediaTypes":["Video"],"CanSeek":false,"ItemId":' + showId + ',"MediaSourceId":' + mediaSourceID + ',"IsPaused":false,"IsMuted":false,"PositionTicks":' + (ticks * 10000) + ',"PlayMethod":' + playMethod + '}';
	this.getHttpData("POST", url, true, contentToPost);
};

Server.videoPaused = function(showId, mediaSourceID, ticks, playMethod) {
	var url = this.getServerAddr() + "/Sessions/Playing/Progress";
	var contentToPost = '{"QueueableMediaTypes":["Video"],"CanSeek":false,"ItemId":' + showId + ',"MediaSourceId":' + mediaSourceID + ',"IsPaused":true,"IsMuted":false,"PositionTicks":'+(ticks * 10000)+',"PlayMethod":' + PlayMethod + '}';
	this.getHttpData("POST", url, true, contentToPost);
};

Server.videoTime = function(showId, mediaSourceID, ticks, playMethod) {
	var url = this.getServerAddr() + "/Sessions/Playing/Progress";
	var contentToPost = '{"QueueableMediaTypes":["Video"],"CanSeek":false,"ItemId":' + showId + ',"MediaSourceId":' + mediaSourceID + ',"IsPaused":false,"IsMuted":false,"PositionTicks":' + (ticks * 10000) + ',"PlayMethod":' + playMethod + '}';
	this.getHttpData("POST", url, true, contentToPost);
};

Server.stopHLSTranscode = function() {
	var url = this.getServerAddr() + "/Videos/ActiveEncodings?DeviceId=" + this.getDeviceID();
	this.getHttpData("POST", url, true, null);
};

//------------------------------------------------------------
//		Item Watched Status Functions
//------------------------------------------------------------

Server.setWatchedStatus = function(id) {
	var url = this.getServerAddr() + "/Users/" + this.getUserID() + "/PlayedItems/" + id;
	this.getHttpData("POST", url, true, null);
};

Server.deleteWatchedStatus = function(id) {
	var url = this.getServerAddr() + "/Users/" + this.getUserID() + "/PlayedItems/" + id;
	this.getHttpData("DELETE", url, true, null);
};

//------------------------------------------------------------
//		 Item Favourite Status Functions
//------------------------------------------------------------

Server.setFavourite = function(id) {
	var url = this.getServerAddr() + "/Users/" + this.getUserID() + "/FavoriteItems/" + id;
	this.getHttpData("POST", url, true, null);
};

Server.deleteFavourite = function(id) {
	var url = this.getServerAddr() + "/Users/" + this.getUserID() + "/FavoriteItems/" + id;
	this.getHttpData("DELETE", url, true, null);
};

//------------------------------------------------------------
//		 GuiIP Functions
//------------------------------------------------------------

Server.createPlaylist = function(name, ids, mediaType) {
	var url = this.getServerAddr() + "/Playlists?Name=" + name + "&Ids=" + ids + "&userId=" + this.getUserID() + "&MediaType=" + mediaType;
	this.getHttpData("POST", url, true, null);
};

Server.deletePlaylist = function(playlistId) {
	var url = this.getServerAddr() + "/Items/" + playlistId;
	this.getHttpData("DELETE", url, true, null);
};

Server.addToPlaylist = function(playlistId, ids) {
	var url = this.getServerAddr() + "/Playlists/"+ playlistId + "/Items?Ids=" + ids + "&userId=" + this.getUserID();
	this.getHttpData("POST", url, true, null);
};

Server.removeFromPlaylist = function(playlistId, ids) {
	var url = this.getServerAddr() + "/Playlists/"+ playlistId + "/Items?EntryIds=" + ids + "&userId=" + this.getUserID();
	this.getHttpData("DELETE", url, true, null);
};

Server.POST = function(url, item) {
	if (item){
		this.getHttpData("POST", url, true, JSON.stringify(item));
	} else {
		this.getHttpData("POST", url, true, null);
	}
};

Server.DELETE = function(url, item) {
	if (item){
		this.getHttpData("DELETE", url, true, JSON.stringify(item));
	} else {
		this.getHttpData("DELETE", url, true, null);
	}
};

//------------------------------------------------------------
//		GuiIP Functions
//------------------------------------------------------------

Server.testConnectionSettings = function (server, fromFile) {
	this.initHttpRequest();
	if (this.xmlHttp) {
		this.xmlHttp.open("GET", "http://" + server + "/jellyfin/System/Info/Public?format=json",false);
		this.xmlHttp.setRequestHeader("Content-Type", 'application/json');
		this.xmlHttp.onreadystatechange = function() {
			Notifications.setNotification("Hello", Main.messages.LabNetworkStatus, true);
			if (Server.xmlHttp.readyState == 4) {
				if(Server.xmlHttp.status === 200) {
					if (fromFile == false) {
						var json = JSON.parse(Server.xmlHttp.responseText);
						File.saveServerToFile(json.Id, json.ServerName, server);
					}
					//Set Server.serverAddr!
					Server.setServerAddr("http://" + server + "/jellyfin");
					//Check Server Version
					if (ServerVersion.checkServerVersion()) {
						Users.start(true);
					} else {
						ServerVersion.start();
					}
				} else if (Server.xmlHttp.status === 0) {
					Notifications.setNotification(Main.messages.LabJellefinRes + Server.xmlHttp.status + ".", Main.messages.LabNetworkError, true);
					Support.removeSplashScreen();
					if (fromFile == true) {
						setTimeout(function(){
							GuiServers.start();
						}, 3000);

					} else {
						setTimeout(function(){
							NewServer.start();
						}, 3000);
					}
				} else {
					Notifications.setNotification(Main.messages.LabJellefinCon + Server.xmlHttp.status + ".", Main.messages.LabNetworkError, true);
					Support.removeSplashScreen();
					if (fromFile == true) {
						setTimeout(function(){
							GuiServers.start();
						}, 3000);

					} else {
						setTimeout(function(){
							NewServer.start();
						}, 3000);
					}
				}
			}
		};
		this.xmlHttp.send(null);
	} else {
		alert("Failed to create XHR");
	}
};

//------------------------------------------------------------
//	Users Functions
//------------------------------------------------------------

Server.Authenticate = function(userId, userName, password) {
	var url = Server.getServerAddr() + "/Users/AuthenticateByName?format=json";
	var params =  JSON.stringify({"Username":userName,"Pw":password});
	this.getHttpData("POST", url, false, params);
	if (this.xmlHttp.status != 200) {
		return false;
	} else {
		var session = JSON.parse(this.xmlHttp.responseText);
		this.setAuthToken(session.AccessToken);
		this.setUserID(session.User.Id);
		this.setUserName(userName);
		FileLog.write("User " + userName + " authenticated. ");
		return true;
	}
};

Server.Logout = function() {
	var url = this.getServerAddr() + "/Sessions/Logout";
	this.getHttpData("POST", url, true, null);
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
	this.initHttpRequest();
	if (this.xmlHttp) {
		this.xmlHttp.open("GET", url, false); //must be false
		this.setRequestHeaders();
		this.xmlHttp.send(null);
		if (this.xmlHttp.status != 200) {
			FileLog.write("Server Error: The HTTP status returned by the server was " + this.xmlHttp.status);
			FileLog.write(url);
			Notifications.setNotification(Main.messages.LabHTTPStatus + this.xmlHttp.status + ".", Main.messages.LabServerError);
			return null;
		} else {
			//alert(xmlHttp.responseText);
			return JSON.parse(this.xmlHttp.responseText);
		}
	} else {
		alert ("Bad xmlHTTP Request");
		this.Logout();
		Notifications.setNotification(Main.messages.LabBadRequest + this.getAuthToken(), Main.messages.LabServerError, false);
		Users.start(true);
		return null;
	}
};
