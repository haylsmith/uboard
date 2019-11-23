'use strict';


//-------External Libraries----------//
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var robot = require('robotjs');
var config = require('./public/js/config.js');
var url = require("opn");
var fs = require("fs");
var readline = require("readline");
var exec = require('child_process').exec, child;
var math = require('mathjs');
var brightness = require('brightness');
config.passcode = '';

//---------GLOBAL STATE VARIABLES ----// 
var screenWidth = 1440;
var screenHeight = 900;
var adjustment = 2;
var mouse = null;
var newX = null;
var newY = null;
var currentVolume = 0.5;

var screenSize = robot.getScreenSize();
screenWidth = screenSize.width;
screenHeight = screenSize.height;
var currentBrightness = null;

//-------WEB SERVER FUNCTIONALITY -------// 
//Purpose: Sends client information when making http request to main entrypoint
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/client.html');
});


//Purpose: use the public directory to send information
app.use('/public', express.static('public'));

//Purpose: Lets the webserver listen for requests on port 8000
var PORT = 8000;
http.listen(PORT, function() {
  console.log('listening on *:' + PORT);
});


//-------MOBILE MOUSE FUNCTIONALITY -------// 

//General Connection Configuration
io.on('connection', function(socket) {
  socket.broadcast.emit('hi');
  socket.emit("CheckSessionID", {})

  socket.on("SessionID", function(pos) {
    if (pos.id === -1) {
      var clientSessionID = math.floor(math.random() * 100);
      socket.emit("UpdateSessionID", {"id": clientSessionID});
      console.log("New Connection");
      sendKeyboards(socket);

    }
    else {
      console.log("Old Connection");
    }
  });

  brightness.get().then(level => {
    currentBrightness = level;
    console.log("current brightness is " + currentBrightness);
    socket.emit("defaultBrightness", {brightness: currentBrightness});
  });

  socket.on('disconnect', function() {
    console.log('user disconnected');
  });


  //Keyboard Functionality
  socket.on('string', function(pos) {
    console.log(config.passcode)
    if (pos.pw || config.passcode) {
      if (config.passcode !== pos.pw) { //Password Checker
        return;
      }
    }

    console.log("Trying to type")
    console.log(pos.str.text);
    if(pos.str.text.length === 1 && pos.str.modifier != "None"){
      robot.keyTap(pos.str.text, pos.str.modifier)
    }
    else{
      robot.typeString(pos.str.text);
    }
  });
 

  socket.on('functionality', function(pos) {
    if (pos.pw || config.passcode) {
      if (config.passcode !== pos.pw) { //Password Checker
        return;
      }
    }
    var type = pos.type
    console.log(type);
    switch (type) {
      case 'backspace':
        robot.keyTap('backspace');
        break;
      case 'enter':
        robot.keyTap('enter');
        break;
      case 'ArrowUp':
        robot.keyTap('up');
        break;
      case 'ArrowDown':
        robot.keyTap('down');
        break;
      case 'ArrowLeft':
        robot.keyTap('left');
        break;
      case 'ArrowRight':
        robot.keyTap('right');
        break;
      case 'space':
        robot.keyTap('space');
        break;
    }
  });   
  
  socket.on('text', function(pos) {
    if (pos.pw || config.passcode) {
      if (config.passcode !== pos.pw) { //Password Checker
        return;
      }
    }

    console.log('Typing ' + pos.text);
    robot.typeString(pos.text);
  });

  socket.on('saveKey', function(key) {
    if (key.pw || config.passcode) {
      if (config.passcode !== key.pw) { //Password Checker
        console.log(config.passcode)
        console.log(key.pw)
        return;
      }
    }

    console.log(key.index.toString())
    var file = fs.readFileSync("./custom_configs/custom" + key.index + ".json")  
    var configuration = JSON.parse(file)
    configuration[key.id] = [key.val, key.x, key.y, key.altText];
    fs.writeFile("./custom_configs/custom" + key.index.toString() + ".json", JSON.stringify(configuration, null, 4), 'utf8', error=>{});
  });


 socket.on('savePhrase', function(key) {
    if (key.pw || config.passcode) {
      if (config.passcode !== key.pw) { //Password Checker
        console.log(config.passcode)
        console.log(key.pw)
        return;
      }
    }

    console.log("Adding " + key.text.toString())
    var file = fs.readFileSync("phrase.json")
    var configuration = JSON.parse(file)
    configuration[key.id] = key.text;
    fs.writeFile("phrase.json", JSON.stringify(configuration, null, 4), 'utf8', error=>{});
  });

  socket.on('deletePhrase', function(key) {
    if (key.pw || config.passcode) {
      if (config.passcode !== key.pw) { //Password Checker
        console.log(config.passcode)
        console.log(key.pw)
        return;
      }
    }

    console.log("Deleting " + key.text.toString())
    var file = fs.readFileSync("phrase.json")
    var configuration = JSON.parse(file);
    console.log(configuration);
    delete configuration[key.id];
    console.log(configuration);
    fs.writeFile("phrase.json", JSON.stringify(configuration, null, 4), 'utf8', error=>{});
  });

  socket.on('newBoard', function(key) {
    fs.appendFile('./custom_configs/order', 'custom'+key.id+'.json\n', function(err, result) {
      if(err) console.log('error', err);
    });
    fs.writeFile('./custom_configs/custom'+key.id+'.json', JSON.stringify({}, null, 4), 'utf8', error=>{})
  });

  socket.on('deleteBoard', function(key) {
    fs.readFile('./custom_configs/order', 'utf8', function(err, data)
    {
        var linesExceptDel = data.split('\n');
        var findline = linesExceptDel.findIndex(function(ele){
          return ele == 'custom' + key.id + '.json'
        })
        var begin = linesExceptDel.slice(0,findline).join('\n')
        var end = linesExceptDel.slice(findline+1).join('\n')
        console.log(begin)
        console.log(end)
        begin = begin + end
        fs.writeFile('./custom_configs/order', begin)
    });
  });

  socket.on('url', function(pos) {
    if (pos.pw || config.passcode) {
      if (config.passcode !== pos.pw) { //Password Checker
        return;
      }
    }

    console.log("Trying to open url")
    console.log(pos.str)
    url(pos.str)
  });



  socket.on('app', function(pos) {
    if (pos.pw || config.passcode) {
      if (config.passcode !== pos.pw) { //Password Checker
        return;
      }
    }

    console.log("Trying to open app")
    console.log(pos.str)
    var my_cmd = sh(pos.str)
    my_cmd.catch(function(error) {
      console.log(error)
    })
  });

  socket.on('brightness', function(pos) {
    if (pos.pw || config.passcode) {
      if (config.passcode !== pos.pw) { //Password Checker
        return;
      }
    }
    console.log("brightness level is " + pos.lvl);
    var newSetLevel = parseFloat(pos.lvl);
    brightness.set(newSetLevel).then(() => {
      console.log('Changed brightness');
    });
    currentBrightness = newSetLevel;
  });

  socket.on('volume', function(pos) {
    if (pos.pw || config.passcode) {
      if (config.passcode !== pos.pw) { //Password Checker
        return;
      }
    }
    console.log("new volume is " + pos.newVol);
    var changeInVol = parseFloat(pos.newVol) - currentVolume;
    if (changeInVol < 0) {
      var notchesDown = Math.abs(changeInVol / 0.0625);
      var i = 0;
      while (i < notchesDown) {
        robot.keyTap("audio_vol_down");
        ++i;
      }
      currentVolume = currentVolume - Math.abs(changeInVol);
    }
    else {
      var notchesUp = Math.abs(changeInVol / 0.0625)
      var i = 0;
      while (i < notchesUp) {
        robot.keyTap("audio_vol_up");
        ++i;
      }
      currentVolume = currentVolume + Math.abs(changeInVol);
    }
    console.log("volume set");
  });

  socket.on('mute', function() {
    console.log("volume muted");
    robot.keyTap("audio_mute");
  });



  //Mouse Functionality
  socket.on('mouse', function(pos) {
    if (pos.pw || config.passcode) {
      if (config.passcode !== pos.pw) { //Password Checker
        return;
      }
    }
    if (pos.cmd == 'move')  {
      mouse = robot.getMousePos(); //Get mouse state
      newX = mouse.x + pos.x * adjustment;
      newY = mouse.y + pos.y * adjustment;
      robot.moveMouse(newX, newY);
      mouse = robot.getMousePos(); //Update mouse state
    }
    else if (pos.cmd == 'scroll'){
      mouse = robot.getMousePos(); //Get mouse state
      robot.scrollMouse(pos.x*5, pos.y*5);
      mouse = robot.getMousePos(); //Update mouse state
    }
    else if (pos.cmd == 'drag') {
      mouse = robot.getMousePos(); //Get mouse state
      newX = mouse.x + pos.x * adjustment;
      newY = mouse.y + pos.y * adjustment;
      robot.dragMouse(newX, newY);
      mouse = robot.getMousePos(); //Update mouse state
    } 
    else if (pos.cmd == 'click') {
      robot.mouseClick();
    } else if (pos.cmd == 'rightclick') {
      robot.mouseClick('right');
    } else if (pos.cmd == 'scrollstart') {
      //robot.mouseToggle('down', 'middle');
    } else if (pos.cmd == 'scrollend') {
      //robot.mouseToggle('up', 'middle');
    } else if (pos.cmd == 'dragstart') {
      robot.mouseToggle('down', 'left');
    } else if (pos.cmd == 'dragend') {
      robot.mouseToggle('up', 'left');
    } else if (pos.cmd == 'right') {
      robot.keyTap("right");
    } else if (pos.cmd == 'left') {
      robot.keyTap("left");
    } else if (pos.cmd == 'doubleclick') {
      robot.mouseClick("left",true);
    }
  });
});


  
async function sh(cmd) {
  return new Promise(function (resolve, reject) {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.log(err)
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}



//This function sends all the saved information to the mobile app
function sendKeyboards(socket) {

  //Load default keyboard
  var file = fs.readFileSync("default_configuration.json")  
  var content = JSON.parse(file)
  socket.emit('updateKeys', content);

  content = []
  //Load default numpad
  var file = fs.readFileSync("phrase.json")  
  var content = JSON.parse(file)

  var keys = []
  var phrases = []

  for (var key in content) {
    keys.push(key)
    phrases.push(content[key]);
  }
  socket.emit('updatePhrases', {p: phrases, k: keys});


   
  content = []
  //Load default urls
  var file = fs.readFileSync("url.json")  
  content = JSON.parse(file)
  
  var keys = []
  var img_urls = []
  var xpos = []
  var ypos = []
  
  for (var key in content) {
    keys.push(content[key][0]);
    img_urls.push(content[key][1]);
    xpos.push(content[key][2]);
    ypos.push(content[key][3]);
  }
  socket.emit('updateUrls', {k: keys, img:img_urls, x: xpos, y: ypos});


  //Load default apps
  var file = fs.readFileSync("apps.json")  
  content = JSON.parse(file)
  
  var keys = []
  var xpos = []
  var ypos = []
  var names = []
  var img_urls = []
  
  for (var key in content) {
    keys.push(content[key][0]);
    names.push(content[key][3]);
    xpos.push(content[key][1]);
    ypos.push(content[key][2]);
    img_urls.push(content[key][4]);
  }
  socket.emit('updateApps', {k: keys, img:img_urls, x: xpos, y: ypos, n: names});

  // //Load custom keyboards
  // var lineReader = require('readline').createInterface({
  //   input: require('fs').createReadStream('./custom_configs/order')
  // });

  // lineReader.on('line', function (line) {
  //   var file = fs.readFileSync('./custom_configs/'+line)  
  //   content = JSON.parse(file)
  //     var keys = []
  //     var xpos = []
  //     var ypos = []
  //     var altText = []

      
  //     for (var key in content) {
  //       keys.push(content[key][0]);
  //       xpos.push(content[key][1]);
  //       ypos.push(content[key][2]);
  //       altText.push(content[key][3]);
  //     }
  //     socket.emit('updateCustom', {fname: line.slice(6,-5), k: keys, x: xpos, y: ypos, altText:altText});
  //   });

}


