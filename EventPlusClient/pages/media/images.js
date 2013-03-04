// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    var flipView;
    var imagesdataList=null;
    var selectedImageIndex = 0;
    var dataTransferManager = null;
    function registerForShare() {
        dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
        dataTransferManager.addEventListener("datarequested", shareImageHandler);
        
    };
    function shareImageHandler(e) {
        var request = e.request;
        request.data.properties.title = "一个测试活动";
        request.data.properties.description = "将您的活动照片分享给您的好友.";
        
        var shareImageUri = new Windows.Foundation.Uri(imagesdataList.getItem(selectedImageIndex).data.mediapath);
        request.data.properties.thumbnail = Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(shareImageUri);
        request.data.setBitmap(Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(shareImageUri));

        dataTransferManager.removeEventListener("datarequested", shareImageHandler);
    };
    var appbar = document.getElementById("appbar").winControl;

    function appbarshowHandler() {
            appbar.hide();
    };

    WinJS.UI.Pages.define("/pages/media/images.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.

        ready: function (element, options) {
            appbar.addEventListener("beforeshow", appbarshowHandler);
            var eventid = null;
            var accountId = SdkSample.accountId;
            if (options && options.eventId) {
                eventid = parseInt(options.eventId);
            }
            flipView = element.querySelector("#basicFlipView").winControl;

            var listView = element.querySelector("#imagesListView").winControl;
            listView.oniteminvoked = this._itemInvoked.bind(this);
            
            var rand = Math.random();
            var options = { type: "GET", url: Data.ServerURL+"eventImages.aspx?EventId=" + eventid + "&userId=" + accountId+"&ticket="+rand};
            WinJS.xhr(options).done(
                function completed(request) {
                    imagesdataList = new WinJS.Binding.List( JSON.parse(request.responseText));
                    var publicMembers = {
                        itemList: imagesdataList
                    };
                    WinJS.Namespace.define("DataExample", publicMembers);
                    listView.itemDataSource = DataExample.itemList.dataSource;
                    flipView.itemDataSource = DataExample.itemList.dataSource;
                },
                function error(request) {
                    console.log("Get the events' images by eventid using Ajax error.");
                },
                function progress(request) {

                });
            //只有在detail页面才可以分享内容
            registerForShare();
            //listView.itemDataSource = imagesdataList.dataSource;
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
            dataTransferManager.removeEventListener("datarequested", shareImageHandler);
            appbar.removeEventListener("beforeshow", appbarshowHandler);
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
        },
        //ListView itemInvoked event.
        _itemInvoked: function (args) {
            flipView.currentPage = args.detail.itemIndex;
            selectedImageIndex = args.detail.itemIndex;
        }
     
    });
})();
