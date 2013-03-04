function displayError(message) {
    var msg = new Windows.UI.Popups.MessageDialog(message);
    WinJS.log && WinJS.log(message, "sample", "error");
}