var GuiImagePlayerScreensaver = {
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

GuiImagePlayerScreensaver.kill = function() {
	if (this.ImageViewer != null) {
		this.ImageViewer.destroy();
	}
};

GuiImagePlayerScreensaver.start = function() {
	this.imagesToUse = File.getUserProperty("ScreensaverImages");
	alert(this.imagesToUse);
	this.images = [];
	this.overlay = [];
	this.imageIdx = 0;
	//alert("imagestouse - " + this.imagesToUse)
	//Update Main.js isScreensaverRunning - Sets to True
	Main.setIsScreensaverRunning();
	//Hide helper page if shown
	Helper.keyDown();
	//Hide the trailer PiP window if shown
	if (Main.getModelYear() != "D") {
		sf.service.VideoPlayer.stop();
		sf.service.VideoPlayer.hide();
	}
	Support.styleSubtitles("guiImagePlayerScreenSaverOverlay");
	if (this.imagesToUse == "Media") {
		var randomImageURL = Server.getItemTypeURL("&SortBy=Random&MediaTypes=Photo&Recursive=true&CollapseBoxSetItems=false&Limit=1000");
		var randomImageData = Server.getContent(randomImageURL);
		if (randomImageData == null) { return; }

		for (var index = 0; index < randomImageData.Items.length; index++) {
			//Only add images with higher res
			if (randomImageData.Items[index].Width >= 1920 && randomImageData.Items[index].Height >= 1080){
				var imgsrc = Server.getScreenSaverImageURL(randomImageData.Items[index].Id,"Primary",1920,1080);
				this.images.push(imgsrc);
				if (randomImageData.Items[index].PremiereDate !== undefined) {
					this.overlay.push(Support.formatDateTime(randomImageData.Items[index].PremiereDate,1));
				} else {
					this.overlay.push(""); //Need to push something to keep indexes matched up!
				}

			}
		}
	} else {
		var randomImageURL = Server.getItemTypeURL("&SortBy=Random&IncludeItemTypes=Series,Movie&Recursive=true&CollapseBoxSetItems=false&Limit=1000");
		var randomImageData = Server.getContent(randomImageURL);
		if (randomImageData == null) { return; }

		for (var index = 0; index < randomImageData.Items.length; index++) {
			if (randomImageData.Items[index].BackdropImageTags.length > 0) {
				var imgsrc = Server.getScreenSaverImageURL(randomImageData.Items[index ].Id,"Backdrop",1920,1080);
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
GuiImagePlayerScreensaver.setSlideshowMode = function() {
	this.ImageViewer.startSlideshow();
	this.ImageViewer.setOnBufferingComplete(function(){
		GuiImagePlayerScreensaver.ImageViewer.showNow();
		});
	this.ImageViewer.setOnRenderingComplete(function(){
		clearTimeout(GuiImagePlayerScreensaver.Timeout);
		if (GuiImagePlayerScreensaver.imagesToUse == "Media") {
			Support.setImagePlayerOverlay(GuiImagePlayerScreensaver.overlay[GuiImagePlayerScreensaver.imageIdx], GuiImagePlayer.overlayFormat);
		} else {
			Support.setImagePlayerOverlay(GuiImagePlayerScreensaver.overlay[GuiImagePlayerScreensaver.imageIdx], 2);
		}

		GuiImagePlayerScreensaver.Timeout = setTimeout(function(){
			GuiImagePlayerScreensaver.imageIdx = GuiImagePlayerScreensaver.imageIdx+1;
			if (GuiImagePlayerScreensaver.imageIdx >= GuiImagePlayerScreensaver.images.length ) {
				GuiImagePlayerScreensaver.imageIdx = 0;
			}
			GuiImagePlayerScreensaver.ImageViewer.prepareNext(GuiImagePlayerScreensaver.images[GuiImagePlayerScreensaver.imageIdx], GuiImagePlayerScreensaver.ImageViewer.Effect.FADE1);
		}, File.getUserProperty("ScreensaverImageTime"));
	});

	this.ImageViewer.stop();
	this.playImage();
};

// Play image - only called once in slideshow!
//SS calls  play -> BufferComplete, then the showNow will call RendComplete which starts timer for next image
GuiImagePlayerScreensaver.playImage = function() {
	var url = GuiImagePlayerScreensaver.images[GuiImagePlayerScreensaver.imageIdx];
	GuiImagePlayerScreensaver.ImageViewer.play(url, 1920, 1080);
};

GuiImagePlayerScreensaver.stopScreensaver = function() {
	clearTimeout(this.Timeout);
	this.Timeout = null;
	this.images = [];
	this.ImageViewer.endSlideshow();
	this.ImageViewer.hide();
	widgetAPI.blockNavigation(event);
	GuiImagePlayerScreensaver.kill();
	document.getElementById("guiImagePlayerScreenSaverOverlay").innerHTML = "";
	//Show Page Contents
	document.getElementById("everything").style.visibility="";
};