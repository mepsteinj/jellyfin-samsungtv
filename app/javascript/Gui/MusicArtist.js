var MusicArtist = {
	ItemData : null,
	selectedItem : 0,
	topLeftItem : 0,
	totalRecordCount : null,
	ItemData2 : null,
	selectedItem2 : -1,
	topLeftItem2 : 0,
	ItemIndexData : null,
	indexSeekPos : -1,
	timeout : null,
	bannerItems : ["Recent","Frequent","Album","Album Artist","Artist"],
	selectedBannerItem : 0,
	MAXCOLUMNCOUNT : 7,
	MAXROWCOUNT : 2,
	MAXROW2COUNT : 1,
	title1 : "",
	startParams : []
};

MusicArtist.onFocus = function() {
	Helper.setControlButtons(null, null, null, MusicPlayer.Status == "PLAYING" || MusicPlayer.Status == "PAUSED" ? "Music" : null, "Return");
};

MusicArtist.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
};

MusicArtist.getMaxDisplay2 = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROW2COUNT;
};

MusicArtist.start = function(title1, url1, selectedItem, topLeftItem) {
	alert("Page Enter : MusicArtist");

	//Save Start Vars
	Support.pageLoadTimes("MusicArtist","Start",true);
	this.startParams = [title1,url1];

	//Reset Vars
	this.selectedItem = selectedItem;
	this.selectedItem2 = -1; //Prevents any item being shown as selected!
	this.topLeftItem = topLeftItem;
	this.topLeftItem2 = 0;
	this.indexSeekPos = -1,

	//Load Data
	this.title1 = title1;

	this.ItemData = Server.getContent(url1 + "&Limit="+File.getTVProperty("ItemPaging"));
	if (this.ItemData == null) { Support.processReturnURLHistory(); }
	this.totalRecordCount = this.ItemData.TotalRecordCount;
	Support.pageLoadTimes("MusicArtist","RetrievedServerData",false);

	//Create pageContent
	var htmlToAdd = "<div id=bannerSelection class='bannerMenu'></div>";
	htmlToAdd += "<div id=Center class='SeriesCenter'>";
	htmlToAdd +=    "<div id=Content></div>";
	htmlToAdd += "</div>";
	htmlToAdd += "<div id=lowerTitle class='albumArtistLowerTitle offWhite'></div>";
	htmlToAdd += "<div id=lowerContent class='albumArtistLowerContent'></div>";
	Support.widgetPutInnerHTML("pageContent", htmlToAdd);

	//Set banner Styling
	document.getElementById("bannerSelection").style.paddingTop="25px";
	document.getElementById("bannerSelection").style.paddingBottom="5px";


	if (this.ItemData.Items.length > 0) {
		//Index Data - Disabled v0.570d
		//this.ItemIndexData = Support.processIndexing(this.ItemData.Items);

		//Display first XX series
		this.updateDisplayedItems();

		//Update Selected Collection CSS
		this.updateSelectedItems(false);

		//Add Padding
		if (this.ItemData.Items.length <= this.MAXCOLUMNCOUNT) {
			document.getElementById("Center").style.top = "150px";
		}

		//Set Banner Items
		var bannerSelection = "";
		for (var index = 0; index < this.bannerItems.length; index++) {
			if (index != this.bannerItems.length-1) {
				bannerSelection += "<div id='bannerItem" + index + "' class='bannerItem bannerItemPadding'>"+this.bannerItems[index].replace(/_/g, ' ')+"</div>";
			} else {
				bannerSelection += "<div id='bannerItem" + index + "' class='bannerItem'>"+this.bannerItems[index].replace(/_/g, ' ')+"</div>";
			}
		}
		Support.widgetPutInnerHTML("bannerSelection", bannerSelection);

		this.selectedBannerItem = -1;
		this.updateSelectedBannerItems();
		this.selectedBannerItem = 0;

		//Set Focus for Key Events
		document.getElementById("evnMusicArtist").focus();
		Support.pageLoadTimes("MusicArtist", "UserControl",false);
	} else {
		//Set message to user
		Support.widgetPutInnerHTML("counter", "");
		document.getElementById("content").style.fontSize="40px";
		
		Support.widgetPutInnerHTML("content", "Huh.. Looks like I have no content to show you in this view I'm afraid<br>Press return to get back to the previous screen");

		document.getElementById("NoItems").focus();
	}
};

