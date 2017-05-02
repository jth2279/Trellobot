/**
 * Created by Anirudha Simha on 4/10/2017.
 */

//TRELLO_APP_KEY = '1e00ede875c248e976fb967b8494e563';
//TRELLO_TOKEN_KEY = '184c9ea4e02b7e929d3b49dd5e7ceb60be89bb809027db1620d1edf0a7ee1202';
BASE_URL = "https://api.trello.com/1";

var fs = require("./node_modules/file-system");
// Synchronous read
var passwords = fs.readFileSync('passwords.json');
passwords = JSON.parse(passwords);


var controller = require('./node_modules/botkit').slackbot({
    // interactive replies lets you make buttons
    interactive_replies: true,

    // Send outgoing messages via the RTM instead of using
    // Slack's RESTful API which supports more features
    send_via_rtm:true,

    // Require Delivery Confirmation for RTM Messages, useful for sending
    // many messages or if they have images or etc.
    // send_via_rtm must be TRUE for this to work
    require_delivery: true,

    debug: false
});
var request = require("./node_modules/request");

var bot = controller.spawn({
    token: require("./properties.json").slack_token
}).startRTM(function(err, bot, payload) {
    if (err) {
        throw new Error('Could not connect to Slack');
    }
});

function getPasses(ID)
{
    return passwords[ID]
}

//Post a new board
//Usage: ADDTRELLO <appkey> <tokenkey>
controller.hears([/ADDTRELLO (.+)/i], ['direct_message'], function (bot, message) {
    var splitMessage = message.match[1].split(" ");
    if (splitMessage.length === 2) {
        passwords[message.user] = {appkey : splitMessage[0], tokenkey : splitMessage[1]};
    }
    var json = JSON.stringify(passwords);
    fs.writeFile('passwords.json', json);

    bot.reply(message,"Stored sucessfully", null, 4);
});

//get member from username
//Usage: GET MEMBER <username>
//Optional: [NOTIFICATIONS, ORGANIZATIONS, ACTIONS]
controller.hears([/GET MEMBER (.+)/i], ['direct_message', 'direct_mention'], function (bot, message) {
    var passes = getPasses(message.user);
    if (!(message.user in passwords))
    {
        bot.reply(message, "Add appkey and tokenkey to passwords", null, 4);
    }
    else {
        var TRELLO_APP_KEY = passes["appkey"];
        var TRELLO_TOKEN_KEY = passes["tokenkey"];
        var splitMessage = message.match[1].split(" ");
        console.log(splitMessage);
        if (splitMessage.length === 1) {
            request.get(BASE_URL + "/members/" + message.match[1] + "?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY, function (error, response, body) {
                bot.reply(message, "Member " + message.match[1] + " ID is " + JSON.stringify(JSON.parse(response.body).id, null, 4));
            });
        }
        else if (splitMessage.length === 2) {
            if (splitMessage[1].toUpperCase() === "NOTIFICATIONS") {
                request.get(BASE_URL + "/members/" + splitMessage[0] + "/notifications?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY, function (error, response, body) {
                    bot.reply(message, "Notifications for " + splitMessage[0] + " : " + JSON.stringify(JSON.parse(response.body), null, 4));
                });
            }
            else if (splitMessage[1].toUpperCase() === "ORGANIZATION") {
                request.get(BASE_URL + "/members/" + splitMessage[0] + "/organizations?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY, function (error, response, body) {
                    bot.reply(message, "Organizations for " + splitMessage[0] + " : " + JSON.stringify(JSON.parse(response.body), null, 4));
                });
            }
            else if (splitMessage[1].toUpperCase() === "ACTIONS") {
                request.get(BASE_URL + "/members/" + splitMessage[0] + "/actions?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY, function (error, response, body) {
                    bot.reply(message, "Actions for " + splitMessage[0] + " : " + JSON.stringify(JSON.parse(response.body), null, 4));
                });
            }
        }
        else {
            console.log("Nothing")
        }
    }
});

