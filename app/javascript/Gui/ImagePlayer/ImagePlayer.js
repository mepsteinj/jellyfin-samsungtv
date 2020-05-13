var ImagePlayer = {
	ImageViewer : null,
	newItemData : null,
	Timeout : null,
	infoTimer : null,
	Paused : false,
	overlayFormat : 0, // 0 - date, 1 - date:time, 2 - off
	photos : [],
	images : [],
	overlay : [],
	imageIdx : 0,       // Image index
	effectIdx : 0,      // Transition effect index
	effectNames : ['FADE1', 'FADE2', 'BLIND', 'SPIRAL','CHECKER', 'LINEAR', 'STAIRS', 'WIPE', 'RANDOM']
};

//ImageViewer.destroy doesn't work. Set it to null instead.
ImagePlayer.kill = function() {
	if (this.ImageViewer != null) {
		this.ImageViewer = null;
	}
};

ImagePlayer.start = function(ItemData,selectedItem,isPhotoCollection) {
	alert("Page Enter : ImagePlayer");
	//Show colour buttons on screen for a few seconds when a slideshow starts.
	document.getElementById("imagePlayerScreenSaverOverlay").style.visibility="hidden";
	document.getElementById("buttonShade").style.visibility = "";
	Helper.setControlButtons(Main.messages.LabButtonFavourite, "Date/Time", Main.messages.LabButtonHelp, MusicPlayer.Status == "PLAYING" || MusicPlayer.Status == "PAUSED" ? Main.messages.LabButtonMusic : null, Main.messages.LabButtonReturn);
	this.infoTimer = setTimeout(function(){
		Helper.setControlButtons(null, null, null, null, null);
		document.getElementById("clock").style.visibility = "hidden";
		document.getElementById("buttonShade").style.visibility = "hidden";
		document.getElementById("imagePlayerScreenSaverOverlay").style.visibility="";
	}, 6000);
	//Turn off screensaver
	Support.screensaverOff();
	var url = "";
	if (isPhotoCollection) {
		url = Server.getChildItemsURL(ItemData.Items[selectedItem].Id,"&Recursive=true&SortBy=Random&SortOrder=Ascending&IncludeItemTypes=Photo&fields=SortName,Overview&Limit=2500");
	} else {
		url = Server.getChildItemsURL(ItemData.Items[selectedItem].ParentId,"&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Photo&fields=SortName,Overview&Limit=2500");
	}
	var result = Server.getContent(url);
	if (result == null) { return; }
	this.newItemData = result; //Misleading I know!
	Support.styleSubtitles("imagePlayerScreenSaverOverlay");
	//Create ARRAY of all URL's!
	//Order from starting selectedItem!
	for (var index = 0; index < result.Items.length; index++) {
		//Dont use server function here to prevent these large images caching!
		var temp = Server.getServerAddr() + "/Items/"+ this.newItemData.Items[index].Id +"/Images/Primary/0?maxwidth=1920&maxheight=1080&quality=90";
		this.images.push(temp);
		if (this.newItemData.Items[index].PremiereDate !== undefined) {
			this.overlay.push(Support.formatDateTime(this.newItemData.Items[index].PremiereDate,1));
		} else {
			this.overlay.push(""); //Need to push something to keep indexes matched up!
		}
		if (result.Items[index].Id == ItemData.Items[selectedItem].Id) {
			this.imageIdx = index;
		}
	}
	//Initialte new instance, set Frame Area & Set Notifications
	this.ImageViewer = new CImageViewer('Common ImageViewer');
	this.ImageViewer.setFrameArea(0, 0, Main.width, Main.height);
	this.ImageViewer.setOnNetworkError(function() {
		Notifications.setNotification("Network Error");
	});
	this.ImageViewer.setOnRenderError(function() {
		Notifications.setNotification("Render Error");
	});
	//Set Focus for Key Events
	document.getElementById("evnImagePlayer").focus();
	//Start Slide Show
	this.ImageViewer.show();
	this.setSlideshowMode();
};

// Set normal mode
// You can play images on the area you set.
ImagePlayer.setNormalMode = function() {

	sf.service.ImageViewer.setPosition({
		left: 0,
		top: 0,
		width: 1920,
		height: 1080,
	});

	sf.service.ImageViewer.show();

	for (var i=0; i < this.newItemData.Items.length; i++){
		//Dont use server function here to prevent these large images caching!
		var ImageUrl = Server.getServerAddr() + "/Items/"+ this.newItemData.Items[i].Id + "/Images/Primary/0?maxwidth=1920&maxheight=1080&quality=90";
		this.photos[i] = {
				url: ImageUrl,
				width: 1920,
				height: 1080,
				filename: this.newItemData.Items[i].name,
				date: '2011/06/24'
		};
	}

	// Draw the image in the specified area defined by "setPosition" function.
	sf.service.ImageViewer.draw(this.photos[0]);
};