//---------------------------------------------------------------------------------------------------
//      TOP ITEMS HANDLERS
//---------------------------------------------------------------------------------------------------

MusicArtist.updateDisplayedItems = function() {

	if (this.topLeftItem + this.getMaxDisplay() > this.ItemData.Items.length) {
		if (this.totalRecordCount > this.ItemData.Items.length) {
			this.loadMoreItems();
		}
	}

	Support.updateDisplayedItems(this.ItemData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Content",this.divprepend1,this.isResume);
};

//Function sets CSS Properties so show which user is selected
MusicArtist.updateSelectedItems = function (bypassCounter) {
	Support.updateSelectedNEW(this.ItemData.Items, this.selectedItem, this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(), this.ItemData.Items.length), "music selected", "music", this.divprepend1, bypassCounter, this.totalRecordCount);
    var url2 = ""; //WARN IGNORY
	//Prevent execution when selectedItem is set to -1 to hide selected item
	if (this.selectedItem != -1) {

		//Set Title2
		Support.widgetPutInnerHTML("lowerTitle", "Albums by " + this.ItemData.Items[this.selectedItem].Name);

		//Load Data		
		artist = this.ItemData.Items[this.selectedItem].Name.replace(/ /g, '+');
		artist = artist.replace(/&/g, '%26');
		switch (this.title1) {
		case "Artists":
			url2 = Server.getItemTypeURL("?SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=MusicAlbum&Recursive=true&StartIndex=0&Artists="+this.ItemData.Items[this.selectedItem].Name.replace(" ","+"));
			break;
		case "Album Artists":
			url2 = Server.getItemTypeURL("?SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=MusicAlbum&Recursive=true&StartIndex=0&Artists="+artist);
			break;
		case "Albums":
			url2 = Server.getChildItemsURL(this.ItemData.Items[this.selectedItem].Id,"&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Audio&Recursive=true");
			break;
		default:
			//Default is AlbumArtist
			url2 = Server.getItemTypeURL("?SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=MusicAlbum&Recursive=true&StartIndex=0&Artists="+artist);
			break;
		}

		//Blocking code to skip getting data for items where the user has just gone past it
		this.timeout = setTimeout(function(){
			if (MusicArtist.selectedItem == this.selectedItem) {
				MusicArtist.ItemData2 = Server.getContent(url2);
				if (MusicArtist.ItemData2 == null) { return; }

				//Display first XX series
				MusicArtist.updateDisplayedItems2();

				//Update Selected Collection CSS
				MusicArtist.updateSelectedItems2(true);
			}
		}, 500);

		//Background Image
		var currentSelectedItem = this.selectedItem;
		setTimeout(function(){
			if (MusicArtist.selectedItem == currentSelectedItem) {
					//A movie.
					if (MusicArtist.ItemData.Items[currentSelectedItem].BackdropImageTags.length > 0) {
						var imgsrc = Server.getBackgroundImageURL(MusicArtist.ItemData.Items[currentSelectedItem].Id,"Backdrop",Main.backdropWidth,Main.backdropHeight,0,false,0,MusicArtist.ItemData.Items[currentSelectedItem].BackdropImageTags.length);
						Support.fadeImage(imgsrc);
					//A music album.
					} else if (MusicArtist.ItemData.Items[currentSelectedItem].ParentBackdropImageTags) {
						var imgsrc = Server.getBackgroundImageURL(MusicArtist.ItemData.Items[currentSelectedItem].ParentBackdropItemId,"Backdrop",Main.backdropWidth,Main.backdropHeight,0,false,0,MusicArtist.ItemData.Items[currentSelectedItem].ParentBackdropImageTags.length);
						Support.fadeImage(imgsrc);
					}
			}
		}, 1000);
	}
};