//Post a new board
//Usage: POST BOARD "string"
//Optional: <boardId> LIST <name>
controller.hears([/POST BOARD (.+)/i], ['direct_message', 'direct_mention'], function (bot, message) {
    var passes = getPasses(message.user);

    if (!(message.user in passwords))
    {
        bot.reply(message, "Add appkey and tokenkey to passwords", null, 4);
    }
    else {
        var TRELLO_APP_KEY = passes["appkey"];
        var TRELLO_TOKEN_KEY = passes["tokenkey"];
        var splitMessage = message.match[1].split(" ");
        console.log(splitMessage);
        if (splitMessage.length === 0) {
            request.post(BASE_URL + "/boards" + "?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY + "&name=newTestBoard&prefs_permissionLevel=public", function (error, response, body) {
                bot.reply(message, "Board created with ID: " + JSON.stringify(JSON.parse(response.body).id, null, 4));
            });
        }
        else if (splitMessage.length === 1) {
            request.post(BASE_URL + "/boards" + "?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY + "&name=" + splitMessage[0] + "&prefs_permissionLevel=public", function (error, response, body) {
                bot.reply(message, "Board created with ID: " + JSON.stringify(JSON.parse(response.body).id, null, 4));
            });
        }
        else if (splitMessage.length === 3) {
            if (splitMessage[1].toUpperCase() === "LIST") {
                request.post(BASE_URL + "/boards/" + splitMessage[0] + "/lists" + "?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY + "&name=" + splitMessage[2], function (error, response, body) {
                    bot.reply(message, "List created with ID: " + JSON.stringify(JSON.parse(response.body).id, null, 4));
                });
            }
        }
    }
});

//Get board information
//Usage: GET BOARD <boardId>
//Usage: GET BOARD <boardId> [LISTS, CARDS, MEMBERS, ACTIONS]
controller.hears([/GET BOARD (.+)/i], ['direct_message', 'direct_mention'], function (bot, message) {
    var passes = getPasses(message.user);
    if (!(message.user in passwords))
    {
        bot.reply(message, "Add appkey and tokenkey to passwords", null, 4);
    }
    else {
        var TRELLO_APP_KEY = passes["appkey"];
        var TRELLO_TOKEN_KEY = passes["tokenkey"];
        var splitMessage = message.match[1].split(" ");
        console.log(splitMessage);
        if (splitMessage.length === 1) {
            request.get(BASE_URL + "/boards/" + splitMessage[0] + "?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY, function (error, response, body) {
                bot.reply(message, JSON.stringify(JSON.parse(response.body), null, 4));
            });
        }
        else if (splitMessage.length === 2) {
            if (splitMessage[1].toUpperCase() === "LISTS") {
                request.get(BASE_URL + "/boards/" + splitMessage[0] + "/lists?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY, function (error, response, body) {
                    bot.reply(message, JSON.stringify(JSON.parse(response.body), null, 4));
                });
            }
            else if (splitMessage[1].toUpperCase() === "CARDS") {
                request.get(BASE_URL + "/boards/" + splitMessage[0] + "/lists?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY, function (error, response, body) {
                    bot.reply(message, JSON.stringify(JSON.parse(response.body), null, 4));
                });
            }
            else if (splitMessage[1].toUpperCase() === "MEMBERS") {
                request.get(BASE_URL + "/boards/" + splitMessage[0] + "/members?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY, function (error, response, body) {
                    bot.reply(message, JSON.stringify(JSON.parse(response.body), null, 4));
                });
            }
            else if (splitMessage[1].toUpperCase() === "ACTIONS") {
                request.get(BASE_URL + "/boards/" + splitMessage[0] + "/actions?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY, function (error, response, body) {
                    bot.reply(message, JSON.stringify(JSON.parse(response.body), null, 4));
                });
            }
            else if (splitMessage[1].toUpperCase() === "CHECKLISTS") {
                request.get(BASE_URL + "/boards/" + splitMessage[0] + "/checklists?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY, function (error, response, body) {
                    bot.reply(message, JSON.stringify(JSON.parse(response.body), null, 4));
                });
            }
        }
        else {
            console.log("Nothing")
        }
    }
});

//Put new information into the board
//Usage: PUT BOARD <boardId> [closed, name]
controller.hears([/PUT BOARD (.+)/i], ['direct_message', 'direct_mention'], function (bot, message) {
    var passes = getPasses(message.user);
    if (!(message.user in passwords))
    {
        bot.reply(message, "Add appkey and tokenkey to passwords", null, 4);
    }
    var TRELLO_APP_KEY = passes["appkey"];
    var TRELLO_TOKEN_KEY = passes["tokenkey"];
    var splitMessage = message.match[1].split(" ");
    console.log(splitMessage);
    if (splitMessage.length === 1)
    {
        bot.reply(message, "No command for board " + splitMessage[0], null, 4);
    }
    else if (splitMessage.length === 2) {
        if (splitMessage[1].toUpperCase() === "CLOSED") {
            request.put(BASE_URL + "/boards/" + splitMessage[0] + "/closed?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY + "&value=true", function (error, response, body) {
                if (response.statusCode === 200)
                    bot.reply(message, "Board " + splitMessage[0] + " closed", null, 4);
                else {
                    bot.reply(message, "Cannot close board - Error " + JSON.stringify(response.statusCode), null, 4);

                }
            });
        }
    }
    else if (splitMessage.length === 3)
        if (splitMessage[1].toUpperCase() === "NAME")
        {
            request.put(BASE_URL + "/boards/" + splitMessage[0] + "/name?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY + "&value=" + splitMessage[2], function (error, response, body) {
                if (response.statusCode === 200)
                    bot.reply(message, "Board " + splitMessage[0] + " name changed", null, 4);
                else {
                    bot.reply(message, "Cannot name board - Error " + JSON.stringify(response.statusCode), null, 4);

                }
            });
        }
    else
    {
        console.log("Nothing")
    }

});

