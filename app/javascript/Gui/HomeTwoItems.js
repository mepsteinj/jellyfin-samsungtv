var HomeTwoItems = {
	selectedBannerItem : -1,
	ItemData : null,
	selectedItem : 0,
	topLeftItem : 0,
	isResume : false,
	ItemData2 : null,
	selectedItem2 : -1,
	topLeftItem2 : 0,
	isResume2 : false,
	menuItems : [],
	MAXCOLUMNCOUNT : 3,
	MAXROWCOUNT : 1,
	divprepend1 : "",
	divprepend2 : "bottom_",
	startParams : [],
	backdropTimeout : null
};

HomeTwoItems.onFocus = function() {
	Helper.setControlButtons(Main.messages.LabButtonFavourite, Main.messages.LabButtonWatched, Main.messages.LabButtonHelp, MusicPlayer.Status == "PLAYING" || MusicPlayer.Status == "PAUSED" ? Main.messages.LabButtonMusic : null, Main.messages.LabButtonExit);
};

HomeTwoItems.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
};

HomeTwoItems.getMaxDisplayBottom = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
};

HomeTwoItems.start = function(title1, url1, title2, url2,selectedItem, topLeftItem, isTop) {
	alert("Page Enter : HomeTwoItems");

	//Save Start Params
	this.startParams = [title1, url1, title2, url2];

	//Load Data
	this.ItemData = Server.getContent(url1);
	if (this.ItemData == null) { Support.processReturnURLHistory(); }

	this.ItemData2 = Server.getContent(url2);
	if (this.ItemData2 == null) { return; }

	//If array like MoviesRecommended alter
	if (title1 == "Suggested For You") {
		if (this.ItemData[0] === undefined){
			this.ItemData[0] = {"Items":[]}; //Create empty Items array and continue
		}
		this.ItemData = this.ItemData[0];
	}
	if (title2 == "Suggested For You") {
		if (this.ItemData2[0] === undefined){
			this.ItemData2[0] = {"Items":[]}; //Create empty Items array and continue
		}
		this.ItemData2 = this.ItemData2[0];
	}

	//Latest Page Fix
	if (title1 == "Latest TV" || title1 == "Latest Movies") {
		this.ItemData.Items = this.ItemData;
	}
	if (title2 == "Latest TV" || title2 == "Latest Movies") {
		this.ItemData2.Items = this.ItemData2;
	}

	if (this.ItemData.Items.length > 0 && this.ItemData2.Items.length > 0) {
		//Proceed as Normal

		//Set TopLeft
		if (isTop == false) {
			this.selectedItem = -1;
			this.selectedItem2 = selectedItem; //Prevents any item being shown as selected!
			this.topLeftItem = 0;
			this.topLeftItem2 = topLeftItem;
			//Set Focus for Key Events
			document.getElementById("evnHomeTwoItemsBottom").focus();
		} else {
			this.selectedItem = selectedItem;
			this.selectedItem2 = -1; //Prevents any item being shown as selected!
			this.topLeftItem = topLeftItem;
			this.topLeftItem2 = 0;
			//Set Focus for Key Events
			document.getElementById("envHomeTwoItems").focus();
		}

		//Set PageContent
		Support.widgetPutInnerHTML("pageContent", "<div id=bannerSelection class='bannerMenu'></div><div id=center class='homeOneCenter'>" +
		"<p style='position:relative;font-size:1.4em;padding-left:11px;z-index:5;'>" + title1 + "</p><div id='topRow' style='margin-bottom:50px'><div id=content></div></div>" +
		"<p style='position:relative;font-size:1.4em;padding-left:11px;z-index:5;'>" + title2 + "</p><div id='bottomRow'><div id=content2></div></div>" +
		"</div>");

		//Set isResume based on title - used in UpdateDisplayedItems
		this.isResume = (title1 == "Resume" ||  title1 == "Continue Watching" ) ? true : false;

		//If to determine positioning of content
		document.getElementById("center").style.top = "180px";
		document.getElementById("center").style.left = "170px";
		document.getElementById("center").style.width = "1620px";

		//Generate Banner Items
		this.menuItems = MainMenu.menuItemsHomePages;

		//Generate Banner display
		var bannerSelection = "";
		for (var index = 0; index < this.menuItems.length; index++) {
			if (index != this.menuItems.length-1) {
				bannerSelection += "<div id='bannerItem" + index + "' class='bannerItemHome bannerItemPadding'>" + this.menuItems[index].replace(/_/g, ' ') + "</div>";
			} else {
				bannerSelection += "<div id='bannerItem" + index + "' class='bannerItemHome'>" + this.menuItems[index].replace(/_/g, ' ') + "</div>";
			}
		}
		Support.widgetPutInnerHTML("bannerSelection", bannerSelection);

		//Display first XX series
		this.updateDisplayedItems();

		//Update Selected Collection CSS
		var updateCounter = (isTop == true) ? false : true;
		this.updateSelectedItems(updateCounter);

		//Set isResume based on title - used in UpdateDisplayedItems
		this.isResume2 = (title2 == "Resume" ||  title2 == "Continue Watching" ) ? true : false;

		//Display first XX series
		this.updateDisplayedItems2();

		//Update Selected Collection CSS
		var updateCounter2 = (isTop == true) ? true : false;
		this.updateSelectedItems2(updateCounter2);
		this.updateSelectedBannerItems();

		//Function to generate random backdrop
		this.backdropTimeout = setTimeout(function(){
			var randomImageURL = Server.getItemTypeURL("&SortBy=Random&IncludeItemTypes=Series,Movie&Recursive=true&CollapseBoxSetItems=false&Limit=20&EnableTotalRecordCount=false");
			var randomImageData = Server.getContent(randomImageURL);
			if (randomImageData == null) { return; }

			for (var index = 0; index < randomImageData.Items.length; index++) {
				if (randomImageData.Items[index ].BackdropImageTags.length > 0) {
					var imgsrc = Server.getBackgroundImageURL(randomImageData.Items[index ].Id, "Backdrop", Main.backdropWidth,Main.backdropHeight, 0, false, 0, randomImageData.Items[index ].BackdropImageTags.length);
					Support.fadeImage(imgsrc);
					break;
				}
			}
		}, 500);

	} else if (this.ItemData.Items.length > 0 && this.ItemData2.Items.length == 0) {
		HomeOneItem.start(title1, url1, 0, 0);
	} else if (this.ItemData.Items.length == 0 && this.ItemData2.Items.length > 0) {
		HomeOneItem.start(title2, url2, 0, 0);
	} else if (this.ItemData.Items.length == 0 && this.ItemData2.Items.length == 0) {
		//No data to Show at all!!
		//Generate Media Collections title & URL!
		HomeOneItem.start(title1, url1, 0, 0);
	}
};

