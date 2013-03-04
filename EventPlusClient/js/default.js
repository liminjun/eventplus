//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    var sampleTitle = "EventPlus, manage your event easily!";

    var signInText = "", accountName = "";
    var accountId = "";


    var accountStatus = {
        isSignedIn: false,
        delegationTicket: "",
        delegationJsonUserInfo: null,
        UserPhoto:null,
        delegationJsonUserContacts: null,
        delegationJsonUserActivity: null,
        jwtTicket: "",
        jwtServerResponse: ""
    };
    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;
    


    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    return nav.navigate(Application.navigator.home);
                }
            }));
             
        }
    });



    function displayStatus(message) {
        console.log(message, "sample", "status");
    }
    //辅助方法，显示错误信息。使用popup
    function displayError(message) {
        console.log(message, "sample", "error");
    }

    function resetOutput() {
        var items = document.querySelectorAll("#outputTiles .item");
        for (var i = 0, len = items.length; i < len; i++) {
            items[i].innerText = "";
        }
    }

    //set the style of "Sign in" button and "user's image"
    function displayAccountStatus() {
        var styleDisplay;

        

        

        
    }
    

    WinJS.Namespace.define("SdkSample", {
        sampleTitle: sampleTitle,
        
        accountStatus: accountStatus,
        displayAccountStatus: displayAccountStatus,
        accountName: accountName,
        accountId:accountId,
        displayStatus: displayStatus,
        displayError: displayError,
        //sign in text.
        signInText:signInText
    });

    //App Setting
    var page = WinJS.UI.Pages.define("/html/AppSettings.html", {
        ready: function (element, options) {
            var i;
            var items;
            var len;

            if (SdkSample.accountStatus.isSignedIn && SdkSample.authenticator.canSignOut) {
                items = document.querySelectorAll("#signOut .item");
                for (i = 0, len = items.length; i < len; i++) {
                    items[i].style.display = "block";
                }
                items = document.querySelectorAll("#cannotSignOut .item");
                for (i = 0, len = items.length; i < len; i++) {
                    items[i].style.display = "none";
                }
            } else {
                items = document.querySelectorAll("#signOut .item");
                for (i = 0, len = items.length; i < len; i++) {
                    items[i].style.display = "none";
                }
                items = document.querySelectorAll("#cannotSignOut .item");
                for (i = 0, len = items.length; i < len; i++) {
                    items[i].style.display = "block";
                }
            }
        }
    });

    // Add Settings handler
    WinJS.Application.onsettings = function (e) {
        e.detail.applicationcommands = {
            "account": { title: "账户设置", href: "/html/account.html" },
            "privacy": { title: "隐私策略", href: "/html/privacy.html" }
        };
        WinJS.UI.SettingsFlyout.populateSettings(e);
    };

    //WinJS.Application.addEventListener("activated", activated, false);
    WinJS.Application.start();
})();
