// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511

(function () {
    "use strict";
    var nav = WinJS.Navigation;
    var eventInfo = null;


    var themeImages = [
    { title: "1.生日", picture: "events-theme/birthday.png" },
    { title: "2.聚餐", picture: "events-theme/cook.png" },
    { title: "3.婚礼", picture: "events-theme/weddings.png" },
    { title: "4.运动", picture: "events-theme/sports.png" },
    { title: "5.旅游", picture: "events-theme/travel.png" },
    { title: "6.其他", picture: "events-theme/other.png" }
    ];
    var themeList = new WinJS.Binding.List(themeImages);

    var publicMembers = {
        itemList: themeList
    };
    WinJS.Namespace.define("EventPlusData", publicMembers);

    //默认选中第一个
    var selectedThemeIndex = 0;
    var tempthemePath = themeList.getItem(selectedThemeIndex).data.picture;
    var passValidation1 = false;
    var passValidation2 = false;
    var passValidation3 = false;
    var passValidation4 = false;
    var dateValidation = false;
    WinJS.UI.Pages.define("/pages/events/addEvent.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var inputCollections = element.querySelectorAll('input[type="text"]');

            this.divDatePicker = element.querySelector("#divDatePicker");



            this.divTimePicker = element.querySelector("#divTimePicker");

            this.inputDate = element.querySelector("#eventDate");
            this.inputTime = element.querySelector("#eventTime");

            this.friendsemail = element.querySelector("#friendsmail");

            this.btnsubmit = element.querySelector("#btnsubmit");

            this.resultText = element.querySelector(".resultText");
            //隐藏appbar.
            var appbar = document.getElementById("appbar").winControl;
            appbar.hide()

            WinJS.Utilities.query("#eventTitle", element)
                .listen("change", function () {
                    if (this.value != "") {
                        passValidation1 = true;
                    } else {
                        document.getElementById("eventTitleValidation").style.display = "block";
                        document.getElementById("eventTitleValidation").innerText = "必填项";   
                    }
                });
            WinJS.Utilities.query("#eventPosition", element)
                .listen("change", function () {
                    if (this.value != "") {
                        passValidation2 = true;
                    } else {
                        document.getElementById("eventPositionValidation").style.display = "block";
                        document.getElementById("eventPositionValidation").innerText = "必填项";
                        
                    }
                });
            WinJS.Utilities.query("#eventDesc", element)
                .listen("change", function () {
                    if (this.value != "") {
                        passValidation3 = true;
                    } else {
                        document.getElementById("eventDescValidation").style.display = "block";
                        document.getElementById("eventDescValidation").innerText = "必填项";
                        
                    }
                });

            WinJS.Utilities.query("#friendsmail", element)
                .listen("change", function () {
                    var result = true;
                    var pattern = /^(?:[a-zA-Z0-9]+[_\-\+\.]?)*[a-zA-Z0-9]+@(?:([a-zA-Z0-9]+[_\-]?)*[a-zA-Z0-9]+\.)+([a-zA-Z]{2,})+$/;

                    if (this.value != "") {
                        var emails = this.value.split(";");
                        for (var i = 0; i < emails.length;i++){
                            
                            result = result && pattern.test(emails[i]);
                        }
                        
                        if (result) {
                            passValidation3 = true;
                            document.getElementById("friendsmailValidation").style.display = "none";
                        }
                        else {
                            document.getElementById("friendsmailValidation").style.display = "block";
                            document.getElementById("friendsmailValidation").innerText = "邮件格式错误";
                        }
                    }
                });
            WinJS.Utilities.query("#friendsmail", element)
                .listen("mouseout", function () {
                    var result = true;
                    var pattern = /^(?:[a-zA-Z0-9]+[_\-\+\.]?)*[a-zA-Z0-9]+@(?:([a-zA-Z0-9]+[_\-]?)*[a-zA-Z0-9]+\.)+([a-zA-Z]{2,})+$/;

                    if (this.value != "") {
                        var emails = this.value.split(";");
                        for (var i = 0; i < emails.length; i++) {

                            result = result && pattern.test(emails[i]);
                        }

                        if (result) {
                            passValidation3 = true;
                            document.getElementById("friendsmailValidation").style.display = "none";
                        }
                        else {
                            document.getElementById("friendsmailValidation").style.display = "block";
                            document.getElementById("friendsmailValidation").innerText = "邮件格式错误";
                        }
                    }
                });
            WinJS.Utilities.query("#eventDate", element)
                .listen("click", this.createDatePickers.bind(this));

            WinJS.Utilities.query("#eventTime", element)
                .listen("click", this.createTimePickers.bind(this));

            //WinJS.Utilities.query("#friendsmail", element)
            //    .listen("click", this.pickContacts.bind(this));

            WinJS.Utilities.query("#btnsubmit", element)
                .listen("click", this.saveEvent.bind(this));//.bind(this)相当于把element对象传入到监听函数 element相当于本页面的document.
            var themelistView = element.querySelector("#themeImagesListView").winControl;
            themelistView.oniteminvoked = this._itemInvoked.bind(this);

        },
        //Theme ListView itemInvoked event.
        _itemInvoked: function (args) {
            selectedThemeIndex = args.detail.itemIndex;
            WinJS.Utilities.query("#themeImageSrc").setAttribute("src", themeList.getItem(selectedThemeIndex).data.picture);
            tempthemePath = themeList.getItem(selectedThemeIndex).data.picture;
        },
        
        saveEvent: function () {
            
            var _this = this;
            var result = false;

            var tempTitle = document.getElementById("eventTitle").value;
            

            var tempDate = this.inputDate.value;
            if (tempDate == "") {
                //默认日期
                var datepickerControl = new WinJS.UI.DatePicker(this.divDatePicker);
                tempDate = datepickerControl.current.toLocaleDateString()
            }

            var tempTime = this.inputTime.value;
            if (tempTime == "") {
                //默认时间
                var timepickerControl = new WinJS.UI.TimePicker(this.divTimePicker);
                tempTime = timepickerControl.current.toLocaleTimeString();
            }
            var tempPosition = document.getElementById("eventPosition").value;
            

            var tempDesc = document.getElementById("eventDesc").value;
            

            var friendsEmail = this.friendsemail.value;
            
            eventInfo = {
                "themePath": tempthemePath,
                "eventTitle": tempTitle,
                "eventDate": tempDate,
                "eventTime": tempTime,
                "eventLocation": tempPosition,
                "eventContent": tempDesc,
                "personList": friendsEmail
            };

            //Send the request to the server.
            if (passValidation1 && passValidation2 && passValidation3 && passValidation4 && dateValidation) {
                var options = { type: "POST", url: Data.ServerURL + "eventCreate.aspx?userId=" + SdkSample.accountId, data: JSON.stringify(eventInfo) };
                WinJS.xhr(options).done(
                    function completed(request) {
                        //console.log("添加活动结果" + JSON.parse(request.responseText));
                        var myresult = JSON.parse(request.responseText);
                        if (myresult.result == "success") {
                            //document.getElementById("resultText").innerHTML = "活动添加成功!";
                            WinJS.Utilities.query("#resultText").setStyle('background-image', "url('../../images/EventSuccess.png')");
                        }
                        else {
                            //document.getElementById("resultText").innerHTML = "活动添加失败!";
                            WinJS.Utilities.query("#resultText").setStyle('background-image', "url('../../images/EventFail.png')");
                        }
                    },
                    function error(request) {
                        console.log("Add the event using Ajax error.");
                    },
                    function progress(request) {

                    });
            }
        },

        pickContacts: function () {
            var _this = this;
            // Verify that we are unsnapped or can unsnap to open the picker.
            var viewState = Windows.UI.ViewManagement.ApplicationView.value;
            if (viewState === Windows.UI.ViewManagement.ApplicationViewState.snapped &&
                !Windows.UI.ViewManagement.ApplicationView.tryUnsnap()) {
                // Fail silently if we can't unsnap.
                return;
            };

            // Create the picker.
            var picker = new Windows.ApplicationModel.Contacts.ContactPicker();
            picker.commitButtonText = "Select";

            // Open the picker for the user to select contacts.
            picker.pickMultipleContactsAsync().done(function (contacts) {
                var output = "";
                var displayOutput = "";
                if (contacts.length > 0) {
                    // Display the selected contact names.
                    contacts.forEach(function (contact) {
                        displayOutput += contact.name + ";";
                        if (contact.emails.size > 0) {
                            output += contact.emails[0].value + ";";
                        }
                        else {

                            document.getElementById("friendsmailValidation").innerText = "选中的联系人未设置Email地址";
                        }
                    });
                }
                else {
                    document.getElementById("friendsmailValidation").innerText = "好友列表不能为空!请选择联系人";
                    document.getElementById("friendsmailValidation").style.display = "block";
                }
                _this.friendsemail.value = output;
            });
        },
        //日期选择器
        createDatePickers: function () {
            this.divDatePicker.innerHTML = "";
            //Create Controls
            var datepickerControl = new WinJS.UI.DatePicker(this.divDatePicker);

            var currentDate = new Date();
            currentDate.setHours(currentDate.getHours() - 12);
            var currentYear = currentDate.getFullYear();

            datepickerControl.minYear = currentYear;
            datepickerControl.monthPattern = "{month.integer(2)}";
            var _this = this;

            //click event listeners
            datepickerControl.element.addEventListener("change", function (srcElement) {
                if (datepickerControl.current <= currentDate) {
                    document.getElementById("dateValidation").style.display = "block";
                    document.getElementById("dateValidation").innerText = "日期不能为过去的日期!";   
                }
                else {
                    document.getElementById("dateValidation").style.display = "none";
                    dateValidation = true;
                }
                _this.inputDate.value = datepickerControl.current.toLocaleDateString();
            });
        },
        //时间选择器
        createTimePickers: function () {
            var _this = this;
            this.divTimePicker.innerHTML = "";
            //Create Controls
            var timepickerControl = new WinJS.UI.TimePicker(this.divTimePicker);
            //click event listeners
            timepickerControl.element.addEventListener("change", function () {
                var currentDate = new Date();
                if (timepickerControl.current.getUTCSeconds() <= currentDate.getUTCSeconds()) {
                    //document.getElementById("timeValidation").innerText = "时间不能为过去的时间!";
                    //document.getElementById("timeValidation").style.display = "block";
                }
                else {
                    //document.getElementById("timeValidation").style.display = "none";

                }
                _this.inputTime.value = timepickerControl.current.toLocaleTimeString();
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
})();