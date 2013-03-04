// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="///LiveSDKHTML/js/wl.js" />
(function () {
    "use strict";
    var nav = WinJS.Navigation;

    WL.init();
    WinJS.UI.Pages.define("/html/account.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            WL.api({
                path: "me",
                method:"GET"
            }).then(function (response) {
                SdkSample.accountStatus.delegationJsonUserInfo = response;
                SdkSample.showUserInfo();
                document.getElementById("usernameDisplay").innerText = "欢迎:" + response.name + "!";
                document.getElementById("signin").style.display = "none";

                if (WL.canLogout()) {
                    document.getElementById("signout").style.display = "block";
                    //用户注销之后，马上提示用户登录
                    EventPlus.onSignInTap();
                } else {
                    document.getElementById("signout").style.display = "none";
                }
            },
            function (responseFailed) {
                document.getElementById("usernameDisplay").innerText = "请先登录!";
                document.getElementById('signout').style.display = "none";
                document.getElementById('signin').style.display = "block";
            });
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
        }
    });
    
    WinJS.Namespace.define("EventPlus", {
        onSignInTap: onSignInTap
    });
})();

function onSignInTap() {

    WL.Event.subscribe("auth.login", onLoginComplete);
    WL.login({ scope: ["wl.signin"] });
};
function onLoginComplete() {
    // The WL.api function tries to get the user's profile information.
    //  If the user is signed-in to the Microsoft account, the function 
    //    returns the user's name in the response. The user's name is displayed,
    //    the Sign in button is hidden, and the Sign out button is displayed.
    //  If the user is not signed in, the error message is displayed,
    //    the Sign out button is hidden, and the Sign in button is displayed.

    WL.api({
        path: "me",
        method: "GET"
    }).then(
        // If this is called from the Windows login, these elements won't be defined so
        // be sure to check for NULL objects
        function (response) {
            
            document.getElementById("usernameDisplay").innerText = "Hello: " + response.name + "!";
            // Note: you'll want to update the main app pages to show the user's name after sign-in.
            document.getElementById('signin').style.display = "none";
            
            // Show the sign-out button only if it is possible for the 
            // user to sign out.
            if (WL.canLogout()) {
                document.getElementById('signout').style.display = "block";
                
            } else {
                document.getElementById('signout').style.display = "none";
            }
            
        },
        function (responseFailed) {
            document.getElementById("usernameDisplay").innerText = responseFailed.error.message;
            document.getElementById('signout').style.display = "none";
            document.getElementById('signin').style.display = "block";
        }
    );
    //重新抓取数据
    SdkSample.userLogin();
};
function onSignOutTap() {
    WL.logout();
    document.getElementById('signout').style.display = "none";
    document.getElementById('signin').style.display = "block";
    document.getElementById("usernameDisplay").innerText = "请先登录.";
    onSignInTap();
}