// Set Slideshow mode
// You can use Transtion effect
ImagePlayer.setSlideshowMode = function() {
	this.ImageViewer.startSlideshow();
	this.ImageViewer.setOnBufferingComplete(function(){
		ImagePlayer.ImageViewer.showNow();
	});
	this.ImageViewer.setOnRenderingComplete(function(){
		clearTimeout(ImagePlayer.Timeout);
		Support.setImagePlayerOverlay(ImagePlayer.overlay[ImagePlayer.imageIdx], ImagePlayer.overlayFormat);
		ImagePlayer.Timeout = setTimeout(function(){
			if (ImagePlayer.Paused == false) {
				ImagePlayer.imageIdx = ImagePlayer.imageIdx+1;
				if (ImagePlayer.imageIdx >= ImagePlayer.newItemData.Items.length ) {
					ImagePlayer.imageIdx = 0;
				}
				ImagePlayer.prepImage(ImagePlayer.imageIdx);
			}
		}, File.getUserProperty("ImagePlayerImageTime"));
	});

	this.ImageViewer.stop();
	this.playImage();
};

//Prepare next image
ImagePlayer.prepImage = function(imageIdx) {
	this.ImageViewer.prepareNext(ImagePlayer.images[imageIdx], this.ImageViewer.Effect.FADE1);
};

// Play image - only called once in slideshow!
//SS calls  play -> BufferComplete, then the showNow will call RendComplete which starts timer for next image
ImagePlayer.playImage = function() {
	var url = ImagePlayer.images[ImagePlayer.imageIdx];
	ImagePlayer.ImageViewer.play(url, 1920, 1080);
};


ImagePlayer.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);
	if (document.getElementById("notifications").style.visibility == "") {
		Notifications.delNotification();
		widgetAPI.blockNavigation(event);
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	switch(keyCode){
		case tvKey.KEY_STOP:
		case tvKey.KEY_RETURN:
			alert("RETURN");
			clearTimeout(this.infoTimer);
			clearTimeout(this.Timeout);
			this.Timeout = null;
			this.images = [];
			this.overlay = [];
			Support.widgetPutInnerHTML("imagePlayerScreenSaverOverlay", "");
			document.getElementById("buttonShade").style.visibility = "hidden";
			document.getElementById("clock").style.visibility = "";
			this.ImageViewer.endSlideshow();
			this.ImageViewer.hide();
			widgetAPI.blockNavigation(event);
			ImagePlayer.kill();

			//Turn On Screensaver
			Support.screensaverOn();
			Support.screensaver();

			Support.processReturnURLHistory();
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT");
			this.imageIdx++;
			if (this.imageIdx == this.images.length) {
				this.imageIdx = 0;
			}
			ImagePlayer.prepImage(ImagePlayer.imageIdx);
			break;
		case tvKey.KEY_LEFT:
			alert("LEFT");
			this.imageIdx--;
			if (this.imageIdx < 0) {
				this.imageIdx = this.images.length - 1;
			}
			ImagePlayer.prepImage(ImagePlayer.imageIdx);
			break;
		case tvKey.KEY_PAUSE:
			alert("PAUSE");
			this.Paused = true;
			break;
		case tvKey.KEY_PLAY:
			alert("PLAY");
			this.Paused = false;
			ImagePlayer.prepImage(ImagePlayer.imageIdx);
			break;
		case tvKey.KEY_RED:
			if (this.newItemData.Items[this.imageIdx].UserData.IsFavorite == true) {
				Server.deleteFavourite(this.newItemData.Items[this.imageIdx].Id);
				this.newItemData.Items[this.imageIdx].UserData.IsFavorite = false;
				Notifications.setNotification ("Item has been removed from<br>favourites","Favourites");
			} else {
				Server.setFavourite(this.newItemData.Items[this.imageIdx].Id);
				this.newItemData.Items[this.imageIdx].UserData.IsFavorite = true;
				Notifications.setNotification ("Item has been added to<br>favourites","Favourites");
			}
			break;
		case tvKey.KEY_GREEN:
			if (this.overlayFormat == 2) {
				this.overlayFormat = 0;
			} else {
				this.overlayFormat = this.overlayFormat + 1;
			}
			Support.setImagePlayerOverlay(this.overlay[this.imageIdx], this.overlayFormat);
			break;
		case tvKey.KEY_YELLOW:
			Helper.toggleHelp("ImagePlayer");
			break;
		case tvKey.KEY_BLUE:
			MusicPlayer.showMusicPlayer("ImagePlayer");
			break;
	}
};

