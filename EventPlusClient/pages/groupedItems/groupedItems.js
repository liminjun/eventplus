///<reference path="//Microsoft.WinJS.1.0/js/base.js"/>
///<reference path="//Microsoft.WinJS.1.0/js/ui.js" />
/// <reference path="///LiveSDKHTML/js/wl.js" />
(function () {
    "use strict";
    //配置client_id和redirect_uri,2个都需要配置，并且在Manage页面填写redirect_uri
    WL.init();

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;
    //默认鼠标未按下任何键
    var mousedownValue = 0;

    //the handler function for "Add Evenbt"
    function displayAddEventView() {
        nav.navigate("/pages/events/addEvent.html");
    }
    //删除活动Autorization failed
    function removeEvent() {
        var groupedItemList = document.getElementById("groupedItemList");
        if (groupedItemList) {
            var listView = document.getElementById("groupedItemList").winControl;
            if (listView.selection.count() > 0) {
                var eventItems = listView.selection.get
                //包含选中项的数组
                var indices = listView.selection.getIndices();
                //获取当前选中选项的eventid
                var currentEventId = listView.elementFromIndex(indices[0]).childNodes[1].childNodes[1].value;
                //var currentEventId = Data.eventlist.getAt(indices[0]).eventid;
                Data.items.splice(indices[0], 1);
                Data.removeEventForJSON(currentEventId, SdkSample.accountId);
            }
        }
        else {
            console.log("未选中任何活动!");
        }
    }

    function mousdeDownHandler(event) {
        //鼠标右键
        if (event.button == 2) {
            mousedownValue = 2;
        }
    }

    /*The selection changed of listview*/
    function doSelectItem(event) {

        var appbarDiv = document.getElementById("appbar");
        var appbar = document.getElementById("appbar").winControl;


        var listView = document.getElementById("groupedItemList").winControl;

        var count = listView.selection.count();
        //选中了一个item，并且是通过右键选择的，显示AppBar.


        if (count > 0 && mousedownValue == 2) {
            //appbar.sticky = true;
            appbar.show();

        } else {
            appbar.hide();
            //appbar.sticky = false;
        }
        //每次显示AppBar之后，将鼠标按键值清空为0.
        mousedownValue = 0;
    }
    

    //递归函数
    function userLogin() {
        WL.login({ scope: ["wl.signin"] }).then(function () {
            //获取用户信息
            WL.api({
                path: "me",
                method: "GET"
            }).then(function (response) {
                SdkSample.accountStatus.delegationJsonUserInfo = response;
                SdkSample.showUserInfo();
            },
            function (responseFailed) {
                document.getElementById("usernameDisplay").innerText = "登录失败!";
            });
            //获取用户头像
            WL.api({
                path: "me/picture",
                method: "GET"
            }).then(function (response) {
                SdkSample.accountStatus.UserPhoto = response;
                SdkSample.showUserPhoto();
            }, function (responseFailed) {
                console.log("获取用户头像失败!");

            });
        }, function (responseFailed) {
            console.log("用户登录失败!");
            userLogin();
        });
    }
    


    ui.Pages.define("/pages/groupedItems/groupedItems.html", {
        // Navigates to the groupHeaderPage. Called from the groupHeaders,
        // keyboard shortcut and iteminvoked.
        navigateToGroup: function (key) {
            nav.navigate("/pages/groupDetail/groupDetail.html", { groupKey: key });
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            //user must login in using the Microsoft Account at first


            var listView = element.querySelector(".groupeditemslist").winControl;
            listView.groupHeaderTemplate = element.querySelector(".headertemplate");
            listView.itemTemplate = element.querySelector(".itemtemplate");
            listView.oniteminvoked = this._itemInvoked.bind(this);

            // Set up a keyboard shortcut (ctrl + alt + g) to navigate to the
            // current group when not in snapped mode.
            listView.addEventListener("keydown", function (e) {
                if (appView.value !== appViewState.snapped && e.ctrlKey && e.keyCode === WinJS.Utilities.Key.g && e.altKey) {
                    var data = listView.itemDataSource.list.getAt(listView.currentItem.index);
                    this.navigateToGroup(data.group.key);
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }.bind(this), true);

            this._initializeLayout(listView, appView.value);
            listView.element.focus();

            listView.addEventListener("selectionchanged", doSelectItem);

            document.getElementById("loginStatus").innerText = SdkSample.signInText;


            element.addEventListener("MSPointerDown", mousdeDownHandler);

            //listen the click event on the Appbar
            var appbar = document.getElementById("appbar").winControl;

            appbar.showCommands(["barseparator", "cmdAdd", "cmdDelete"], true);
            //在group页面不显示添加视频和图片按钮
            appbar.hideCommands(["cmdCamera", "cmdVideo"], true);

            //Register the event handler for the "Add Event"
            document.getElementById('cmdAdd').addEventListener('click', displayAddEventView, false);
            document.getElementById('cmdDelete').addEventListener('click', removeEvent, false);
            //Update the user's profile
            userLogin();

            SdkSample.displayAccountStatus();
            

            WL.Event.subscribe("auth.login", homeLoginComplete);
            
            function homeLoginComplete() {
                console.log("用户登录成功!");
            }
        },

        // This function updates the page layout in response to viewState changes.
        updateLayout: function (element, viewState, lastViewState) {
            var listView = element.querySelector(".groupeditemslist").winControl;
            if (lastViewState !== viewState) {
                if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
                    var handler = function (e) {
                        listView.removeEventListener("contentanimating", handler, false);
                        e.preventDefault();
                    }
                    listView.addEventListener("contentanimating", handler, false);
                    this._initializeLayout(listView, viewState);
                }
            }
        },

        // This function updates the ListView with new layouts
        _initializeLayout: function (listView, viewState) {
            /// <param name="listView" value="WinJS.UI.ListView.prototype" />

            if (viewState === appViewState.snapped) {
                listView.itemDataSource = Data.groups.dataSource;
                listView.groupDataSource = null;
                listView.layout = new ui.ListLayout();
            } else {
                listView.itemDataSource = Data.items.dataSource;
                listView.groupDataSource = Data.groups.dataSource;
                listView.layout = new ui.GridLayout({ groupHeaderPosition: "top" });
            }
        },

        _itemInvoked: function (args) {
            if (appView.value === appViewState.snapped) {
                // If the page is snapped, the user invoked a group.
                var group = Data.groups.getAt(args.detail.itemIndex);
                this.navigateToGroup(group.key);
            } else {
                // If the page is not snapped, the user invoked an item.
                var item = Data.items.getAt(args.detail.itemIndex);
                var currentEventId = Data.eventlist.getAt(args.detail.itemIndex).eventid;
                nav.navigate("/pages/itemDetail/itemDetail.html", { item: Data.getItemReference(item), eventid: currentEventId });
            }
        },
    });

    //显示用户名字
    function showUserInfo() {
        var me = SdkSample.accountStatus.delegationJsonUserInfo;
        if (me !== null) {
            //document.getElementById("loginStatus").innerText = me.name;
            //document.getElementById("userName").innerText = me.name;
            //store the value for default.js,or when user navigate to the detail item, then return the default.html,the user name is lost.
            SdkSample.signInText = me.name;

            SdkSample.accountName = me.name;
            SdkSample.accountId = me.id;
            Data.readEventsData(me.id);
            console.log("user account id:"+me.id);
            if (document.getElementById("loginStatus")) {
                document.getElementById("loginStatus").innerText = me.name;
            }
            SdkSample.displayAccountStatus();

        } else {
            document.getElementById("loginStatus").innerText = "Guest";
        }
    };

    //显示用户头像
    function showUserPhoto() {
        var me = SdkSample.accountStatus.UserPhoto;
        var userPhoto = document.getElementById("userPicture");
        if (me !== null) {
            if (userPhoto) {
                userPhoto.width = 100;
                userPhoto.height = 100;
                userPhoto.src = me.location;
            }
        }
        else {
            userPhoto.src = "/images/user.png";
        }
    }
    WinJS.Namespace.define("SdkSample", {
        showUserInfo: showUserInfo,
        showUserPhoto: showUserPhoto,
        userLogin: userLogin
    });
})();