//Post a new card to a list
//Usage: POST CARD <listId>
//Optional: <name>
controller.hears([/POST CARD (.+)/i], ['direct_message', 'direct_mention'], function (bot, message) {
    var passes = getPasses(message.user);
    if (!(message.user in passwords))
    {
        bot.reply(message, "Add appkey and tokenkey to passwords", null, 4);
    }
    var TRELLO_APP_KEY = passes["appkey"];
    var TRELLO_TOKEN_KEY = passes["tokenkey"];
    var splitMessage = message.match[1].split(" ");
    console.log(splitMessage);
    if (splitMessage.length === 0)
    {
        bot.reply(message,"No listID provided", null, 4);
    }
    else if (splitMessage.length === 1)
    {
        request.post(BASE_URL + "/lists/" + splitMessage[0] + "/cards?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY + "&name=newCard", function (error, response, body){
            bot.reply(message,"Card created with ID: " + JSON.stringify(JSON.parse(response.body).id, null, 4));
        });
    }
    else if (splitMessage.length === 2)
    {
        request.post(BASE_URL + "/lists/" + splitMessage[0] + "/cards?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY + "&name=" + splitMessage[1], function (error, response, body){
            bot.reply(message,"Card created with ID: " + JSON.stringify(JSON.parse(response.body).id, null, 4));
        });
    }

});

//Post a new list to a board
//Usage: POST LIST <boardId> "string"
controller.hears([/POST LIST (.+)/i], ['direct_message', 'direct_mention'], function (bot, message) {
    var passes = getPasses(message.user);
    if (!(message.user in passwords))
    {
        bot.reply(message, "Add appkey and tokenkey to passwords", null, 4);
    }
    else {
        var TRELLO_APP_KEY = passes["appkey"];
        var TRELLO_TOKEN_KEY = passes["tokenkey"];
        var splitMessage = message.match[1].split(" ");
        console.log(splitMessage);
        if (splitMessage.length === 1) {
            request.post(BASE_URL + "/lists" + "?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY + "&name=newList&idBoard=" + splitMessage[0], function (error, response, body) {
                bot.reply(message, "List created with ID: " + JSON.stringify(JSON.parse(response.body).id, null, 4));
            });
        }
        else if (splitMessage.length === 2) {
            request.post(BASE_URL + "/lists" + "?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY + "&name=" + splitMessage[1] + "&idBoard=" + splitMessage[0], function (error, response, body) {
                bot.reply(message, "List created with ID: " + JSON.stringify(JSON.parse(response.body).id, null, 4));
            });
        }
    }
});

//Get information from list
//Usage: GET LIST <listId> [ACTIONS, CARDS]
controller.hears([/GET LIST (.+)/i], ['direct_message', 'direct_mention'], function (bot, message) {
    var passes = getPasses(message.user);
    if (!(message.user in passwords))
    {
        bot.reply(message, "Add appkey and tokenkey to passwords", null, 4);
    }
    else {
        var TRELLO_APP_KEY = passes["appkey"];
        var TRELLO_TOKEN_KEY = passes["tokenkey"];
        var splitMessage = message.match[1].split(" ");
        console.log(splitMessage);
        if (splitMessage.length === 1) {
            request.get(BASE_URL + "/lists/" +splitMessage[0] + "?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY, function (error, response, body) {
                bot.reply(message, JSON.stringify(JSON.parse(response.body), null, 4));
            });
        }
        else if (splitMessage.length === 2) {
            if (splitMessage[1].toUpperCase() === "ACTIONS")
            {
                request.get(BASE_URL + "/lists/" + splitMessage[0] + "/actions?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY, function (error, response, body) {
                    bot.reply(message, JSON.stringify(JSON.parse(response.body), null, 4));
                });
            }
            else if (splitMessage[1].toUpperCase() === "CARDS")
            {
                request.get(BASE_URL + "/lists/" + splitMessage[0] + "/cards?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY, function (error, response, body) {
                    bot.reply(message, JSON.stringify(JSON.parse(response.body), null, 4));
                });
            }

        }
    }
});