MusicArtist.keyDown = function() {
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
			clearTimeout(this.timeout);
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			Support.processReturnURLHistory();
			break;
		case tvKey.KEY_YELLOW:
			//Favourites
			break;
		case tvKey.KEY_BLUE:
			//Focus the music player
			if (this.selectedItem == -1) {
				if (this.selectedBannerItem == this.bannerItems.length-1) {
					MusicPlayer.showMusicPlayer("MusicArtist", "bannerItem"+this.selectedBannerItem,"bannerItem highlight"+Main.highlightColour+"Text");
				} else {
					MusicPlayer.showMusicPlayer("MusicArtist", "bannerItem"+this.selectedBannerItem,"bannerItem bannerItemPadding highlight"+Main.highlightColour+"Text");
				}
			} else {
				MusicPlayer.showMusicPlayer("MusicArtist", this.divprepend1 + this.ItemData.Items[this.selectedItem].Id,document.getElementById(this.divprepend1 + this.ItemData.Items[this.selectedItem].Id).className);
			}


			break;
		case tvKey.KEY_EXIT:
			clearTimeout(this.timeout);
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
	}
};

MusicArtist.openMenu = function() {
	if (this.selectedItem == -1) {
		if (this.selectedBannerItem == -1) {
			document.getElementById("bannerItem0").class = "bannerItem bannerItemPadding";
		}
		this.selectedItem = 0;
		this.topLeftItem = 0;
	}
		Support.updateURLHistory("MusicArtist",this.startParams[0],this.startParams[1],null,null,this.selectedItem,this.topLeftItem,true);
		MainMenu.requested("MusicArtist",this.divprepend1 + this.ItemData.Items[this.selectedItem].Id);
};