//---------------------------------------------------------------------------------------------------
//      TOP ITEMS HANDLERS
//---------------------------------------------------------------------------------------------------

HomeTwoItems.updateDisplayedItems = function() {
		Support.updateDisplayedItems(this.ItemData.Items,this.selectedItem,this.topLeftItem,
				Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length), "content", this.divprepend1,this.isResume,null,true);
};

//Function sets CSS Properties so show which user is selected
HomeTwoItems.updateSelectedItems = function (bypassCounter) {
	Support.updateSelectedNEW(this.ItemData.Items, this.selectedItem, this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(), this.ItemData.Items.length), "homePagePoster collection selected highlight" + Main.highlightColour + "Boarder", "homePagePoster collection", this.divprepend1, bypassCounter);
};

HomeTwoItems.updateSelectedBannerItems = function() {
	for (var index = 0; index < this.menuItems.length; index++) {
		if (index == this.selectedBannerItem && this.selectedItem == -2) {
			if (index != this.menuItems.length-1) {
				document.getElementById("bannerItem" + index).className = "bannerItemHome bannerItemPadding highlight" + Main.highlightColour + "Text";
			} else {
				document.getElementById("bannerItem" + index).className = "bannerItemHome highlight" + Main.highlightColour + "Text";
			}
		} else {
			if (index != this.menuItems.length-1) {
				document.getElementById("bannerItem" + index).className = "bannerItemHome bannerItemPadding offWhite";
			} else {
				document.getElementById("bannerItem" + index).className = "bannerItemHome offWhite";
			}
		}
	}
};

