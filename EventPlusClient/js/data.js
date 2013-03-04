(function () {
    "use strict";

    var list = new WinJS.Binding.List();
    var ServerURL = WinJS.Resources.getString('/ServerURL/address').value;
    var groupedItems = list.createGrouped(
        function groupKeySelector(item) {
            if (item.isFinished == "true") {
                return sampleGroups[1].key;
            }
            else {
                return sampleGroups[0].key;
            }
        },

        function groupDataSelector(item) {
            if (item.isFinished == "true") {
                return sampleGroups[1];
            }
            else {
                return sampleGroups[0];
            }
        }
    );
    
    // You can add data from asynchronous sources whenever it becomes available.
    var sampleGroups = [
            { key: "group1", title: "将要进行的活动", subtitle: "精彩不容错过", backgroundImage: '/images/event_start.png', description: "" },
            { key: "group2", title: "已经结束的活动", subtitle: "您参加了吗?", backgroundImage: '/images/event_end.gif', description: "" }
    ];

    WinJS.Namespace.define("Data", {
        items: groupedItems,
        groups: groupedItems.groups,
        getItemReference: getItemReference,
        getItemsFromGroup: getItemsFromGroup,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference,
        
        readEventsData: readEventsData,
        removeEventForJSON: removeEventForJSON,
        sampleGroups: sampleGroups,
        eventlist: list,
        ServerURL: ServerURL
    });

    // Get a reference for an item, using the group key and item title as a
    // unique reference to the item that can be easily serialized.
    function getItemReference(item) {
        return [item.group, item.title];
    }

    // This function returns a WinJS.Binding.List containing only the items
    // that belong to the provided group.
    function getItemsFromGroup(group) {
        return list.createFiltered(function (item) {
            if (item.isFinished == "true") {
                return sampleGroups[1].key === group.key;
            }
            else {
                return sampleGroups[0].key === group.key;
            }
        });
    }

    // Get the unique group corresponding to the provided group key.
    function resolveGroupReference(key) {
        for (var i = 0; i < groupedItems.groups.length; i++) {
            if (groupedItems.groups.getAt(i).key === key) {
                return groupedItems.groups.getAt(i);
            }
        }
    }

    // Get a unique item from the provided string array, which should contain a
    // group key and an item title.
    function resolveItemReference(reference) {
        for (var i = 0; i < groupedItems.length; i++) {
            var item = groupedItems.getAt(i);
            if (item.group === reference[0] && item.title === reference[1]) {
                return item;
            }
        }
    }

    //Return a JSON object

    function readEventsData(accountId) {
        var rand = Math.random();
        var options = { type: "GET", url: Data.ServerURL+"eventList.aspx?userId=" +accountId + "&ticket=" + rand };

        WinJS.xhr(options).done(
            function completed(request) {
                //remove all items from the list.
                list.forEach(function (item) {
                    list.pop(item);
                });
                console.log("Get eventlist success using Ajax.");
                if (request.responseText != "") {
                    var eventList = JSON.parse(request.responseText);
                    eventList.forEach(function (item) {
                        list.push(item);
                    });
                }
                
            },
            function error(request) {
                console.log("Get eventlist using Ajax error.");
            },
            function progress(request) {

            });
    }

    function removeEventForJSON(eventId, accountId) {
        var random = Math.random();
        var options = { type: "GET", url: Data.ServerURL+"eventDelete.aspx?EventId=" + eventId + "&userId=" + accountId+"&ticket="+random };
        WinJS.xhr(options).done(
            function completed(request) {
                //console.log("添加活动结果" + JSON.parse(request.responseText));
                var myresult = request.responseText;
                console.log("删除活动结果:" + myresult);
                //document.getElementById("resultText").innerHTML = myresult;

            },
            function error(request) {
                console.log("Delete the event using Ajax error.");
            },
            function progress(request) {

            });
    }

    // Returns an array of sample data that can be added to the application's
    // data list. 
    function generateSampleData() {

        var itemContent = "<p>活动内容</p>";
        var itemDescription = "Item Description";
        var groupDescription = "Group Description";
        var startevent_groupDescription = "将要举行的活动都显示在这里。可以选择右边具体的活动选项，查看活动的具体详情。期待您参与这些活动!";
        var endEvent_groupDescription = "您可能错过的活动都显示在这里。右边是您错过的活动列表，可以选择一项查看详情。多参加社交活动，有利于身体健康，期待您积极参加下一次活动。";
        // These three strings encode placeholder images. You will want to set the
        // backgroundImage property in your real data to be URLs to images.
        var darkGray = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY3B0cPoPAANMAcOba1BlAAAAAElFTkSuQmCC";
        var lightGray = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY7h4+cp/AAhpA3h+ANDKAAAAAElFTkSuQmCC";
        var mediumGray = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY5g8dcZ/AAY/AsAlWFQ+AAAAAElFTkSuQmCC";

        // Each of these sample groups must have a unique key to be displayed
        // separately.


        // Each of these sample items should have a reference to a particular
        // group.
        var sampleItems = [
            //The event will start.
            { group: sampleGroups[0], title: "圣诞节来临", subtitle: "2012-12-25", description: itemDescription, content: itemContent, backgroundImage: '/images/single_event.png' },
            { group: sampleGroups[0], title: "我们的元旦晚会", subtitle: "2013-01-01", description: itemDescription, content: itemContent, backgroundImage: '/images/single_event.png' },
            { group: sampleGroups[0], title: "春节", subtitle: "2013-01-01", description: itemDescription, content: itemContent, backgroundImage: '/images/single_event.png' },
            { group: sampleGroups[0], title: "我的生日晚会", subtitle: "2013-01-01", description: itemDescription, content: itemContent, backgroundImage: '/images/single_event.png' },
            { group: sampleGroups[0], title: "公司年会", subtitle: "2013-01-01", description: itemDescription, content: itemContent, backgroundImage: '/images/single_event.png' },

            //The event have been end.
            { group: sampleGroups[1], title: "感恩节", subtitle: "2013-02-01", description: itemDescription, content: itemContent, backgroundImage: 'images/single_event_end.png' },
            { group: sampleGroups[1], title: "中秋节", subtitle: "2013-03-01", description: itemDescription, content: itemContent, backgroundImage: 'images/single_event_end.png' },
            { group: sampleGroups[1], title: "这是一个测试", subtitle: "2013-01-01", description: itemDescription, content: itemContent, backgroundImage: 'images/single_event_end.png' }
        ];



    }

    //readEventsData();
})();
