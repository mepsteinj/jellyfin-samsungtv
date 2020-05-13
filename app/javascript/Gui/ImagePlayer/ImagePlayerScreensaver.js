var ImagePlayerScreensaver = {
	ImageViewer : null,
	newItemData : null,
	imagesToUse : "MetaData",
	Timeout : null,
	images : [],
	overlay : [],
	imageIdx : 0,       // Image index
	effectIdx : 0,      // Transition effect index
	effectNames : ['FADE1', 'FADE2', 'BLIND', 'SPIRAL','CHECKER', 'LINEAR', 'STAIRS', 'WIPE', 'RANDOM'],
};

ImagePlayerScreensaver.kill = function() {
	if (this.ImageViewer != null) {
		this.ImageViewer.destroy();
	}
};

ImagePlayerScreensaver.start = function() {
	var randomImageURL = "";
	var randomImageData = "";
	var imgsrc = "";
	this.imagesToUse = File.getUserProperty("ScreensaverImages");
	alert(this.imagesToUse);
	this.images = [];
	this.overlay = [];
	this.imageIdx = 0;
	//Update Main.js isScreensaverRunning - Sets to True
	Main.setIsScreensaverRunning();
	//Hide helper page if shown
	Helper.keyDown();
	//Hide the trailer PiP window if shown
	if (Main.getModelYear() != "D") {
		sf.service.VideoPlayer.stop();
		sf.service.VideoPlayer.hide();
	}
	Support.styleSubtitles("imagePlayerScreensaverOverlay");
	if (this.imagesToUse == "Media") {
		randomImageURL = Server.getItemTypeURL("&SortBy=Random&MediaTypes=Photo&Recursive=true&CollapseBoxSetItems=false&Limit=1000");
		randomImageData = Server.getContent(randomImageURL);
		if (randomImageData == null) { return; }

		for (var index = 0; index < randomImageData.Items.length; index++) {
			//Only add images with higher res
			if (randomImageData.Items[index].Width >= 1920 && randomImageData.Items[index].Height >= 1080){
				imgsrc = Server.getScreenSaverImageURL(randomImageData.Items[index].Id,"Primary", 1920, 1080);
				this.images.push(imgsrc);
				if (randomImageData.Items[index].PremiereDate !== undefined) {
					this.overlay.push(Support.formatDateTime(randomImageData.Items[index].PremiereDate,1));
				} else {
					this.overlay.push(""); //Need to push something to keep indexes matched up!
				}

			}
		}
	} else {
		randomImageURL = Server.getItemTypeURL("&SortBy=Random&IncludeItemTypes=Series,Movie&Recursive=true&CollapseBoxSetItems=false&Limit=1000");
		randomImageData = Server.getContent(randomImageURL);
		if (randomImageData == null) { return; }

		for (var index = 0; index < randomImageData.Items.length; index++) {
			if (randomImageData.Items[index].BackdropImageTags.length > 0) {
				imgsrc = Server.getScreenSaverImageURL(randomImageData.Items[index ].Id,"Backdrop", 1920, 1080);
				this.images.push(imgsrc);
				if (randomImageData.Items[index].Name !== undefined) {
					this.overlay.push(randomImageData.Items[index].Name);
				} else {
					this.overlay.push(""); //Need to push something to keep indexes matched up!
				}

			}
		}
	}
	//Hide Page Contents
	document.getElementById("everything").style.visibility="hidden";
	//Initialte new instance, set Frame Area & Set Notifications
	this.ImageViewer = new CImageViewer('Common ImageViewer');
	this.ImageViewer.setFrameArea(0, 0, Main.width, Main.height);
	this.ImageViewer.setOnNetworkError(function() {
		Notifications.setNotification("Network Error");
	});
	this.ImageViewer.setOnRenderError(function() {
		Notifications.setNotification("Render Error");
	});
	//Start Slide Show
	this.ImageViewer.show();
	this.setSlideshowMode();
};

// Set Slideshow mode
// You can use Transtion effect
ImagePlayerScreensaver.setSlideshowMode = function() {
	this.ImageViewer.startSlideshow();
	this.ImageViewer.setOnBufferingComplete(function(){
		ImagePlayerScreensaver.ImageViewer.showNow();
		});
	this.ImageViewer.setOnRenderingComplete(function(){
		clearTimeout(ImagePlayerScreensaver.Timeout);
		if (ImagePlayerScreensaver.imagesToUse == "Media") {
			Support.setImagePlayerOverlay(ImagePlayerScreensaver.overlay[ImagePlayerScreensaver.imageIdx], ImagePlayer.overlayFormat);
		} else {
			Support.setImagePlayerOverlay(ImagePlayerScreensaver.overlay[ImagePlayerScreensaver.imageIdx], 2);
		}

		ImagePlayerScreensaver.Timeout = setTimeout(function(){
			ImagePlayerScreensaver.imageIdx = ImagePlayerScreensaver.imageIdx+1;
			if (ImagePlayerScreensaver.imageIdx >= ImagePlayerScreensaver.images.length ) {
				ImagePlayerScreensaver.imageIdx = 0;
			}
			ImagePlayerScreensaver.ImageViewer.prepareNext(ImagePlayerScreensaver.images[ImagePlayerScreensaver.imageIdx], ImagePlayerScreensaver.ImageViewer.Effect.FADE1);
		}, File.getUserProperty("ScreensaverImageTime"));
	});

	this.ImageViewer.stop();
	this.playImage();
};

// Play image - only called once in slideshow!
//SS calls  play -> BufferComplete, then the showNow will call RendComplete which starts timer for next image
ImagePlayerScreensaver.playImage = function() {
	var url = ImagePlayerScreensaver.images[ImagePlayerScreensaver.imageIdx];
	ImagePlayerScreensaver.ImageViewer.play(url, 1920, 1080);
};

ImagePlayerScreensaver.stopScreensaver = function() {
	clearTimeout(this.Timeout);
	this.Timeout = null;
	this.images = [];
	this.ImageViewer.endSlideshow();
	this.ImageViewer.hide();
	widgetAPI.blockNavigation(event);
	ImagePlayerScreensaver.kill();
	Support.widgetPutInnerHTML("imagePlayerScreensaverOverlay", "");
	//Show Page Contents
	document.getElementById("everything").style.visibility="";
};