HomeTwoItems.keyDown = function()
{
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

	switch(keyCode)
	{
		case tvKey.KEY_LEFT:
			alert("LEFT");
			this.processLeftKey();
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT");
			if (this.selectedItem == -2) {
				this.selectedBannerItem++;
				if (this.selectedBannerItem >= this.menuItems.length) {
					this.selectedBannerItem--;
				}
				this.updateSelectedBannerItems();
			} else {
				this.selectedItem++;
				if (this.selectedItem >= this.ItemData.Items.length) {
					this.selectedItem--;
				} else {
					if (this.selectedItem >= this.topLeftItem+this.getMaxDisplay() ) {
						this.topLeftItem++;
						this.updateDisplayedItems();
					}
					this.updateSelectedItems();
				}
			}
			break;
		case tvKey.KEY_UP:
			this.selectedBannerItem = 0;
			this.selectedItem = -2;
			if (this.topLeftItem != 0) {
				this.topLeftItem = 0;
				if (this.ItemData.Items.length > 0) {
					this.updateDisplayedItems();
				}
			}
			this.updateSelectedItems(true);
			this.updateSelectedBannerItems();
			break;
		case tvKey.KEY_DOWN:
			alert ("DOWN");
			if (this.selectedItem == -2) {
				this.selectedItem = 0;
				this.selectedBannerItem = -1;
				this.updateSelectedBannerItems();
				this.updateSelectedItems(false);
			} else {
				//1st row to 2nd row items
				if (this.ItemData2.Items.length > 0) {
					//Set to 0 and reset display, then set to -1 and update selected so none are selected, then reset to 0
					if (this.topLeftItem != 0) {
						this.topLeftItem = 0;
						//Only update if there are items to show!!!
						if (this.ItemData.Items.length > 0) {
							this.updateDisplayedItems();
						}
					}

					this.selectedItem = -1;
					this.updateSelectedItems(true);
					this.selectedItem = 0;

					//Set Focus
					document.getElementById("evnHomeTwoItemsBottom").focus();
					//Update Selected
					this.selectedItem2 = 0;
					this.updateSelectedItems2(false);
				}
			}
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			this.processSelectedItem(this.ItemData,true);
			break;
		case tvKey.KEY_PLAY:
			alert ("PLAY");
			this.playSelectedItem(this.ItemData.Items,true);
			break;
		case tvKey.KEY_TOOLS:
			widgetAPI.blockNavigation(event);
			HomeTwoItems.openMenu();
			break;
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			Support.processReturnURLHistory();
			break;
		case tvKey.KEY_YELLOW:
			Helper.toggleHelp("HomeTwoItems");
			break;
		case tvKey.KEY_GREEN:
			if (this.ItemData.Items[this.selectedItem].MediaType == "Video") {
				if (this.ItemData.Items[this.selectedItem].UserData.Played == true) {
					Server.deleteWatchedStatus(this.ItemData.Items[this.selectedItem].Id);
					this.ItemData.Items[this.selectedItem].UserData.Played = false;
				} else {
					Server.setWatchedStatus(this.ItemData.Items[this.selectedItem].Id);
					this.ItemData.Items[this.selectedItem].UserData.Played = true;
				}
				setTimeout(function(){
					HomeTwoItems.updateDisplayedItems();
					HomeTwoItems.updateSelectedItems();
				}, 250);
			}
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
				setTimeout(function(){
					HomeTwoItems.updateDisplayedItems();
					HomeTwoItems.updateSelectedItems();
				}, 250);
			}
			break;
		case tvKey.KEY_BLUE:
			if (this.selectedItem == -2) {
				if (this.selectedBannerItem == this.menuItems.length-1) {
					MusicPlayer.showMusicPlayer("HomeTwoItems", "bannerItem" + this.selectedBannerItem,"bannerItemHome highlight"+Main.highlightColour+"Text");
				} else {
					MusicPlayer.showMusicPlayer("HomeTwoItems", "bannerItem" + this.selectedBannerItem,"bannerItemHome bannerItemPadding highlight"+Main.highlightColour+"Text");
				}
			} else {
				MusicPlayer.showMusicPlayer("HomeTwoItems", this.divprepend1 + this.ItemData.Items[this.selectedItem].Id, document.getElementById(this.divprepend1 + this.ItemData.Items[this.selectedItem].Id).className);
			}
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
	}
};

