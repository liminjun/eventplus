(function () {
    "use strict";
    var eventName = null;
    var currentEventId = null;
    var eventType = null;
    var shareImageUri = null;
    var mediaDescription = "";

    var mediaUri = null;
    var mediaFile = null;
    var mediaType = null;
    //添加描述是否完成
    var IsFinished = false;
    WinJS.UI.Pages.define("/pages/itemDetail/itemDetail.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var item = options && options.item ? Data.resolveItemReference(options.item) : Data.items.getAt(0);
            currentEventId = item.eventid;
            eventType = item.group;

            element.querySelector(".titlearea .pagetitle").textContent = item.group;
            eventName = item.title;
            element.querySelector("article .item-title").textContent = item.title;
            element.querySelector("article .item-subtitle").textContent = item.eventdate;
            element.querySelector("article .item-image").src = item.backgroundImage;
            element.querySelector("article .item-image").alt = item.title;
            element.querySelector("article .item-content").innerHTML = item.eventcontent;
            element.querySelector(".content").focus();
            

            
            var appbar = document.getElementById("appbar").winControl;
            appbar.hide()
            //appbar.addEventListener("beforeshow", function () {
            //    if (eventType == "已经结束的活动") {
            //        appbar.show();
            //    }
            //    else {
            //        appbar.hide();
            //    }
            //});
            
            //只显示"上传图片"和"上传视频"按钮
            appbar.showCommands(["cmdCamera", "cmdVideo"], false);
            //在detail页面不显示“添加活动”和“删除活动”按钮
            appbar.hideCommands(["barseparator","cmdAdd", "cmdDelete"], false);
            //UploadImage and UploadVideo event
            document.getElementById('cmdVideo').addEventListener('click', doClickVideo, false);
            document.getElementById('cmdCamera').addEventListener('click', doClickCamera, false);

            //user click the "galleryplaceholder" and "videoplaceholder"
            document.getElementById("galleryplaceholder").addEventListener('click', showImages, false);
            document.getElementById("videosplaceholder").addEventListener('click', showVideos, false);

            //添加描述对话框
            
            WinJS.Utilities.query("#btndescCancel").listen("click", function () {
                var flyout = document.getElementById("descriptionFlyout");
                if (flyout) {
                    flyout.winControl.hide();
                }
            });
            
            WinJS.Utilities.query("#btndescOK").listen("click", function () {
                var flyout = document.getElementById("descriptionFlyout");
                var descriptionContent = document.getElementById("mediadescription").value;
                if (descriptionContent != "") {
                    mediaDescription = descriptionContent;
                }
                else {
                    mediaDescription = "Empty";
                }
                if (flyout) {
                    flyout.winControl.hide();
                }
                var upload = new UploadOperation();
                upload.start(mediaUri, mediaFile, mediaType, mediaDescription);
            });
            
        }
    });
   
    //Show all images in the specific event.
    function showImages() {
        WinJS.Navigation.navigate("/pages/media/images.html", { eventId: currentEventId });
    };
    //Show all videos in the specific event.
    function showVideos() {
        WinJS.Navigation.navigate("/pages/media/videos.html", { eventId: currentEventId });
    };

    //Upload the image
    function doClickCamera() {
        uploadFile("image");
    };
    function doClickVideo() {
        uploadFile("video");
    };

    

    //File Upload Start
    // Global array used to persist operations.
    var uploadOperations = [];

    // Class associated with each upload.
    function UploadOperation() {
        var upload = null;
        var promise = null;

        this.start = function (uri, file, mediatype, mediaDescription) {
            
            var uploader = new Windows.Networking.BackgroundTransfer.BackgroundUploader();

            // Set a header, so the server can save the file (this is specific to the sample server).
            uploader.setRequestHeader("Filename", file.name);
            uploader.setRequestHeader("userId", SdkSample.accountId);
            
            uploader.setRequestHeader("eventId", currentEventId);
            //通知服务器上传的文件类型
            uploader.setRequestHeader("mediaType", mediatype);
            uploader.setRequestHeader("mediaDescription", mediaDescription);

            // Create a new upload operation.
            upload = uploader.createUpload(uri, file);
            // Start the upload and persist the promise to be able to cancel the upload.
            promise = upload.startAsync().then(complete, error, progress);
        };
        //多个文件上传
        this.startMultipart = function (uri, files) {
            printLog("Using URI: " + uri.absoluteUri + "<br/>");

            var uploader = new Windows.Networking.BackgroundTransfer.BackgroundUploader();
            var contentParts = [];
            files.forEach(function (file, index) {
                var part = new Windows.Networking.BackgroundTransfer.BackgroundTransferContentPart("File" + index, file.name);
                part.setFile(file);
                contentParts.push(part);
            });

            // Create a new upload operation.
            uploader.createUploadAsync(uri, contentParts).then(function (uploadOperation) {
                // Start the upload and persist the promise to be able to cancel the upload.
                upload = uploadOperation;
                promise = uploadOperation.startAsync().then(complete, error, progress);
            });
        };

        // On application activation, reassign callbacks for a upload
        // operation persisted from previous application state.
        this.load = function (loadedUpload) {
            upload = loadedUpload;
            
            promise = upload.attachAsync().then(complete, error, progress);
        };

        // 取消上传文件
        this.cancel = function () {
            if (promise) {
                promise.cancel();
                promise = null;
                printLog("Canceling upload: " + upload.guid + "<br\>");
            }
            else {
                printLog("Upload " + upload.guid + " already canceled.<br\>");
            }
        };

        // Returns true if this is the upload identified by the guid.
        this.hasGuid = function (guid) {
            return upload.guid === guid;
        };

        // Removes upload operation from global array.
        function removeUpload(guid) {
            uploadOperations.forEach(function (operation, index) {
                if (operation.hasGuid(guid)) {
                    uploadOperations.splice(index, 1);
                }
            });
        }

        // Progress callback.
        function progress() {
            // Get an anchor for the flyout
            var flyoutAnchor = document.getElementById("flyoutAnchor");
            // Show flyout at anchor
            document.getElementById("informationFlyout").winControl.show(flyoutAnchor);

            // Output all attributes of the progress parameter.
            printLog(upload.guid + " - Progress: ");
            var currentProgress = upload.progress;
            for (var att in currentProgress) {
                printLog(att + ": " + currentProgress[att] + ", ");
            }
            var msg = new Windows.UI.Popups.MessageDialog("正在上传中...");
            
            msg.commands.append(new Windows.UI.Popups.UICommand("取消", function (command) {
                WinJS.log && WinJS.log("The 'Cancel' command has been selected.", "sample", "status");
            }));
            
            msg.defaultCommandIndex = 0;
            // Set the command to be invoked when escape is pressed
            msg.cancelCommandIndex = 1;
            //msg.showAsync();
            // Handle various pause status conditions. This will never happen when using POST verb (the default)
            // but may when using PUT. Application can change verb used by using method property of BackgroundUploader class.
            if (currentProgress.status === Windows.Networking.BackgroundTransfer.BackgroundTransferStatus.pausedCostedNetwork) {
                printLog("Upload " + upload.guid + " paused because of costed network <br\>");
            } else if (currentProgress.status === Windows.Networking.BackgroundTransfer.BackgroundTransferStatus.pausedNoNetwork) {
                printLog("Upload " + upload.guid + " paused because network is unavailable.<br\>");
            }
        }

        // Completion callback.
        function complete() {
            removeUpload(upload.guid);

            printLog(upload.guid + " - upload complete. Status code: " + upload.getResponseInformation().statusCode + "<br/>");
            displayStatus(upload.guid + " - upload complete.");
            //delay 2s(2000ms)
            setTimeout(function () {
                var flyout = document.getElementById("informationFlyout");
                if (flyout) {
                    flyout.winControl.hide();//hide the flyout.
                }
            },2000);
        }

        // Error callback.
        function error(err) {
            if (upload) {
                removeUpload(upload.guid);
                printLog(upload.guid + " - upload completed with error.<br/>");
            }
            displayException(err);
        }
    }

    function displayException(err) {
        var message;
        if (err.stack) {
            message = err.stack;
        }
        else {
            message = err.message;
        }

        var errorStatus = Windows.Networking.BackgroundTransfer.BackgroundTransferError.getStatus(err.number);
        if (errorStatus === Windows.Web.WebErrorStatus.cannotConnect) {
            message = "App cannot connect. Network may be down, connection was refused or the host is unreachable.";
        }

        displayError(message);
    }

    

    function displayStatus(/*@type(String)*/message) {
        WinJS.log && WinJS.log(message, "sample", "status");
    }

    // Print helper function.
    function printLog(/*@type(String)*/txt) {
        console.log("Log text:"+txt);
    }

    function id(elementId) {
        return document.getElementById(elementId);
    }
    
    var HostURL = Data.ServerURL + "upload.aspx";

    //Upload the media to server.
    function uploadFile(mediatype) {
        // Verify that we are currently not snapped, or that we can unsnap to open the picker.
        var currentState = Windows.UI.ViewManagement.ApplicationView.value;
        if (currentState === Windows.UI.ViewManagement.ApplicationViewState.snapped && !Windows.UI.ViewManagement.ApplicationView.tryUnsnap()) {
            displayError("错误: 文件选择器无法在辅屏模式下打开. 请先滑动屏幕");
        }

        var filePicker = new Windows.Storage.Pickers.FileOpenPicker();
        //此处支持上传图片格式的文件
        if (mediatype == "image") {
            filePicker.fileTypeFilter.replaceAll([".png", ".jpg", ".jpeg", ".gif"]);
        }
            //上传视频，列出支持的视频格式
        else {
            filePicker.fileTypeFilter.replaceAll([".mp4", ".wmv", ".avi"]);
        }
        filePicker.pickSingleFileAsync().then(function (file) {
            if (!file) {
                displayError("错误: 未选中任何文件.");
                return;
            }

            // By default 'serverAddressField' is disabled and URI validation is not required. When enabling the text
            // box validating the URI is required since it was received from an untrusted source (user input).
            // The URI is validated by catching exceptions thrown by the Uri constructor.
            // Note that when enabling the text box users may provide URIs to machines on the intrAnet that require
            // the "Home or Work Networking" capability.
            var uri = null;
            try {
                uri = new Windows.Foundation.Uri(HostURL);
            } catch (error) {
                displayError("错误信息: 无效的URI地址. " + error.message);
                return;
            }
            mediaUri = uri;
            mediaFile = file;
            mediaType = mediatype;
            //显示输入照片或者视频的描述对话框
            showDescriptionPopup();
           
        });
    };
    function showDescriptionPopup() {
        var flyoutAnchor = document.getElementById("flyoutAnchor");
        // Show flyout at anchor
        
        if (document.getElementById("descriptionFlyout")) {
            var tempdescriptionFlyout = document.getElementById("descriptionFlyout").winControl;
            tempdescriptionFlyout.show(flyoutAnchor);
        }
    };
    //同时上传多个文件--TBD
    function uploadFiles() {
        // Verify that we are currently not snapped, or that we can unsnap to open the picker.
        var currentState = Windows.UI.ViewManagement.ApplicationView.value;
        if (currentState === Windows.UI.ViewManagement.ApplicationViewState.snapped && !Windows.UI.ViewManagement.ApplicationView.tryUnsnap()) {
            displayError("Error: File picker cannot be opened in snapped mode. Please unsnap first.");
        }

        var filePicker = new Windows.Storage.Pickers.FileOpenPicker();
        filePicker.fileTypeFilter.replaceAll(["*"]);
        filePicker.pickMultipleFilesAsync().then(function (files) {
            if (files === 0) {
                displayError("Error: No file selected.");
                return;
            }

            // By default 'serverAddressField' is disabled and URI validation is not required. When enabling the text
            // box validating the URI is required since it was received from an untrusted source (user input).
            // The URI is validated by catching exceptions thrown by the Uri constructor.
            // Note that when enabling the text box users may provide URIs to machines on the intrAnet that require
            // the "Home or Work Networking" capability.
            var uri = null;
            try {
                uri = new Windows.Foundation.Uri(HostURL);
            } catch (error) {
                displayError("Error: Invalid URI. " + error.message);
                return;
            }

            var upload = new UploadOperation();
            upload.startMultipart(uri, files);

            // Persist the upload operation in the global array.
            uploadOperations.push(upload);
        });
    }

    // Cancel all uploads.
    function cancelAll() {
        for (var i = 0; i < uploadOperations.length; i++) {
            uploadOperations[i].cancel();
        }
    }
    //File Upload End

})();