MusicArtist.processTopMenuLeftKey = function() {
	if (this.selectedItem == -1) {
		this.selectedBannerItem--;
		if (this.selectedBannerItem == -1) { //Going left from the end of the top menu.
			this.openMenu();
		}
		this.updateSelectedBannerItems();
	} else if (this.selectedItem % this.MAXCOLUMNCOUNT == 0){ //Going left from the first column.
			this.openMenu();
	} else {
		this.selectedItem--;
		if (this.selectedItem == -1) {
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

MusicArtist.processTopMenuRightKey = function() {
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
				this.selectedItem = this.selectedItem-1;
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

MusicArtist.processTopMenuUpKey = function() {
	this.selectedItem = this.selectedItem - this.MAXCOLUMNCOUNT;
	if (this.selectedItem < 0) {
		this.selectedBannerItem = 0;
		this.selectedItem = -1;
		//Hide red
		Support.updateSelectedNEW(this.ItemData.Items, this.selectedItem, this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(), this.ItemData.Items.length), "music selected", "music", this.divprepend1, true);
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

MusicArtist.processTopMenuDownKey = function() {
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

MusicArtist.processTopMenuEnterKey = function() {
	alert ("TopMenuEnterKey");
	if (this.selectedItem == -1) {
		Support.enterMusicPage(this.bannerItems[this.selectedBannerItem]);
	} else {
		if (this.ItemData2.Items.length > 0) {
			//Set to 0 and reset display, then set to -1 and update selected so none are selected, then reset to 0
			var rememberSelectedItem = this.selectedItem;

			this.selectedItem = -1;
			this.updateSelectedItems(true);
			this.selectedItem = rememberSelectedItem;

			//Set Focus
			document.getElementById("evnMusicArtistBottom").focus();
			//Update Selected
			this.selectedItem2 = 0;
			this.updateSelectedItems2(false);
		}
	}
};

//---------------------------------------------------------------------------------------------------
//      BOTTOM ITEMS HANDLERS
//---------------------------------------------------------------------------------------------------
MusicArtist.updateDisplayedItems2 = function() {
	Support.updateDisplayedItems(this.ItemData2.Items,this.selectedItem2,this.topLeftItem2,
			Math.min(this.topLeftItem2 + this.getMaxDisplay2(),this.ItemData2.Items.length),"lowerContent",this.divprepend2,this.isResume2);
};

//Function sets CSS Properties so show which user is selected
MusicArtist.updateSelectedItems2 = function (bypassCounter) {
	Support.updateSelectedNEW(this.ItemData2.Items, this.selectedItem2, this.topLeftItem2,
			Math.min(this.topLeftItem2 + this.getMaxDisplay2(), this.ItemData2.Items.length), "music selected", "music", this.divprepend2, bypassCounter);
};

MusicArtist.bottomKeyDown = function() {
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

	switch(keyCode) {
		case tvKey.KEY_LEFT:
			alert("LEFT BOTTOM");
			this.selectedItem2--;
			if (this.selectedItem2 == -1) {
				this.selectedItem2 = 0; //Going left from bottom items row.
				//Open the menu
				Support.updateURLHistory("MusicArtist",this.startParams[0],this.startParams[1],null,null,this.selectedItem,this.topLeftItem,false);
				MainMenu.requested("MusicArtistBottom",this.divprepend2 + this.ItemData2.Items[this.selectedItem2].Id);

			} else {
				if (this.selectedItem2 < this.topLeftItem2) {
					this.topLeftItem2--;
					if (this.topLeftItem2 < 0) {
						this.topLeftItem2 = 0;
					}
					this.updateDisplayedItems2();
				}
			}
			this.updateSelectedItems2();
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT BOTTOM");
			this.selectedItem2++;
			if (this.selectedItem2 >= this.ItemData2.Items.length) {
				this.selectedItem2--;
			} else {
				if (this.selectedItem2 >= this.topLeftItem2+this.getMaxDisplay2() ) {
					this.topLeftItem2++;
					this.updateDisplayedItems2();
				}
			}
			this.updateSelectedItems2();
			break;
		case tvKey.KEY_UP:
			alert("UP BOTTOM");
			this.selectedItem2 = -1;
			this.updateSelectedItems2(true);
			this.topLeftItem2 = 0;

			//Set Focus
			document.getElementById("evnMusicArtist").focus();
			this.updateSelectedItems(false);
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER BOTTOM");
			this.processSelectedItem();
			break;
		case tvKey.KEY_PLAY:
			this.playSelectedItem(this.ItemData2.Items,this.selectedItem2);
			break;
		case tvKey.KEY_YELLOW:
			MusicPlayer.showPlayer();
			break;
		case tvKey.KEY_TOOLS:
			widgetAPI.blockNavigation(event);
			//Return added here - deleted in MainMenu if user does return
			if (this.selectedItem == -1) {
				if (this.selectedBannerItem != this.bannerItems.length-1) {
					document.getElementById("bannerItem"+this.selectedBannerItem).className = "bannerItem bannerItemPadding";
				} else {
					document.getElementById("bannerItem"+this.selectedBannerItem).className = "bannerItem";
				}
				this.selectedItem = 0;
				this.topLeftItem = 0;
			}
			Support.updateURLHistory("MusicArtist",this.startParams[0],this.startParams[1],null,null,this.selectedItem,this.topLeftItem,false);
			MainMenu.requested("MusicArtistBottom",this.divprepend2 + this.ItemData2.Items[this.selectedItem2].Id);
			break;
		case tvKey.KEY_RETURN:
			//In this instance handle return to go up to the top menu
			alert("RETURN BOTTOM");
			widgetAPI.blockNavigation(event);
			this.selectedItem2 = 0;
			this.topLeftItem2 = 0;

			this.selectedItem2 = -1;
			this.updateSelectedItems2(true);

			//Set Focus
			document.getElementById("evnMusicArtist").focus();
			this.updateSelectedItems(false);
			break;
		case tvKey.KEY_YELLOW:
			//Favourites
			break;
		case tvKey.KEY_BLUE:
			MusicPlayer.showMusicPlayer("MusicArtistBottom", this.divprepend2 + this.ItemData2.Items[this.selectedItem2].Id,document.getElementById(this.divprepend2 + this.ItemData2.Items[this.selectedItem2].Id).className);
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY BOTTOM");
			widgetAPI.sendExitEvent();
			break;
	}
};

//--------------------------------------------------------------------------------------------------------

MusicArtist.updateSelectedBannerItems = function() {
	for (var index = 0; index < this.bannerItems.length; index++) {
		if (index == this.selectedBannerItem) {
			if (index != this.bannerItems.length-1) {
				document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding highlight"+Main.highlightColour+"Text";
			} else {
				document.getElementById("bannerItem"+index).className = "bannerItem highlight"+Main.highlightColour+"Text";
			}
		} else {
			if (index != this.bannerItems.length-1) {
				if (this.bannerItems[index] == this.startParams[0]) {
					document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding offWhite";
				} else {
					document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding";
				}
			} else {
				if (this.bannerItems[index] == this.startParams[0]) {
					document.getElementById("bannerItem"+index).className = "bannerItem offWhite";
				} else {
					document.getElementById("bannerItem"+index).className = "bannerItem";
				}
			}
		}
	}
};

MusicArtist.processSelectedItem = function () {
	Support.updateURLHistory("MusicArtist",this.startParams[0],this.startParams[1],null,null,this.selectedItem,this.topLeftItem,false);
	var url = Server.getChildItemsURL(this.ItemData2.Items[this.selectedItem2].Id,"&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Audio&Recursive=true&CollapseBoxSetItems=false");
	Music.start(this.ItemData2.Items[this.selectedItem2].Name,url,this.ItemData2.Items[this.selectedItem2].Type);
};

MusicArtist.playSelectedItem = function (array,selected) {
};

MusicArtist.processIndexing = function() {
	var indexPos = this.ItemIndexData[1];

	this.indexSeekPos++;
	if (this.indexSeekPos >= indexPos.length) {
		this.indexSeekPos = 0;
		this.topLeftItem = 0;
	}

	this.selectedItem = indexPos[this.indexSeekPos];
	this.topLeftItem = this.selectedItem;

	this.updateDisplayedItems();
	this.updateSelectedItems();
};

MusicArtist.loadMoreItems = function() {
	if (this.totalRecordCount > this.ItemData.Items.length) {
		Support.pageLoadTimes("MusicArtist", "GetRemainingItems", false);

		//Show Loading Div
		document.getElementById("playerLoading").style.visibility = "";

		//Remove User Control
		document.getElementById("noKeyInput").focus();

		//Load Data
		var originalLength = this.ItemData.Items.length;
		var ItemDataRemaining = Server.getContent(this.startParams[1] + "&Limit="+File.getTVProperty("ItemPaging") + "&StartIndex=" + originalLength);
		if (ItemDataRemaining == null) { return; }
		Support.pageLoadTimes("MusicArtist","GotRemainingItems",false);

		for (var index = 0; index < ItemDataRemaining.Items.length; index++) {
			this.ItemData.Items[index+originalLength] = ItemDataRemaining.Items[index];
		}
		Support.widgetPutInnerHTML("counter", (this.selectedItem + 1) + "/" + this.ItemData.Items.length);

		//Reprocess Indexing Algorithm

		//Hide Loading Div
		document.getElementById("playerLoading").style.visibility = "hidden";

		//Pass back Control
		document.getElementById("MusicArtist").focus();

		Support.pageLoadTimes("MusicArtist", "AddedRemainingItems",false);
	}
};

MusicArtist.returnFromMusicPlayer = function() {
	this.selectedItem = 0;
	this.updateDisplayedItems();
	this.updateSelectedItems();
};