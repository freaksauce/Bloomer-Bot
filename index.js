var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');


var techNews = [{
  title: "rift",
  subtitle: "Next-generation virtual reality",
  item_url: "https://www.oculus.com/en-us/rift/",
  image_url: "http://messengerdemo.parseapp.com/img/rift.png",
  buttons: [{
    type: "web_url",
    url: "https://www.oculus.com/en-us/rift/",
    title: "Open Web URL"
  }, {
    type: "postback",
    title: "Call Postback",
    payload: "Payload for first bubble",
  }],
}, {
  title: "touch",
  subtitle: "Your Hands, Now in VR",
  item_url: "https://www.oculus.com/en-us/touch/",
  image_url: "http://messengerdemo.parseapp.com/img/touch.png",
  buttons: [{
    type: "web_url",
    url: "https://www.oculus.com/en-us/touch/",
    title: "Open Web URL"
  }, {
    type: "postback",
    title: "Call Postback",
    payload: "Payload for second bubble",
  }]
}];

var celebNews = [
  {
    title: "Miley Cyrus Confirms Relationship In New Photo",
    subtitle: "Miley Cyrus just made a pretty clear statement about her relationship with Liam Hemsworth",
    item_url: "http://www.newidea.com.au/article/celebrityroyals/miley-cyrus-confirms-relationship-in-new-photo",
    image_url: "http://www.newidea.com.au/media/2942/mileygettyimages-147240663.jpg?width=823",
    buttons: [{
        type: "web_url",
        url: "http://www.newidea.com.au/article/celebrityroyals/miley-cyrus-confirms-relationship-in-new-photo",
        title: "Open Web URL"
    }]
  }, {
    title: "Home And Away: The Morgan Shock Secret Revealed",
    subtitle: "The shocking truth is going to take fans by surprise!",
    item_url: "http://www.newidea.com.au/article/celebrityroyals/home-and-away-the-morgan-shock-secret-revealed",
    image_url: "http://www.newidea.com.au/media/2937/the-morgan-brothers.jpg?width=823",
    buttons: [{
        type: "web_url",
        url: "http://www.newidea.com.au/article/celebrityroyals/home-and-away-the-morgan-shock-secret-revealed",
        title: "Open Web URL"
    }]
  }, {
    title: "Justin Bieber Falls Mid-Performance In Canada",
    subtitle: "Good thing I’m like a cat and landed on my feet.",
    item_url: "http://www.newidea.com.au/article/celebrityroyals/justin-bieber-falls-mid-performance-in-canada",
    image_url: "http://www.newidea.com.au/media/2897/160619_bieber.jpg?width=823",
    buttons: [{
        type: "web_url",
        url: "http://www.newidea.com.au/article/celebrityroyals/justin-bieber-falls-mid-performance-in-canada",
        title: "Open Web URL"
    }]
  }
];

var foodNews = [{
  title: "Beef And Mushroom Pie With Mushy Peas",
  subtitle: "Beefy. Tasty. You'll Love it.",
  item_url: "http://www.newidea.com.au/recipe/food/beef-and-mushroom-pie-with-mushy-peas",
  image_url: "http://www.newidea.com.au/media/2483/ascreen-shot-2016-06-10-at-102821-am-copy.png?width=823",
  buttons: [{
    type: "web_url",
    url: "http://www.newidea.com.au/recipe/food/beef-and-mushroom-pie-with-mushy-peas",
    title: "Open Web URL"
  }, {
    type: "postback",
    title: "Call Postback",
    payload: "Payload for first bubble",
  }],
}, {
  title: "Chicken Pot Pie",
  subtitle: "This is a delicious winter warmer",
  item_url: "http://www.newidea.com.au/recipe/food/chicken-pot-pie",
  image_url: "http://www.newidea.com.au/media/2348/bscreen-shot-2016-06-09-at-103737-am-copy.png?width=823",
  buttons: [{
    type: "web_url",
    url: "http://www.newidea.com.au/recipe/food/chicken-pot-pie",
    title: "Open Web URL"
  }, {
    type: "postback",
    title: "Call Postback",
    payload: "Payload for second bubble",
  }]
}];


app.use(bodyParser.json());

app.set('port', (process.env.PORT || 5000));
app.set('verify_token', (process.env.VERIFY_TOKEN || 'TEST'));
app.set('page_access_token', (process.env.PAGE_ACCESS_TOKEN || 'NULL'));

app.get('/', function (req, res) {
        res.send('It Works! Follow FB Instructions to activate.');
});

app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === app.get('verify_token')) {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Error, wrong validation token');
    }
});

app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
});

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {
    messageText = messageText.toLowerCase();
    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    if (messageText.indexOf('tech') !== -1) {
      sendNews(senderID, techNews);
    }else if (messageText.indexOf('celeb') !== -1) {
      sendNews(senderID, celebNews);
    }else if (messageText.indexOf('food') !== -1) {
      sendNews(senderID, foodNews);
    }else{
      sendTextMessage(senderID, messageText);
    }

  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:app.get('page_access_token')},
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}

function sendNews(recipientId, newsCat) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: newsCat
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendImageMessage(recipientId) {

}

function receivedDeliveryConfirmation(event) {
  console.log('receivedDeliveryConfirmation:',event);
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;
  var userMessage = 'Thanks for the click!';
  // get user info
  // curl -X GET "https://graph.facebook.com/v2.6/1126371067434557?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=EAANw0HcRbFIBAOojD5sMhbyicq9RBgDR16qhYQx0sF4QFvB479TwVDWtsCDtZCo3rZBJIZCmrsMLzZBdt5TnpnpdP5s0A7H34hv0N4LsxE8ZCDxjfsFVOmetImB5K5sUZAgkJFRMYJh0FZBqD7ElCqKbvBWI93EqgUMATkqXZCaJegZDZD"
  request("https://graph.facebook.com/v2.6/"+senderID+"?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=EAANw0HcRbFIBAOojD5sMhbyicq9RBgDR16qhYQx0sF4QFvB479TwVDWtsCDtZCo3rZBJIZCmrsMLzZBdt5TnpnpdP5s0A7H34hv0N4LsxE8ZCDxjfsFVOmetImB5K5sUZAgkJFRMYJh0FZBqD7ElCqKbvBWI93EqgUMATkqXZCaJegZDZD", function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var bodyObj = JSON.parse(body);
      userMessage = 'Thanks '+bodyObj.first_name+' '+bodyObj.last_name;
    } else {
      console.error("Unable to get user info.");
      console.error(response);
      console.error(error);
    }
    // When a postback is called, we'll send a message back to the sender to
    // let them know it was successful
    sendTextMessage(senderID, userMessage);
  })

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback);
}


app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
