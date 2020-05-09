var TVUpcoming = {
	upcomingData : [],
	dateArray : [],
	topDayItem : 0,
	selectedDayItem : 0,
	selectedItem : 0,
	topLeftItem : 0,
	bannerItems : ["Series","Latest","Upcoming","Genre","A-Z"],
	selectedBannerItem : 0,
	MAXCOLUMNCOUNT : 3,
	MAXROWCOUNT : 1,
	divprepend1 : "",
	divprepend2 : "bottom_",
	backdropTimeout : null
};

TVUpcoming.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
};

TVUpcoming.getMaxDisplayBottom = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
};

TVUpcoming.start = function() {
	alert("Page Enter : TVUpcoming");
	Helper.setControlButtons(null, null, null, MusicPlayer.Status == "PLAYING" || MusicPlayer.Status == "PAUSED" ? "Music" : null, "Return");

	//Load Data
	var url = Server.getCustomURL("/Shows/Upcoming?format=json&Limit=40&Fields=AirTime,UserData,SeriesStudio,SyncInfo&UserId=" + Server.getUserID());
	var ItemData = Server.getContent(url);
	if (ItemData == null) { return; }

	//Reset Vars
	this.selectedItem = 0;
	this.selectedItem2 = -1; //Prevents any item being shown as selected!
	this.topLeftItem = 0;
	this.topLeftItem2 = 0;
	this.topDayItem = 0;
	this.selectedDayItem = 0;

	var sameDayCount = 0;
	var seperateDayCount = 0;

	//Split into arrays on a per day basis
	this.upcomingData[seperateDayCount] = new Array();
	this.upcomingData[seperateDayCount][sameDayCount] = ItemData.Items[0];
	var currentdate = ItemData.Items[0].PremiereDate.substring(0, 10);
	this.dateArray[0] = Support.AirDate(currentdate,"Episode");
	for (var index = 1; index < ItemData.Items.length; index++) {
		//Compare release date
		if (ItemData.Items[index].PremiereDate.substring(0, 10) == currentdate) {
			sameDayCount++;
		} else {
			currentdate = ItemData.Items[index].PremiereDate.substring(0, 10);
			seperateDayCount++;
			this.dateArray[seperateDayCount] = Support.AirDate(currentdate,"Episode");;
			this.upcomingData[seperateDayCount] = new Array();
			sameDayCount = 0;
		}
		this.upcomingData[seperateDayCount][sameDayCount] = ItemData.Items[index];
	}

	//Set PageContent
	var pageContent = "<div id=bannerSelection class='bannerMenu'></div>" +
			"<div id=Center class='HomeOneCenter'>" +
			"<p id='title1' style='position:relative;font-size:1.2em;padding-left:22px;z-index:5;'></p><div id='TopRow' style='margin-bottom:60px'><div id=Content></div></div>" +
			"<p id='title2' style='position:relative;font-size:1.2em;padding-left:22px;z-index:5;'></p><div id='BottomRow'><div id=Content2></div></div>" +
			"</div>";
	Support.widgetPutInnerHTML("pageContent", pageContent);


	//If to determine positioning of content
	document.getElementById("Center").style.top = "140px";
	document.getElementById("Center").style.left = "200px";
	document.getElementById("Center").style.width = "1520px";
	
	var bannerSelection = "";
	if (ItemData.Items.length > 0) {
		//Generate Banner display
		for (var index = 0; index < this.bannerItems.length; index++) {
			if (index != this.bannerItems.length-1) {
				bannerSelection += "<div id='bannerItem" + index + "' class='bannerItem bannerItemPadding'>"+this.bannerItems[index].replace(/_/g, ' ') +
				"</div>";
				
			} else {
				bannerSelection += "<div id='bannerItem" + index + "' class='bannerItem'>"+this.bannerItems[index].replace(/_/g, ' ') + 
				"</div>";
			}
		}
		Support.widgetPutInnerHTML("bannerSelection", bannerSelection);

		//Display first XX series
		this.updateDisplayedItems();

		//Update Selected Collection CSS
		this.updateSelectedItems();

		//Display first XX series
		this.updateDisplayedItems2();

		//Update Selected Collection CSS
		this.updateSelectedItems2();
		//Update Titles
		this.updateTitles();
		//Update Banner
		this.selectedBannerItem = -1;
		this.updateSelectedBannerItems();
		this.selectedBannerItem = 0;
		//Update Counter
		this.updateCounter();
		document.getElementById("evnTVUpcoming").focus();
	} else  {
		//Set message to user
		Support.widgetPutInnerHTML("counter", "");
		document.getElementById("content").style.fontSize="1.3em";
		var content = "Huh.. Looks like I have no content to show you in this view I'm afraid<br>Press return to get back to the previous screen";
		Support.widgetPutInnerHTML("content", content);
		document.getElementById("noItems").focus();
	}
};