//Put new information into the list
//Usage: PUT LIST <listId> CLOSED
// PUT LIST <listId> NAME "string"
controller.hears([/PUT LIST (.+)/i], ['direct_message', 'direct_mention'], function (bot, message) {
    var passes = getPasses(message.user);
    if (!(message.user in passwords))
    {
        bot.reply(message, "Add appkey and tokenkey to passwords", null, 4);
    }
    var TRELLO_APP_KEY = passes["appkey"];
    var TRELLO_TOKEN_KEY = passes["tokenkey"];
    var splitMessage = message.match[1].split(" ");
    console.log(splitMessage);
    if (splitMessage.length === 2)
    {
        if (splitMessage[1].toUpperCase() === "CLOSED") {
            request.put(BASE_URL + "/lists/" + splitMessage[0] + "/closed?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY + "&value=true", function (error, response, body) {
                if (response.statusCode === 200)
                    bot.reply(message, "List " + splitMessage[0] + " closed", null, 4);
                else {
                    bot.reply(message, "Cannot close list - Error " + JSON.stringify(response.statusCode), null, 4);

                }
            });
        }

    }
    else if (splitMessage.length === 3) {
        if (splitMessage[1].toUpperCase() === "NAME") {
            request.put(BASE_URL + "/lists/" + splitMessage[0] + "/name?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY + "&value=" + splitMessage[2], function (error, response, body) {
                if (response.statusCode === 200)
                    bot.reply(message, "List name updated", null, 4);
                else {
                    bot.reply(message, "Cannot change name - Error " + JSON.stringify(response.statusCode), null, 4);

                }
            });
        }
    }
    else {
        console.log("Nothing")
    }

});

//Get information from card
//Usage: GET CARD <cardId> [ACTIONS, CHECKLISTS]
controller.hears([/GET CARD (.+)/i], ['direct_message', 'direct_mention'], function (bot, message) {
    var passes = getPasses(message.user);
    if (!(message.user in passwords))
    {
        bot.reply(message, "Add appkey and tokenkey to passwords", null, 4);
    }
    else {
        var TRELLO_APP_KEY = passes["appkey"];
        var TRELLO_TOKEN_KEY = passes["tokenkey"];
        var splitMessage = message.match[1].split(" ");
        console.log(splitMessage);
        if (splitMessage.length === 1) {
            request.get(BASE_URL + "/cards/" +splitMessage[0] + "?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY, function (error, response, body) {
                bot.reply(message, JSON.stringify(JSON.parse(response.body), null, 4));
            });
        }
        else if (splitMessage.length === 2) {
            if (splitMessage[1].toUpperCase() === "ACTIONS")
            {
                request.get(BASE_URL + "/cards/" + splitMessage[0] + "/actions?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY, function (error, response, body) {
                    bot.reply(message, JSON.stringify(JSON.parse(response.body), null, 4));
                });
            }
            else if (splitMessage[1].toUpperCase() === "CHECKLISTS")
            {
                request.get(BASE_URL + "/cards/" + splitMessage[0] + "/checklists?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY, function (error, response, body) {
                    bot.reply(message, JSON.stringify(JSON.parse(response.body), null, 4));
                });
            }

        }
    }
});

//Put new information into the card
//Usage: PUT CARD <cardId> CLOSED
// PUT CARD <cardId> NAME "string"
controller.hears([/PUT CARD (.+)/i], ['direct_message', 'direct_mention'], function (bot, message) {
    var passes = getPasses(message.user);
    if (!(message.user in passwords))
    {
        bot.reply(message, "Add appkey and tokenkey to passwords", null, 4);
    }
    var TRELLO_APP_KEY = passes["appkey"];
    var TRELLO_TOKEN_KEY = passes["tokenkey"];
    var splitMessage = message.match[1].split(" ");
    console.log(splitMessage);
    if (splitMessage.length === 2)
    {
        if (splitMessage[1].toUpperCase() === "CLOSED") {
            request.put(BASE_URL + "/cards/" + splitMessage[0] + "/closed?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY + "&value=true", function (error, response, body) {
                if (response.statusCode === 200)
                    bot.reply(message, "Card " + splitMessage[0] + " closed", null, 4);
                else {
                    bot.reply(message, "Cannot close card - Error " + JSON.stringify(response.statusCode), null, 4);

                }
            });
        }

    }
    else if (splitMessage.length === 3) {
        if (splitMessage[1].toUpperCase() === "NAME") {
            request.put(BASE_URL + "/cards/" + splitMessage[0] + "/name?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY + "&value=" + splitMessage[2], function (error, response, body) {
                if (response.statusCode === 200)
                    bot.reply(message, "Card name updated", null, 4);
                else {
                    bot.reply(message, "Cannot change name - Error " + JSON.stringify(response.statusCode), null, 4);

                }
            });
        }
    }
    else {
        console.log("Nothing")
    }

});