HomeTwoItems.openMenu = function() {
	if (this.selectedItem == -2) {
		Support.updateURLHistory("HomeTwoItems", this.startParams[0], this.startParams[1], this.startParams[2], this.startParams[3], this.selectedItem, this.topLeftItem,true);
		if (this.selectedBannerItem == this.menuItems.length-1) {
			MainMenu.requested("HomeTwoItems", "bannerItem" + this.selectedBannerItem, "bannerItemHome highlight" + Main.highlightColour + "Text");
		} else {
			MainMenu.requested("HomeTwoItems", "bannerItem" + this.selectedBannerItem, "bannerItemHome bannerItemPadding highlight" + Main.highlightColour + "Text");
		}
	} else {
		Support.updateURLHistory("HomeTwoItems", this.startParams[0], this.startParams[1], this.startParams[2], this.startParams[3], this.selectedItem, this.topLeftItem, true);
		MainMenu.requested("HomeTwoItems",this.divprepend1 + this.ItemData.Items[this.selectedItem].Id);
	}
};

HomeTwoItems.processLeftKey = function() {
	if (this.selectedItem == -2) {
		this.selectedBannerItem--;
		if (this.selectedBannerItem == -1) {
			this.selectedBannerItem = 0;
			this.openMenu(); //Going left from the end of the banner menu.
		} else {
			this.updateSelectedBannerItems();
		}
	} else {
		this.selectedItem--;
		if (this.selectedItem == -1) {
			this.selectedItem = 0;
			this.openMenu(); //Going left from top items row.
		} else {
			if (this.selectedItem < this.topLeftItem) {
				this.topLeftItem = this.selectedItem - (this.getMaxDisplay() - 1);
				if (this.topLeftItem < 0) {
					this.topLeftItem = 0;
				}
				this.updateDisplayedItems();
			}
			this.updateSelectedItems();
		}
	}
};

//---------------------------------------------------------------------------------------------------
//      BOTTOM ITEMS HANDLERS
//---------------------------------------------------------------------------------------------------

HomeTwoItems.updateDisplayedItems2 = function() {
	Support.updateDisplayedItems(this.ItemData2.Items, this.selectedItem2, this.topLeftItem2,
			Math.min(this.topLeftItem2 + this.getMaxDisplayBottom(), this.ItemData2.Items.length), "content2", this.divprepend2, this.isResume2, null, true);
};

//Function sets CSS Properties so show which user is selected
HomeTwoItems.updateSelectedItems2 = function (bypassCounter) {
	Support.updateSelectedNEW(this.ItemData2.Items, this.selectedItem2, this.topLeftItem2,
			Math.min(this.topLeftItem2 + this.getMaxDisplayBottom(), this.ItemData2.Items.length), "homePagePoster collection selected highlight" + Main.highlightColour + "Boarder", "homePagePoster collection", this.divprepend2, bypassCounter);
};

