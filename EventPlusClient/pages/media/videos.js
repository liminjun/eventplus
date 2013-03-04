// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    var videosdataList;

    var selectedVideoIndex = 0;
    var dataTransferManager = null;
    function registerForShare() {
        dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
        
        dataTransferManager.addEventListener("datarequested", shareVideoHandler);

    };
    function shareVideoHandler(e) {
        //当前存在视频时才可以进行分享
        if (videosdataList.length > 0) {
            var request = e.request;
            request.data.properties.title = "一个测试活动";
            request.data.properties.description = "将当前的视频分享给您的好友.";

            var shareVideoUri = new Windows.Foundation.Uri(videosdataList.getItem(selectedVideoIndex).data.mediapath);
            request.data.properties.thumbnail = Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(shareVideoUri);
            request.data.setBitmap(Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(shareVideoUri));
        }
        dataTransferManager.removeEventListener("datarequested", shareVideoHandler);
    };
    var appbar = document.getElementById("appbar").winControl;
    function appbarshowHandler() {
        appbar.hide();
    };
    WinJS.UI.Pages.define("/pages/media/videos.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            appbar.addEventListener("beforeshow", appbarshowHandler);
            var eventid = null;
            var accountId = SdkSample.accountId;
            if (options && options.eventId) {
                eventid = parseInt(options.eventId);
            }
            var listView = element.querySelector("#videosListView").winControl;
            listView.oniteminvoked = this._itemInvoked.bind(this);
            var rand = Math.random();
            var options = { type: "GET", url: Data.ServerURL + "eventVideos.aspx?EventId=" + eventid + "&userId=" + accountId + "&ticket=" + rand };
            WinJS.xhr(options).done(
                function completed(request) {
                    videosdataList = new WinJS.Binding.List(JSON.parse(request.responseText));
                    var publicMembers = {
                        itemList: videosdataList
                    };
                    WinJS.Namespace.define("DataExample", publicMembers);
                    listView.itemDataSource = DataExample.itemList.dataSource;
                    if (videosdataList.length > 0) {
                        //默认加载第一个视频
                        document.getElementById("subtitleVideo").style.display = "block";
                        document.getElementById("subtitleVideo").src = DataExample.itemList.getItem(0).data.mediapath;
                    }

                },
                function error(request) {
                    console.log("Get the events' videos by eventid using Ajax error.");
                },
                function progress(request) {

                });
            registerForShare();
        },
        //video ListView itemInvoked event.
        _itemInvoked: function (args) {
            var videoIndex = args.detail.itemIndex;
            var videoplayer = document.getElementById("subtitleVideo");
            videoplayer.src = DataExample.itemList.getItem(videoIndex).data.mediapath;
            //选中特定的视频进行播放
            videoplayer.play();
            selectedVideoIndex = args.detail.itemIndex;
        },
        unload: function () {
            // TODO: Respond to navigations away from this page.
            dataTransferManager.removeEventListener("datarequested", shareVideoHandler);
            appbar.removeEventListener("beforeshow", appbarshowHandler);
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
        }
    });
})();