//---------------------------------------------------------------------------------------------------
//      TITLE + COUNTER SETTER
//---------------------------------------------------------------------------------------------------
TVUpcoming.updateTitles = function() {
	Support.widgetPutInnerHTML("title1", this.dateArray[this.topDayItem]);
  Support.widgetPutInnerHTML("title2", this.dateArray[this.topDayItem + 1]);
};

TVUpcoming.updateCounter = function(isBottom) {
  var counter = "";
	if (this.selectedItem == -2) {
		counter = (this.selectedBannerItem+1) + "/" + this.bannerItems.length;
	} else if (isBottom){
	  counter = (this.selectedDayItem+1) + "/" + this.upcomingData.length + " - " + (this.selectedItem2+1) + "/" + this.upcomingData[this.selectedDayItem].length;
	} else {
		counter = (this.selectedDayItem+1) + "/" + this.upcomingData.length + " - " + (this.selectedItem+1) + "/" + this.upcomingData[this.selectedDayItem].length;
	}
	Support.widgetPutInnerHTML("counter", counter);
};

//---------------------------------------------------------------------------------------------------
//      TOP ITEMS HANDLERS
//---------------------------------------------------------------------------------------------------
TVUpcoming.updateDisplayedItems = function() {
	Support.updateDisplayedItems(this.upcomingData[this.topDayItem], this.selectedItem,this.topLeftItem,
			 Math.min(this.topLeftItem + this.getMaxDisplay(), this.upcomingData[this.topDayItem].length), "Content", this.divprepend1, false, null, true);
};

//Function sets CSS Properties so show which user is selected
TVUpcoming.updateSelectedItems = function () {
	Support.updateSelectedNEW(this.upcomingData[this.topDayItem], this.selectedItem, this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(), this.upcomingData[this.topDayItem].length), "series collection selected", "series collection", this.divprepend1, true);
};

TVUpcoming.updateSelectedBannerItems = function() {
	for (var index = 0; index < this.bannerItems.length; index++) {
		if (index == this.selectedBannerItem) {
			if (index != this.bannerItems.length-1) {
				document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding highlight"+Main.highlightColour+"Text";
			} else {
				document.getElementById("bannerItem"+index).className = "bannerItem highlight"+Main.highlightColour+"Text";
			}
		} else {
			if (index != this.bannerItems.length-1) {
				if (this.bannerItems[index] == "Upcoming") {
					document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding offWhite";
				} else {
					document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding";
				}
			} else {
				if (this.bannerItems[index] == "Upcoming") {
					document.getElementById("bannerItem"+index).className = "bannerItem offWhite";
				} else {
					document.getElementById("bannerItem"+index).className = "bannerItem";
				}
			}
		}
	}
};