HomeTwoItems.bottomKeyDown = function()
{
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

	switch(keyCode)
	{
		case tvKey.KEY_LEFT:
			alert("LEFT BOTTOM");
			this.selectedItem2--;
			if (this.selectedItem2 == -1) {
				this.selectedItem2 = 0; //Going left from bottom items row.
				//Open the menu
				Support.updateURLHistory("HomeTwoItems", this.startParams[0], this.startParams[1], this.startParams[2], this.startParams[3], this.selectedItem2, this.topLeftItem2, false);
				MainMenu.requested("HomeTwoItemsBottom", this.divprepend2 + this.ItemData2.Items[this.selectedItem2].Id);
			} else {
				if (this.selectedItem2 < this.topLeftItem2) {
					this.topLeftItem2--;
					if (this.topLeftItem2 < 0) {
						this.topLeftItem2 = 0;
					}
					this.updateDisplayedItems2();
				}
				this.updateSelectedItems2();
			}
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT BOTTOM");
			this.selectedItem2++;
			if (this.selectedItem2 >= this.ItemData2.Items.length) {
				this.selectedItem2--;
			} else {
				if (this.selectedItem2 >= this.topLeftItem2 + this.getMaxDisplayBottom() ) {
					this.topLeftItem2++;
					this.updateDisplayedItems2();
				}
			}
			this.updateSelectedItems2();
			break;
		case tvKey.KEY_UP:
			alert("UP BOTTOM");
			if (this.ItemData.Items.length > 0) {
				if (this.topLeftItem2 != 0) {
					this.topLeftItem2 = 0;
					if (this.ItemData2.Items.length > 0) {
						this.updateDisplayedItems2();
					}
				}

				this.selectedItem2 = -1;
				this.updateSelectedItems2(true);
				this.selectedItem2 = 0;

				//Set Focus
				document.getElementById("HomeTwoItems").focus();
				//Update Selected
				this.selectedItem = 0;
				this.updateSelectedItems(false);
			}
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER BOTTOM");
			this.processSelectedItem(this.ItemData2, false);
			break;
		case tvKey.KEY_PLAY:
			this.playSelectedItem(this.ItemData2.Items, false);
			break;
		case tvKey.KEY_TOOLS:
			widgetAPI.blockNavigation(event);
			Support.updateURLHistory("HomeTwoItems", this.startParams[0], this.startParams[1], this.startParams[2], this.startParams[3], this.selectedItem2, this.topLeftItem2, false);
			MainMenu.requested("HomeTwoItemsBottom", this.divprepend2 + this.ItemData2.Items[this.selectedItem2].Id);
			break;
		case tvKey.KEY_RETURN:
			alert("RETURN BOTTOM");
			widgetAPI.blockNavigation(event);
			Support.processReturnURLHistory();
			break;
		case tvKey.KEY_YELLOW:
			Helper.toggleHelp("HomeTwoItems");
			break;
		case tvKey.KEY_GREEN:
			if (this.ItemData2.Items[this.selectedItem2].MediaType == "Video") {
				if (this.ItemData2.Items[this.selectedItem2].UserData.Played == true) {
					Server.deleteWatchedStatus(this.ItemData2.Items[this.selectedItem2].Id);
					this.ItemData2.Items[this.selectedItem2].UserData.Played = false;
				} else {
					Server.setWatchedStatus(this.ItemData2.Items[this.selectedItem2].Id);
					this.ItemData2.Items[this.selectedItem2].UserData.Played = true;
				}
				setTimeout(function(){
					HomeTwoItems.updateDisplayedItems2();
					HomeTwoItems.updateSelectedItems2();
				}, 250);
			}
			break;
		case tvKey.KEY_RED:
			if (this.selectedItem > -1) {
				if (this.ItemData2.Items[this.selectedItem2].UserData.IsFavorite == true) {
					Server.deleteFavourite(this.ItemData2.Items[this.selectedItem2].Id);
					this.ItemData2.Items[this.selectedItem2].UserData.IsFavorite = false;
				} else {
					Server.setFavourite(this.ItemData2.Items[this.selectedItem2].Id);
					this.ItemData2.Items[this.selectedItem2].UserData.IsFavorite = true;
				}
				setTimeout(function(){
					HomeTwoItems.updateDisplayedItems2();
					HomeTwoItems.updateSelectedItems2();
				}, 250);
			}
			break;
		case tvKey.KEY_BLUE:
			MusicPlayer.showMusicPlayer("HomeTwoItemsBottom",this.divprepend2 + this.ItemData2.Items[this.selectedItem2].Id, document.getElementById(this.divprepend2 + this.ItemData2.Items[this.selectedItem2].Id).className);
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY BOTTOM");
			widgetAPI.sendExitEvent();
			break;
	}
};

//--------------------------------------------------------------------------------------------------------

HomeTwoItems.processSelectedItem = function (array,isTop) {
	clearTimeout(this.backdropTimeout);
	if (this.selectedItem == -2) {
		Support.updateURLHistory("HomeTwoItems", this.startParams[0], this.startParams[1], this.startParams[2], this.startParams[3], 0, 0, true);
		Support.processHomePageMenu(this.menuItems[this.selectedBannerItem]);
	} else {
		var selectedItem = 0;
		var topLeftItem = 0;
		var isLatest = false;

		if (isTop == true) {
			selectedItem = this.selectedItem;
			topLeftItem = this.topLeftItem;
			if (this.startParams[0] == "New TV") {
				isLatest = true;
			}
		} else {
			selectedItem = this.selectedItem2;
			topLeftItem = this.topLeftItem2;
			if (this.startParams[2] == "New TV") {
				isLatest = true;
			}
		}
		Support.processSelectedItem("HomeTwoItems", array, this.startParams, selectedItem, topLeftItem, isTop, null, isLatest);
	}
};

HomeTwoItems.playSelectedItem = function(array, isTop) {
	if (isTop == true) {
		Support.playSelectedItem("HomeTwoItems", this.ItemData,this.startParams, this.selectedItem, this.topLeftItem, isTop);
	} else {
		Support.playSelectedItem("HomeTwoItems", this.ItemData2,this.startParams, this.selectedItem2, this.topLeftItem2, isTop);
	}
};