//Post a new checklist to a card
//Usage: POST CHECKLIST <cardId> "string"
controller.hears([/POST CHECKLIST (.+)/i], ['direct_message', 'direct_mention'], function (bot, message) {
    var passes = getPasses(message.user);
    if (!(message.user in passwords))
    {
        bot.reply(message, "Add appkey and tokenkey to passwords", null, 4);
    }
    else {
        var TRELLO_APP_KEY = passes["appkey"];
        var TRELLO_TOKEN_KEY = passes["tokenkey"];
        var splitMessage = message.match[1].split(" ");
        console.log(splitMessage);
        if (splitMessage.length === 1) {
            request.post(BASE_URL + "/checklists" + "?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY + "&name=newChecklist&idCard=" + splitMessage[0], function (error, response, body) {
                bot.reply(message, "Checklist created with ID: " + JSON.stringify(JSON.parse(response.body).id, null, 4));
            });
        }
        else if (splitMessage.length === 2) {
            request.post(BASE_URL + "/checklists" + "?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY + "&name=" + splitMessage[1] + "&idCard=" + splitMessage[0], function (error, response, body) {
                bot.reply(message, "Checklist created with ID: " + JSON.stringify(JSON.parse(response.body).id, null, 4));
            });
        }
    }
});

//Post a new item to a checklist
//Usage: POST CHECKITEM <checklistId> "string"
controller.hears([/POST CHECKITEM (.+)/i], ['direct_message', 'direct_mention'], function (bot, message) {
    var passes = getPasses(message.user);
    if (!(message.user in passwords))
    {
        bot.reply(message, "Add appkey and tokenkey to passwords", null, 4);
    }
    else {
        var TRELLO_APP_KEY = passes["appkey"];
        var TRELLO_TOKEN_KEY = passes["tokenkey"];
        var splitMessage = message.match[1].split(" ");
        console.log(splitMessage);
        if (splitMessage.length === 2) {
            request.post(BASE_URL + "/checklists/" + splitMessage[0] + "/checkItems?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY + "&name=" + splitMessage[1], function (error, response, body) {
                bot.reply(message, "Checkitem created with ID: " + JSON.stringify(JSON.parse(response.body).id, null, 4));
            });
        }
        else {
            bot.reply(message, "Invalid input...", null, 4);
        }
    }
});

//Get information from checklist
//Usage: GET CHECKLIST <checklistId> CHECKITEMS
controller.hears([/GET CHECKLIST (.+)/i], ['direct_message', 'direct_mention'], function (bot, message) {
    var passes = getPasses(message.user);
    if (!(message.user in passwords))
    {
        bot.reply(message, "Add appkey and tokenkey to passwords", null, 4);
    }
    else {
        var TRELLO_APP_KEY = passes["appkey"];
        var TRELLO_TOKEN_KEY = passes["tokenkey"];
        var splitMessage = message.match[1].split(" ");
        console.log(splitMessage);
        if (splitMessage.length === 1) {
            request.get(BASE_URL + "/checklists/" +splitMessage[0] + "?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY, function (error, response, body) {
                bot.reply(message, JSON.stringify(JSON.parse(response.body), null, 4));
            });
        }
        else if (splitMessage.length === 2) {
            if (splitMessage[1].toUpperCase() === "CHECKITEMS")
            {
                request.get(BASE_URL + "/checklists/" + splitMessage[0] + "/checkitems?key=" + TRELLO_APP_KEY + "&token=" + TRELLO_TOKEN_KEY, function (error, response, body) {
                    bot.reply(message, JSON.stringify(JSON.parse(response.body), null, 4));
                });
            }

        }
        else {
            bot.reply(message, "Incorrect input...", null, 4);
        }
    }
});