TVUpcoming.keyDown = function()
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
		if (this.selectedItem == -2) {
			this.selectedBannerItem--;
			if (this.selectedBannerItem < 0) {
				this.selectedBannerItem = 0;
				this.openMenu();
			}
			this.updateSelectedBannerItems();
			this.updateCounter();
		} else {
			this.selectedItem--;
			if (this.selectedItem < 0) {
				this.selectedItem++;
				this.openMenu();
			} else {
				if (this.selectedItem < this.topLeftItem) {
					this.topLeftItem--;
					if (this.topLeftItem < 0) {
						this.topLeftItem = 0;
					}
					this.updateDisplayedItems();
				}
				this.updateCounter();
			}
			this.updateSelectedItems();
		}
			break;
		case tvKey.KEY_RIGHT:
			if (this.selectedItem == -2) {
				this.selectedBannerItem++;
				if (this.selectedBannerItem >= this.bannerItems.length) {
					this.selectedBannerItem--;
				}
				this.updateSelectedBannerItems();
				this.updateCounter();
			} else {
				this.selectedItem++;
				if (this.selectedItem >= this.upcomingData[this.selectedDayItem].length) {
					this.selectedItem--;
				} else {
					if (this.selectedItem >= this.topLeftItem+this.getMaxDisplayBottom() ) {
						this.topLeftItem++;
						this.updateDisplayedItems();
					}
					this.updateSelectedItems();
					this.updateCounter();
				}
			}
		break;
		case tvKey.KEY_UP:
			if (this.selectedDayItem > 0 ) {
				this.topLeftItem = 0;
				this.topLeftItem2 = 0;

				//Tracks which day is selected (array pos of upcomingData)
				this.topDayItem--;
				this.selectedDayItem--;

				this.updateTitles();

				//Update Selected
				this.selectedItem  = 0;
				this.selectedItem2 = -1;
				this.updateDisplayedItems();
				this.updateSelectedItems();
				this.updateDisplayedItems2();
				this.updateSelectedItems2();
				this.selectedItem2 = 0;
				this.updateCounter();
			} else {
				this.selectedBannerItem = 0;
				this.selectedItem = -2;
				if (this.topLeftItem != 0) {
					this.topLeftItem = 0;
					if (this.ItemData.Items.length > 0) {
						this.updateDisplayedItems();
					}
				}
				this.updateSelectedItems();
				this.updateSelectedBannerItems();
				this.updateCounter();
			}
			break;
		case tvKey.KEY_DOWN:
			if (this.selectedItem == -2) {
				this.selectedItem = 0;
				this.selectedBannerItem = -1;
				this.updateSelectedBannerItems();
				this.updateSelectedItems();
				this.updateCounter();
			} else {
				//1st row to 2nd row items
				if (this.selectedDayItem < this.upcomingData.length) {
					//Set to 0 and reset display, then set to -1 and update selected so none are selected, then reset to 0
					if (this.topLeftItem != 0) {
						this.topLeftItem = 0;
						//Only update if there are items to show!!!
						if (this.ItemData.Items.length > 0) {
							this.updateDisplayedItems();
						}
					}

					//Tracks which day is selected (array pos of upcomingData)
					this.selectedDayItem++;

					this.selectedItem = -1;
					this.updateSelectedItems(true);
					this.selectedItem = 0;

					//Set Focus
					document.getElementById("evnTVUpcomingBottom").focus();
					//Update Selected
					this.selectedItem2 = 0;
					this.updateSelectedItems2();
					this.updateCounter(true);
				}
			}
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			this.processSelectedItem(false);
			break;
		case tvKey.KEY_TOOLS:
			widgetAPI.blockNavigation(event);
			this.openMenu();
			break;
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			Support.processReturnURLHistory();
			break;
		case tvKey.KEY_BLUE:
			if (this.selectedItem == -2) {
				if (this.selectedBannerItem == this.bannerItems.length-1) {
					MusicPlayer.showMusicPlayer("TVUpcoming", "bannerItem" + this.selectedBannerItem, "bannerItem highlight" + Main.highlightColour + "Text");
				} else {
					MusicPlayer.showMusicPlayer("TVUpcoming", "bannerItem" + this.selectedBannerItem, "bannerItem bannerItemPadding highlight" + Main.highlightColour + "Text");
				}
			} else {
				MusicPlayer.showMusicPlayer("TVUpcoming", this.divprepend1 + this.upcomingData[this.selectedDayItem][this.selectedItem].Id,document.getElementById(this.divprepend1 + this.upcomingData[this.selectedDayItem][this.selectedItem].Id).className);
			}
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
	}
};

TVUpcoming.openMenu = function() {
	if (this.selectedItem == -2) { //Banner menu
		if (this.selectedBannerItem == this.bannerItems.length-1) {
			document.getElementById("bannerItem"+this.selectedBannerItem).className = "bannerItem";
		} else if (this.selectedBannerItem == this.bannerItems.length-2) {
			document.getElementById("bannerItem"+this.selectedBannerItem).className = "bannerItem bannerItemPadding offWhite";
		} else {
			document.getElementById("bannerItem"+this.selectedBannerItem).className = "bannerItem bannerItemPadding";
		}
		MainMenu.requested("TVUpcoming", "bannerItem" + this.selectedBannerItem, "bannerItem bannerItemPadding highlight" + Main.highlightColour + "Text");
	} else {
		Support.updateURLHistory("TVUpcoming", null,null,null,null,this.selectedItem,this.topLeftItem,true);
		MainMenu.requested("TVUpcoming", this.divprepend1 + this.upcomingData[this.selectedDayItem][this.selectedItem].Id);
	}
};

//---------------------------------------------------------------------------------------------------
//      BOTTOM ITEMS HANDLERS
//---------------------------------------------------------------------------------------------------

TVUpcoming.updateDisplayedItems2 = function() {
	var item = this.topDayItem+1;
	Support.updateDisplayedItems(this.upcomingData[item],this.selectedItem2,this.topLeftItem2,
			Math.min(this.topLeftItem2 + this.getMaxDisplayBottom(),this.upcomingData[item].length),"Content2",this.divprepend2,false,null,true);
};

//Function sets CSS Properties so show which user is selected
TVUpcoming.updateSelectedItems2 = function () {
	var item = this.topDayItem+1;
	Support.updateSelectedNEW(this.upcomingData[item], this.selectedItem2, this.topLeftItem2,
			Math.min(this.topLeftItem2 + this.getMaxDisplayBottom(), this.upcomingData[item].length), "series collection selected", "series collection", this.divprepend2, true);
};


TVUpcoming.bottomKeyDown = function()
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
			if (this.selectedItem2 < 0) {
				this.selectedItem2++;
				this.openMenu2();
			} else {
				if (this.selectedItem2 < this.topLeftItem2) {
					this.topLeftItem2--;
					if (this.topLeftItem2 < 0) {
						this.topLeftItem2 = 0;
					}
					this.updateDisplayedItems2();
				}
				this.updateSelectedItems2();
				this.updateCounter(true);
			}
			break;
		case tvKey.KEY_RIGHT:
			this.selectedItem2++;
			if (this.selectedItem2 >= this.upcomingData[this.selectedDayItem].length) {
				this.selectedItem2--;
			} else {
				if (this.selectedItem2 >= this.topLeftItem2+this.getMaxDisplayBottom() ) {
					this.topLeftItem2++;
					this.updateDisplayedItems2();
				}
				this.updateSelectedItems2();
				this.updateCounter(true);
			}
			break;
		case tvKey.KEY_UP:
			if (this.topLeftItem2 != 0) {
				this.topLeftItem2 = 0;
				this.updateDisplayedItems2();
			}

			this.selectedItem2 = -1;
			this.updateSelectedItems2(true);
			this.selectedItem2 = 0;

			this.selectedDayItem--;

			//Set Focus
			document.getElementById("evnTVUpcoming").focus();
			//Update Selected
			this.selectedItem = 0;
			this.updateSelectedItems();
			this.updateCounter();
			break;
		case tvKey.KEY_DOWN:
			if (this.selectedDayItem < this.upcomingData.length-1) {
				this.topLeftItem = 0;
				this.topLeftItem2 = 0;

				//Tracks which day is selected (array pos of upcomingData)
				this.topDayItem++;
				this.selectedDayItem++;

				this.updateTitles();

				//Update Selected
				this.selectedItem  = -1;
				this.selectedItem2 = 0;
				this.updateDisplayedItems();
				this.updateSelectedItems();
				this.selectedItem  = 0;
				this.updateDisplayedItems2();
				this.updateSelectedItems2();
				this.updateCounter(true);
			}
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER BOTTOM");
			this.processSelectedItem(true);
			break;
		case tvKey.KEY_TOOLS:
			widgetAPI.blockNavigation(event);
			this.openMenu2();
			break;
		case tvKey.KEY_RETURN:
			alert("RETURN BOTTOM");
			widgetAPI.blockNavigation(event);
			Support.processReturnURLHistory();
			break;
		case tvKey.KEY_BLUE:
			MusicPlayer.showMusicPlayer("TVUpcomingBottom", this.divprepend2 + this.upcomingData[this.selectedDayItem][this.selectedItem2].Id,document.getElementById(this.divprepend2 + this.upcomingData[this.selectedDayItem][this.selectedItem2].Id).className);
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY BOTTOM");
			widgetAPI.sendExitEvent();
			break;
	}
};

TVUpcoming.openMenu2 = function() {
	Support.updateURLHistory("TVUpcoming", null,null,null,null,this.selectedItem2,this.topLeftItem2,false);
	MainMenu.requested("TVUpcomingBottom", this.divprepend2 + this.upcomingData[this.selectedDayItem][this.selectedItem2].Id);
};

//--------------------------------------------------------------------------------------------------------

TVUpcoming.processSelectedItem = function (isBottom) {
	clearTimeout(this.backdropTimeout);
	if (this.selectedItem == -2) {
		switch (this.bannerItems[this.selectedBannerItem]) {
		case "Series":
			var url = Server.getItemTypeURL("&IncludeItemTypes=Series"+Server.getTVViewQueryPart()+"&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&recursive=true");
			DisplaySeries.start("All TV",url,0,0);
		break;
		case "Unwatched":
			var url = Server.getItemTypeURL("&IncludeItemTypes=Series"+Server.getTVViewQueryPart()+"&SortBy=SortName&SortOrder=Ascending&isPlayed=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&recursive=true");
		  DisplaySeries.start("Unwatched TV", url, 0, 0);
		break;
		case "Latest":
			var url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Episode&isPlayed=false&IsFolder=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
			DisplaySeries.start("Latest TV", url, 0, 0);

		break;
		case "Genre":
			var url1 = Server.getCustomURL("/Genres?format=json&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Series"+Server.getTVViewQueryPart()+"&Recursive=true&ExcludeLocationTypes=Virtual&Fields=ParentId,SortName,ItemCounts&userId=" + Server.getUserID());
			DisplaySeries.start("Genre TV", url, 0, 0);
		break;
		case"A-Z":
			MusicAZ.start("TV",0);
			break;
		}
	} else {
		var selectedItem = (isBottom) ? this.selectedItem2 : this.selectedItem;
		Support.updateURLHistory("TVUpcoming", null, null, null, null, null, null, null);

		var url = Server.getItemInfoURL(this.upcomingData[this.selectedDayItem][selectedItem].Id, null);
		ItemDetails.start(this.upcomingData[this.selectedDayItem][selectedItem].Name, url, 0);
	}
};