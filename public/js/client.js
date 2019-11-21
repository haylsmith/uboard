/* jshint node: true */
/* global io, Hammer, $ */
'use strict';


//-----GLOBAL STATE VARIABLES-----//
var socket = io();
var move = false; //Toggles moving functionality
var updateKey; // Modal overlay
var settingsModal = document.getElementById('myModal');// Modal textbox
var editModal = document.getElementById('edit-modal');// Modal textbox
var inputModal = document.getElementById('inputText');
var altText = document.getElementById('altText');
var newBoardModal = document.getElementById('newBoard-modal');// New Board Naming Modal
var newBoardModalInput = document.getElementById('inputBoardName');// New Board Naming Modal
var keyboardWidth = document.getElementById('textfieldcontainer').offsetWidth;// Width pixel of display
var keyboardHeight = document.getElementById('textfieldcontainer').offsetHeight;// Height pixel of


var singleTap = new Hammer.Tap({event: 'click', pointers: 1});
var doubleTap = new Hammer.Tap({event: 'doubleclick', pointers: 1, taps: 2});
var tripleTap = new Hammer.Tap({event: 'tripleclick', pointers: 1, taps: 3});


//Need to declare these separately because we are assigning different behaviors to single tap for the keys
var singleTap_key = new Hammer.Tap({event: 'click', pointers: 1});
var doubleTap_key = new Hammer.Tap({event: 'doubleclick', pointers: 1, taps: 2});
var singleTap_url = new Hammer.Tap({event: 'click', pointers: 1});
var singleTap_app = new Hammer.Tap({event: 'click', pointers: 1});
var singleTap_phrase = new Hammer.Tap({event: 'click', pointers: 1});

tripleTap.recognizeWith([doubleTap, singleTap]);
doubleTap.recognizeWith(singleTap);
doubleTap.requireFailure(tripleTap);
singleTap.requireFailure([tripleTap, doubleTap]);

var customButtonCounts = {};


var SessionID = -1;

socket.on('CheckSessionID', function(pos) {
  socket.emit("SessionID", {"id": SessionID})
});

socket.on("UpdateSessionID", function(dict) {
  SessionID = dict.id;
  console.log("New ID is" + SessionID.toString())
});

function isUrl(s) {
   var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
   return regexp.test(s);
}

function isApp(s) {
  return s.slice(-4) === ".app"
}


/*
This code controls the navbar and allows users
to swap between views
*/

var swiper = new Swiper('.swiper-container', {
  });
  
swiper.on("transitionStart", function() {
    move = true;
})
swiper.on("transitionEnd", function() {
    move = false;
})
var swiperInner = new Swiper('.swiper-container-inner', {
  direction: 'vertical',
  });

swiper.allowTouchMove = false;
swiperInner.allowTouchMove = false;

var swipeIndex = 0;
$('#s0').css("background-color", "purple")

var mousePos = true;

$('.icon-selection').click(function(e) {switchDisplay(e.currentTarget)});

$('#customSelect').change(function() {
  console.log($('#customSelect option:selected').index())
  swiperInner.slideTo($('#customSelect option:selected').index())
})


function switchDisplay(item) {
  var id = item.id
  if (id == "s1") {
    $('#static_bar').hide()
  }
  else {
    $('#static_bar').show()
  }
  if (id == 'swap') {
    if (mousePos){
      $('#touchpad').insertBefore('.swiper-container');
      mousePos = false;
    } 
    else {
      $('.swiper-container').insertBefore('#touchpad');
      mousePos = true;
    }
    return;
  }

  if (id == 'settings-select') {
    // Bring up setting menu
    settingsModal.style.display = "block";
    if (swiper.activeIndex != 4){
      $('#edit-wrapper').hide();
      $('#add-key').hide();
      $('#delete-keyboard').hide();
    } else{
      $('#edit-wrapper').show();
      $('#add-key').show();
      $('#delete-keyboard').show();
    }
    return;
  }
  if(!move){

    var newId = parseInt(id[1])
    if (newId == swipeIndex) {
      return;
    }
    console.log(newId)
    console.log(swipeIndex)
    $('#s'+swipeIndex.toString()).css("background-color", "black")
    $(item).css("background-color", "purple")
    swipeIndex = newId;
    swiper.slideTo(newId, 200, false);
  }
}


function swipeLeft(event) {
  var page = event.target.id
  console.log("left" + page)
  if (page === 'textfield'){
    switchDisplay(document.getElementById("s1"))
  }
  else if (page === 'ss_elem_list' || page.substring(0, 6) === 'phrase'){
    switchDisplay(document.getElementById("s2"))
  }
  else if (page === 'hotkeys' || page.substring(0, 3) === 'app'
            || page.substring(0, 3) === 'url'){
    switchDisplay(document.getElementById("s3"))
  }
  else if (page === 'functionals'  || page.substring(0, 6) === 'button'){
    switchDisplay(document.getElementById("s4"))
  }
}

function swipeRight(event) {
  var page = event.target.id
  console.log("right" + page)
  if (page === 'ss_elem_list' || page.substring(0, 6) === 'phrase'){
    switchDisplay(document.getElementById("s0"))
  }
  else if (page === 'hotkeys' || page.substring(0, 3) === 'app'
            || page.substring(0, 3) === 'url'){
    switchDisplay(document.getElementById("s1"))
  }
  else if (page === 'functionals'  || page.substring(0, 6) === 'button'){
    switchDisplay(document.getElementById("s2"))
  }
  else if (page.substring(0, 6) === 'custom'){
    switchDisplay(document.getElementById("s3"))
  }
}


var textWrapper = document.getElementById('textfieldcontainer')
var textswipe = new Hammer.Manager(textWrapper);
textswipe.add(new Hammer.Swipe({event: 'swipe', pointers: 1, threshold: 5, direction: Hammer.DIRECTION_HORIZONTAL}));
textswipe.on('swipeleft', swipeLeft);

var phraseWrapper = document.getElementById('ss_elem_list')
var phraseswipe = new Hammer.Manager(phraseWrapper);
phraseswipe.add(new Hammer.Swipe({event: 'swipe', pointers: 1, threshold: 5, direction: Hammer.DIRECTION_HORIZONTAL}));
phraseswipe.on('swipeleft', swipeLeft);
phraseswipe.on('swiperight', swipeRight);

var functionalsWrapper = document.getElementById('functionals')
var keyswipe = new Hammer.Manager(functionalsWrapper);
keyswipe.add(new Hammer.Swipe({event: 'swipe', pointers: 1, threshold: 5, direction: Hammer.DIRECTION_HORIZONTAL}));
keyswipe.on('swipeleft', swipeLeft);keyswipe.on('swiperight', swipeRight);


var hotkeysWrapper = document.getElementById('hotkeys')
var hotswipe = new Hammer.Manager(hotkeysWrapper);
hotswipe.add(new Hammer.Swipe({event: 'swipe', pointers: 1, threshold: 5, direction: Hammer.DIRECTION_HORIZONTAL}));
hotswipe.on('swipeleft', swipeLeft);
hotswipe.on('swiperight', swipeRight);

var customWrapper = document.getElementById('custom')
var customswipe = new Hammer.Manager(customWrapper);
customswipe.add(new Hammer.Swipe({event: 'swipe', pointers: 1, threshold: 5, direction: Hammer.DIRECTION_HORIZONTAL}));
customswipe.on('swiperight', swipeRight);





//-----LOADING KEYBOARDS-----//

function hotkeyStylize(ele, page, id, url){
  ele.css({'max-width': '20%', 'min-width': '20%', 'text-indent': '-9999px', 'text-align': 'left', 'overflow': 'hidden'});
  ele.append('<button class="url-icon" id="url-icon-' + id +'"> </button>')
  var urlIcon = $('#url-icon-' + id)
  if (url == 'https://www.amazon.com') {
     var favicon_url = 'data:image/png;base64,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';
  }
  else if (url == 'https://www.amazon.com/Amazon-Video/b?ie=UTF8&node=2858778011') {
     var favicon_url = 'data:image/jpeg;base64,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';
  }
  else if (url == 'https://www.weebly.com/') {
     var favicon_url = 'data:image/png;base64,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';
  }
  else if (url == 'https://mail.google.com/mail/u/1') {
     var favicon_url = 'data:image/jpeg;base64,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';
  }
  else {
    try { 
      var favicon_url = getFavicon(url);
    }
    catch(err) {
      var favicon_url = '';
    }
  }
  urlIcon.css({position: 'absolute', left: '35%', bottom: '20%', width: '30%', height: '60%', background: 'url(' + favicon_url + ')', 'background-size': 'contain', 'border-radius': '0px', border:'0px', 'background-repeat': 'no-repeat'});
}

function hotkeyDestylize(ele, page, id, url){
  $('#url-icon-' + id).remove();
  ele.css({'max-width': '100%', 'min-width': '1%', width: 'auto', 'text-indent': '0px', 'font-size': '16px'});
}

function altTextStylize(ele,text,id){
  ele.css({'width':'auto','text-indent': '-9999px', 'text-align': 'left', 'overflow': 'hidden','display': 'flex', 'font-size': '0px'});
  ele.append('<button class="alt-button" id="url-icon-' + id +'"> ' + text + '</button>')
}

function addHotkey(xpos, ypos, url, page, id){
  $('#'+page).append('<button class = "draggable activestyle url-button" id='+ id +'>' + url + '</button>');
  var ele = $('#' + id)
  ele.text(url)
  var touchElem = document.getElementById(id);
  var url_tapper = new Hammer.Manager(touchElem);
  url_tapper.add([singleTap_url]);
  url_tapper.on('click', openURL);
  ele.css({position:'absolute', left:xpos + '%', top:ypos + '%', minHeight: (199*.02).toString() + "px", width: '20%'});
  hotkeyStylize(ele, page, id, url)
}

// Adds an application shortcut to the keyboard
function addApp(xpos, ypos, path, name, page, id){
  $('#'+page).append('<button class = "draggable activestyle app-button" id='+ id +' value="' + path + '">' + '</button>');
  var ele = $('#' + id)
  var touchElem = document.getElementById(id);
  var app_tapper = new Hammer.Manager(touchElem);
  app_tapper.add([singleTap_app]);
  app_tapper.on('click', openApp);
  ele.css({position:'absolute', left:xpos + '%', top:ypos + '%', minHeight: (keyboardWidth*.02).toString() + "px", width: '20%'});
  ele.append('<button class="url-icon" id="url-icon-' + id +'"> </button>')
  var urlIcon = $('#url-icon-' + id)
  if (name == 'Notes') {
     var favicon_url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH4wsVFhgE0c7WsgAAClpJREFUeNrtnXtsHMUdxz8zu3s+P2Lfxa+QOA55kzSBBCKRBv6g5Smgaouitn9QBSkR/actfxCkioCAUmjToraqCrSooKoVakUDJY2KUvpIodgkkIdLnIQE8rDTEJzEyV3Oz7vdnf6xd+ZePp8f57s485FGtzczNzv7+85vZ2d2dg80Go3mkkEUotAli6Zx6EiEx76zkFtvqOfYyT4a68q4+qpq/GWSM+cG6e13cF1QgFLK24ijxrzncRy8iH8XAimgwm9QP92Hq6D9SIT/fdrPvNkV7G4P8eDmg1y7tJr3/3txwutkTkQhW391LXsPXuTumxq4ot5PQ60Pq74M6r7FSz962PD7hE8IYQlvfyYIwwtKxK0vAKGy2KmQqKQPoVDxPXttBFzABhwhsA0pYl3dsegDTx6wH3joHlTXIGe7B/n03CAfHI5w75evYN4trRzvGJ9IYz74B9bN5ue/vZk9r3/I4isrqVqxkPde+6C6sbasubLCWGQaYoGUYo5lykYgqJSq9FmyXBrCch1luAoDEHjOIZLqM2mCpOqCEnwmihS4UgrHVSoajaoBoNcwCA1G3bNKcTIWc48ORN2PzoeiHdd86Z1z7uHb1OHjvSy5o4UXnlrK/ZsOTo4gt6wOsOXZFRw72cfKFQFad4Wq5jVVXF9Rbtzu88kbTEMukFJMFwJz1IVPthQJRnmOjLuQ67oq7DiqM2a7ewYGnb99enZwx7Kbpp899J9ulqwK8OD3PuSnLx4vnAlef24ZBz/u5dv3zqbtUF/lVfMr76qqMDb4LPl5wxBVRTJnSeC6xGK229bbZ7/YcWrglWWLyi+8uv0sDXUWN69ry7ucvAXZ/eq1DMYUa76+gJNvn1pVW+N72F8m75RSlBXbGKWEq5QzOOjuuHAx9uTMG9e93bb11/jLJHetb+fYJ/0j/t7IZycfvXkdQgi2vxUylgbVurqA9by/TKwWQplxB9YhHoRQ0jKZV14m7wwd39e/u72nbWaD6W74WiNb/hriYl8sp61H9JDdr16Nv8yg83TUt/qa6gerq8xNhhSVE9KcpjiuqwZ6+pxn9hyIPDWr0RqwbZfP3d2W8zc5PWTrc4vwl0n+0Ro2v3Jz8KGaKuMxQ1Je7FZ4qQQhlGmZrKkNmOzYGW4JVBvuV28N8vK27tELsv6eWnw+g7XfXcriavu+mmnG01qMMZ/Crp89w+qaf9vyPW9tP0F9ULLvUPb+ZNhTltO+koGo4HzYub6xztpimbJp8sbQUw1BzHY/OdMdWxusNt4ts1zM5W1Zc2b1kF8+MpPKcpNTXdHqObN8v/D7xKpit7RLPRiSaabBjP1H+raFIm50bpPF31t7skiXBaUUnF5F94nB+4LV5gtSYk1me5qquC6x82F7fV2T7/c0z0aIrRl5Muay5jRJDm5bRMxW0xfP9d8vhWPpM9XEIAVWVTnr398Z/otvz8XwtGkQiaTmyfAQtX8xLgbdIWdtbcB4WUrhK/aBTCUcV/WfO2+vrZlmvLHvQC9rvtmZki7Tf/CH7RGM5QdFhV/dKYXrQznoMHHBEG55hZ/b/StvYd/haIZgGaes5Qss9v95Tr1lqlXeDLRmovFZ7pq2LVuDa1b4LqSnZQjSWAvRGHMN4TSjijX9OrUxpJpXG+BKyxS5BfnCaj/1QUF3yF0kpVtd7IpPVaQgUO5Xi4PVct/qZX52tg8MpaUI0nnahrkSa789X3x2N08zwQiB9JlqoTFLcOConZKW0qk/umEaouoYAme213/oUIggcBE4zdQe4ycPpd5GSvGQ6TXwp2cCls9UDSin2A1pSuMzaXztZ0FrzgyRMh+fIkhvv4MU+GzHri4r2v3UywPHUTWO4/rCEYYXZNl8CQKfId0qfYVVWKRUVUvmCh/QmxyfIkhTowIwfabrL3aFpzo+k7KmxsxhR0pEd8gGhVlVLk0ptIcUEuUq60LYzZhtTxGkr98FkEplTqloJhZXIXr73Qw7pwgSs10AoVw9Bik0ykXGYiq3II49iFJIpYTUghQWpZAxW8n0jiFFkLp53wAFxnR7EIMB9OxioZCGw2D9vIT5/ziUkCKQ8gaDVwL/BOaiBSkUEjgO3AycEOKzvt3MzAcQXwid50I6zZjIalt9NVViaEFKjKyCKKVUNBp1VZxoNGrr7QnddpVSKm9BQqGQ3draGu3p6bEjkYjT0tIS6+npcSKRSKylpSUaiURiafF2S0tLIv9weWJJeRL5Y5FIxM1Svp1WZrZyEuWnlzmeero56uAOU4ec9cxWh9bW1mg4HLaz2T6lY3n88ccBAlLK+wzDCAQCAWlZljQMQwUCAdOyLGEYBsFg0EyKNxLx8W2ZJY+ZliexnYhPLz9bmenl5F0HKaWKb49UTyNHHUQedcjLVlJKEQwGI6Zp/g4IPfHEE0MapF32KvAue/8NzCn2+XSK0wHcBJwQSfOGulMvMbQgJYYWpMTQgpQYWpASQwtSYmhBSgwtSImhBSkxtCAlhhakxNCClBhylPGaiSOrjVPuqe/duxe8tabbgAb0mwIKhQDOkLauF9IEmTlzJoAFNAOz0KtOCoUE/JD5/H+KIDNmzADwAdcAs4td6ylOHZ6tUxiur9CeUXiy2lh33iWGFqTE0IKUGFqQEkMLUmJoQYpH3isXFXqEPllk2Fnmm1Ez4YzKQzSTQ14eok9Zk0NWO+tOvcTQHlI88vaQxHuENIUlq52zCeLEg6awZLXzcILYIxanGS82eQpiA9ERi9OMl0GyNPyUO4a7du0CsJuamtpN07TQp65CYdi2faCzszO3IJs2bSIcDkc3b97cXlNTU66Ufs9fIRBCGKFQqH3jxo3RQCAwfEalFB0dHSilnleaQvNsV1dX4rnOITL6kObmZoBTxW5FlwEnGxoaMiKHG6mfQA8OC4kDHM2WkCJI0uO5HwMRNIUijGfjZJsDw3vIceBksWs9hekAOrMlDCfIWeD9Ytd6CrMXOJ8tIddCuTeA3P+CqBkLMeBNRnGDKsG/8JTUTCxtwI7hEjMESepkuoHfoOe1JhIHeBGvS8jo0GHkG1Rb8N6/qJkYdgCv5MqQVZAk5ULAD4DTxT6SKUAX8CRwAbJ7B+R3C/edeEEDeeTVZGcAz4Zvj5RxWEHSFPwN8Ay6PxkLNp7tXkhEiBzv1TdzlSSESEx+xYCn49Eb8Z7+0YzMAPBj4IfEhxBihD85GPEvENJmIy1gA/AocEWxj7bE+QT4PvASSeO5cQsCGaIA3Ag8gvdmZjOfMi4jEgO/p4B3kxNGEgPyFCRBmjABYC2ex6wky/Nylxn9wHt444zXSZqczUeIobyj3WsWb6kFvgjcAVyH9wRvDVN/EZ6Ndwl7FNiJ5xWteDO5Q4xGDBiDIAmyCCPwniydAywE5uM9yVuP502VeBcDPrzX08qk/Q/3WWhUjs/EMp0oXuvvxZsQPIM3W3sUOII3Kx5OL3i0QiQbcXxHpEa8j2XiiWDFt42kkCzAZIsxdAjkFsSOhxieODnXGYxViKHfF+QIRxZpSjBe42s0Gs0lzv8BgDlOD5GqaGEAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTktMTEtMjFUMjI6MjM6NTcrMDA6MDCj7eSJAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE5LTExLTIxVDIyOjIzOjU3KzAwOjAw0rBcNQAAACt0RVh0Q29tbWVudABSZXNpemVkIG9uIGh0dHBzOi8vZXpnaWYuY29tL3Jlc2l6ZUJpjS0AAAASdEVYdFNvZnR3YXJlAGV6Z2lmLmNvbaDDs1gAAAAASUVORK5CYII=';
  }
  else if (name == 'iMessage') {
     var favicon_url = 'data:image/png;base64,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';
  }
  urlIcon.css({position: 'absolute', left: '35%', bottom: '20%', width: '30%', height: '60%', background: 'url(' + favicon_url + ')', 'background-size': 'contain', 'border-radius': '0px', border:'0px', 'background-repeat': 'no-repeat'});
  //ele.css({'max-width': '20%', 'min-width': '20%', 'text-indent': '-9999px', 'text-align': 'left', 'overflow': 'hidden'});
}

//Purpose: Receives information from the server to update the presentation of the keys on the client
socket.on('updateUrls', function(newVals) {
  console.log(newVals);
    for (var i = 0; i < newVals.x.length; i++){
      addHotkey(newVals.x[i], newVals.y[i], newVals.k[i], 'hotkeys', 'url-button' + (i+1).toString())
    }
});

//Updates app shortcuts page
socket.on('updateApps', function(newVals) {
  console.log(newVals);
    for (var i = 0; i < newVals.x.length; i++){
      addApp(newVals.x[i], newVals.y[i], newVals.k[i], newVals.n[i], 'hotkeys', 'app-button' + (i+1).toString())
    }
});

//Purpose: Receives information from the server to update the presentation of the keys on the client
socket.on('updateNumPad', function(newVals) {
  console.log(newVals);
    for (var i = 0; i < newVals.x.length; i++){
      if (i <= 10) {
        $('#numpad').append('<button class = "draggable activestyle key-button" value="' + newVals.a[i] + '", id="pad' + (i+1).toString() + '">' + newVals.k[i] + '</button>');
      } else {
        $('#numpad').append('<button class = "draggable activestyle key-button", id="pad' + (i+1).toString() + '">' + newVals.k[i] + '</button>');
      }

      var ele = $('#pad' + (i+1).toString())
      var touchElem = document.getElementById('pad' + (i+1).toString());
      var key_tapper = new Hammer.Manager(touchElem);
      key_tapper.add([singleTap_key]);
      key_tapper.on('click', sendKeyPress);
      ele.css({position:'absolute', left:newVals.x[i] + '%', top:(newVals.y[i]) + '%', minHeight: (keyboardWidth*.02).toString() + "px"});

    }
});


//Purpose: Receives information from the server to update the presentation of the keys on the client
socket.on('updatePhrases', function(newVals) {
  console.log(newVals);
    for (var i = 0; i < newVals.k.length; i++){
      $('#ss_elem_list').append('<li class = "phrase", role="option", id="' + newVals.k[i] + '">' + newVals.p[i] + '</li>');
      var touchElem = document.getElementById(newVals.k[i]);
      var phrase_tapper = new Hammer.Manager(touchElem);
      phrase_tapper.add([singleTap_phrase]);
      phrase_tapper.on('click', selectPhrase);
    }
});


//Purpose: Receives information from the server to update the presentation of the keys on the client
socket.on('updateCustom', function(newVals) {
  console.log(newVals);
  var newSlide ='<div class = "custom swiper-slide swiper-slide-inner" id="custom-' + newVals.fname + '">  </div>';
  $('#customSelect').append('<option class = "select-item" id= "select-' + newVals.fname + '">' + newVals.fname + '</option>')
  swiperInner.appendSlide(newSlide)
  
  for (var i = 0; i < newVals.x.length; i++){
    $('#custom-' + newVals.fname).append('<button class = "custom-key draggable activestyle" id="custom-key-' + newVals.fname + "-" + (i).toString() + '"></button>');
    var ele = $('#custom-key-' + newVals.fname + "-" + (i).toString())
    ele.text(newVals.k[i])

    var touchElem = document.getElementById('custom-' + newVals.fname);
    var key_tapper = new Hammer.Manager(touchElem);
    key_tapper.add([singleTap_key, doubleTap_key]);
    key_tapper.on('click', sendKeyPress);
    key_tapper.on('doubleclick', customDoubleTap)
    ele.css({width:'auto', left:newVals.x[i] + '%', top:(newVals.y[i]) + '%', minHeight: (199*.02).toString() + "px"});
    
    if(!isUrl(newVals.k[i])){
      ele.addClass('key-button')
    } else{
      ele.addClass('url-button')
      hotkeyDestylize(ele, 'custom-' + newVals.fname, 'custom-key-' + newVals.fname + "-" + (i).toString(), newVals.k[i])
      hotkeyStylize(ele, 'custom-' + newVals.fname, 'custom-key-' + newVals.fname + "-" + (i).toString(), newVals.k[i])
    }

    if (newVals.altText[i]){
        hotkeyDestylize(ele, 'custom-' + newVals.fname, 'custom-key-' + newVals.fname + "-" + (i).toString(), newVals.k[i]);
        altTextStylize(ele,newVals.altText[i],'custom-key-' + newVals.fname + "-" + (i).toString());
      }
  }
  customButtonCounts['custom-' + newVals.fname] = newVals.x.length;
  $('#loading').html('');

});



/*
-----------KEYBOARD CONTROLS---------------
The Following Functions Control the KEYBOARD FUNCTIONALITY
*/

var modifier = "None"

//Purpose: Emits the key of keyboard upon click
var emitKey = function(str) {
   pos = {'str':str,'pw':passcode}

    if (move === false){
      socket.emit('string',pos);
      console.log(pos);
    }
};

var emitUrl = function(str) {
  pos = {'str':str,'pw':passcode}
    if (move === false){
      socket.emit('url', pos);
    }
};

var emitApp = function(str) {
  pos = {'str': "open " + str,'pw':passcode}
  if (move === false){
    socket.emit('app', pos)
  }
}

var emitText = function(text) {
  console.log(text)
  pos = {'text':text,'pw':passcode}
  if (move === false){
    socket.emit('text', pos);
  }
}

function emitArrow(entry) {
  pos = {type : entry,'pw':passcode}
  if (move === false){
    socket.emit('functionality', pos);
  }
}


function sendKeyPress (event) {
    var mymodifier = modifier
    if (event.target.id.substring(0, 3) === "pad") {
      mymodifier = "None"
    }
    if (event.target.id.indexOf("url-icon") != -1){
        emitKey({text: $("#" + event.target.id).parent().clone().children().remove().end().text().trim(), modifier: mymodifier})
    }
    else if(event.target.hasChildNodes()){
        emitKey({text: $("#" + event.target.id).clone().children().remove().end().text().trim(), modifier: mymodifier})
    }
    else{
      emitKey({text: event.target.innerText, modifier: mymodifier});
    }
}

function openURL (event) {
    if(event.target.id.indexOf("url-icon") != -1){
      console.log("URL Parent")
      emitUrl($("#" + event.target.id).parent().clone().children().remove().end().text().trim())
    }
    else{
      console.log("URL Error")
      emitUrl($("#" + event.target.id).clone().children().remove().end().text().trim());
    }
}

function openApp (event) {
    emitApp($("#" + event.target.id)[0].value);
}

function selectPhrase (event) {
  var item = document.getElementById(event.target.id)
  setTimeout(function() {$(item).css("background-color", "purple");}, 0);
  var text = event.target.innerText;
    var oldvalue = document.getElementById('textfield').value
    document.getElementById('textfield').value = oldvalue + " " + text
  setTimeout(function() {$(item).css("background-color", "white");}, 100);
}

function addPhrase () {
  var phraseList = document.getElementById("ss_elem_list")
  var newID = "phrase" + (phraseList.childElementCount + 1);
  var text = prompt("Please enter a new phrase.", "");
  $("#ss_elem_list").append('<li class = "phrase", role="option", id="' + newID + '">' + text + '</li>')
  var touchElem = document.getElementById(newID);
  var phrase_tapper = new Hammer.Manager(touchElem);
  phrase_tapper.add([singleTap_phrase]);
  phrase_tapper.on('click', selectPhrase);
  socket.emit('savePhrase', { id: newID, text: text});
}

function deletePhrase() {

}

$( "#textfield" ).keydown(function(event) {
  if (event.key === 'Enter') { // enter
    emitText(document.getElementById('textfield').value);
    event.preventDefault();
    if (document.getElementById('textfield').value === '') {
      socket.emit('functionality', {'pw':passcode, type:'enter'});
    }

    document.getElementById('textfield').value = '';
  }
  else if (event.key === 'Backspace' && document.getElementById('textfield').value === "") { // backspace
    socket.emit('functionality', {'pw':passcode, type:'backspace'});
  }
  else if (event.key.startsWith('Arrow') && document.getElementById('textfield').value === "") { // arrow keys
    socket.emit('functionality', {'pw':passcode, type: event.key});
  }
  else if (event.keyCode === 32 && document.getElementById('textfield').value === '') { // space
    socket.emit('functionality', {'pw':passcode, type: 'Space'});
    document.getElementById('textfield').value = '';    
  }
});


//

function replaceNumkeysDisplay(modifier){
  var myButton = document.getElementById('pad1')
  for (var i = 2; i <= 11; i++) {
    var text = myButton.innerText;
    var alt = myButton.value;
    myButton.innerText = alt;
    myButton.value = text;
    myButton = document.getElementById('pad' + (i).toString());
  }

}


var staticElem = document.getElementsByClassName('static-bar')[0].children;
var singleTap_static = new Hammer.Tap({event: 'click', pointers: 1});
for (var i = 0; i < staticElem.length; i++) {
  var static_tapper = new Hammer.Manager(staticElem[i]);
  static_tapper.add([singleTap_static]);
  static_tapper.on('click', staticKeyPress);

}

//Purpose: Event listener on tapping the keys
function staticKeyPress(event) {
  if (event.target.id === 'go-toggle') { // enter
    socket.emit('functionality', {'pw':passcode, type: 'enter'});
  }
  else if (event.target.id === 'backspace') { // backspace
    socket.emit('functionality', {'pw':passcode, type: 'backspace'});
  }
  else if (event.target.id === 'spacebar') { // backspace
    socket.emit('functionality', {'pw':passcode, type: 'space'});
  }
  else if(event.target.id === 'shift-toggle'){
    if(modifier == 'shift'){
      modifier = 'None'
      $('#shift-toggle').removeClass('static-key-selected')
      $('#shift-toggle').addClass('static-key-default')
    }
    else{
      modifier = 'shift'
      $('#shift-toggle').removeClass('static-key-default')
      $('#shift-toggle').addClass('static-key-selected')
      $('#ctrl-toggle').removeClass('static-key-selected')
      $('#ctrl-toggle').addClass('static-key-default')
    }
    replaceNumkeysDisplay(modifier)
  }
  
  else if(event.target.id === 'ctrl-toggle'){
    if(modifier == 'shift') {
      replaceNumkeysDisplay(modifier)
    }
    if(modifier == 'command'){
      modifier = 'None'
      $('#ctrl-toggle').removeClass('static-key-selected')
      $('#ctrl-toggle').addClass('static-key-default')
    }
    else{
      modifier = 'command'
      $('#ctrl-toggle').removeClass('static-key-default')
      $('#ctrl-toggle').addClass('static-key-selected')
      $('#shift-toggle').removeClass('static-key-selected')
      $('#shift-toggle').addClass('static-key-default')
    }
  }

}


/*
-----------MOUSE CONTROLS---------------
The Following Functions Control the Mouse
*/
var touchElem = document.getElementById('mousepad');
var lcElem = document.getElementById('leftClick');
var scrollElem = document.getElementById('scrollWheel');
var rcElem = document.getElementById('rightClick');

var delta = null;
var moving = false;
var control = 'touch';
var passcode = '';
var pos = {x: 0, y: 0, cmd: null, pw: ''};

//Purpose: Wrapper Function to send information from client to server via socket
var emitMouse = function(x, y, cmd) {
  pos.x = x;
  pos.y = y;
  pos.cmd = cmd;
  pos.pw = passcode;
  socket.emit('mouse', pos);
};

//Purpose: Handles touch movement events from the clients
var handlePan = function(eventName, e) {
  if (e.type == eventName + 'start') {
    delta = null;
    moving = true;
    console.log('start ' + eventName);
    emitMouse(0, 0, eventName + 'start');
  }
  if (e.type == eventName + 'end') {
    delta = null;
    moving = false;
    emitMouse(0, 0, eventName + 'end');
  }
  if (moving && delta != null) {
    emitMouse(e.deltaX - delta.x, e.deltaY - delta.y, eventName);
  }
  delta = {x: e.deltaX, y: e.deltaY};
};

//Purpose: Using Hammer.js library to add different touching functionality
var mc = new Hammer.Manager(touchElem);
var mcRc = new Hammer.Manager(rcElem);
var mcLc = new Hammer.Manager(lcElem);
var mcScroll = new Hammer.Manager(scrollElem);

mc.add(new Hammer.Pan({event: 'move', threshold: 0, pointers: 1, direction: Hammer.DIRECTION_ALL}));
mc.add(new Hammer.Pan({event: 'scroll', threshold: 0, pointers: 2,direction: Hammer.DIRECTION_ALL}));
mcScroll.add(new Hammer.Pan({event: 'scroll', threshold: 0, pointers: 1,direction: Hammer.DIRECTION_ALL}));
mc.add(new Hammer.Pan({event: 'drag', threshold: 0, pointers: 3, direction: Hammer.DIRECTION_ALL}));
mcLc.add(new Hammer.Pan({event: 'drag', threshold: 0, pointers: 1,direction: Hammer.DIRECTION_ALL}));

//Purpose: Tapping functionality
mc.add([tripleTap, doubleTap, singleTap]);
mcLc.add([tripleTap, doubleTap, singleTap]);
mc.add(new Hammer.Tap({event: 'rightclick', pointers: 2}));
mcRc.add(new Hammer.Tap({event: 'rightclick', pointers: 1}));

//Purpose: Using Hammer.js event listeners to trigger functionality by sending data to 
mc.on('movestart moveend moveup movedown moveleft moveright', function(e) {
    handlePan('move', e);
});

mc.on('scrollstart scrollend scrollup scrolldown scrollleft scrollright',
  function(e) {
    handlePan('scroll', e);
});
mcScroll.on('scrollstart scrollend scrollup scrolldown scrollleft scrollright',
  function(e) {
    handlePan('scroll', e);
});

mc.on('dragstart dragend dragup dragdown dragleft dragright', function(e) {
  handlePan('drag', e);
});
mcLc.on('dragstart dragend dragup dragdown dragleft dragright', function(e) {
  handlePan('drag', e);
});
mc.on('click', function(e) {
  console.log('click');
  emitMouse(0, 0, 'click');
});
mcLc.on('click', function(e) {
  console.log('click');
  emitMouse(0, 0, 'click');
});
mc.on('rightclick', function(e) {
  console.info('rightclick');
  emitMouse(0, 0, 'rightclick');
});
mcRc.on('rightclick', function(e) {
  console.info('rightclick');
  emitMouse(0, 0, 'rightclick');
});
mc.on('doubleclick', function(e) {
  console.log('doubleclick');
  emitMouse(0, 0, 'doubleclick');
});
mcLc.on('doubleclick', function(e) {
  console.log('doubleclick');
  emitMouse(0, 0, 'doubleclick');
});


/*
-----------MENU CONTROLS---------------
The Following Functions Control the Main Menu
*/

document.body.requestFullscreen = document.body.requestFullScreen ||
document.body.webkitRequestFullScreen ||
document.body.mozRequestFullScreen ||
document.body.msRequestFullScreen;
document.cancelFullscreen = document.exitFullscreen ||
document.webkitExitFullscreen ||
document.mozCancelFullScreen ||
document.msExitFullscreen;


//PURPOSE: Toggle movement functionality
$('#fullscreen-toggle').click(function() {
  if (this.checked) {
    $('.draggable').hide();
    $('#keyboard').hide();
    $("#touchpad").show();
    //document.body.requestFullscreen();
  } else {
    $('.draggable').show();
    $('#keyboard').show();
    $("#touchpad").hide();
    //document.cancelFullscreen();
  }
});

//PURPOSE: Toggle movement functionality
$('.selection').click(function() {
  if (this.checked) {
    $('.draggable').hide();
    $('#keyboard').hide();
    $("#touchpad").show();
    //document.body.requestFullscreen();
  } else {
    $('.draggable').show();
    $('#keyboard').show();
    $("#touchpad").hide();
    //document.cancelFullscreen();
  }
});

//PURPOSE: Toggle movement functionality
$('#move-toggle').click(function() {
  if (this.checked) {
    move = true; 
  } else {
    move = false;
  }
});

//PURPOSE: If password is set, asks user for password
$('#passcode').click(function() {
  passcode = prompt('Enter a passcode');
});

//PURPOSE: About the project
$('#about').click(function() {
  if (confirm('UBoard: A mobile mouse for Brad')) {
    open('https://github.com/jjlustig/EECS498_uBoard');
  }
});



// --------------FUNCTIONAL BUTTONS------------------
// the following code controls brightness, volume, and arrow keys

$(" #brightness ").on('input', function() {
  var brightnessLvl = document.getElementById("brightness").value;
  socket.emit('brightness', {lvl: brightnessLvl})
});

$(" #volume ").on('input', function() {
  var newVolume = document.getElementById("volume").value;
  socket.emit('volume', {newVol: newVolume})
});

function muteOn() {
  console.log('mute button pressed');
  socket.emit('mute', {});
}


//------------------------------------------------------------
// Controls add, delete, and touch events for custom keyboards
//------------------------------------------------------------

function onendListener (event) { 
        var updateKey = event.target;
        var newX = parseInt(updateKey.style.left) + updateKey.getAttribute('data-x')/199*100
        var newY = parseInt(updateKey.style.top) + updateKey.getAttribute('data-y')/470*100
        newX = parseInt(newX)
        newY = parseInt(newY)
        newX = Math.min(Math.max(0, newX),100).toString()
        newY = Math.min(Math.max(0, newY),100).toString()
        $("#"+updateKey.id).css({'width': 'auto'})
        socket.emit('saveKey', {
          index: $('#customSelect option:selected').attr('id').slice(7),
          id: updateKey.id,
          val: updateKey.innerText,
          altText: altText, 
          x: newX,
          y: newY });
}

var draggableSettings = {
    snap: {
      targets: [
          interact.createSnapGrid({ x: .05*199, y: .1*470 })
        ],
      range: Infinity
    },
    inertia: true,      // enable inertial throwing
    restrict: {
      restriction: "parent", // keep the element within the area of it's parent
      endOnly: true,
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
      autoScroll: true, // enable autoScroll
      onmove: dragMoveListener // call this function on every dragmove event
      //onend: onendListener This is a bit buggy
    };

$('#new-keyboard').click(function() {
  newBoardModal.style.display = "block";
  newBoardModelInput.value = ""
});

$('#newBoard-save').click(function() {

  var newBoardName = newBoardModalInput.value
  if (newBoardName.indexOf(" ") != -1){
    newBoardName = newBoardName.split(' ').join('_')
  }
  if(newBoardModalInput.value === "") {
    return
  }
  newBoardModalInput.value = ""
  var boardIds = $('#customSelect').children()
  console.log(boardIds)
  for(var i = 0; i < boardIds.length; i++){
    console.log(boardIds[i].innerText)
    console.log(newBoardName)
    if (boardIds[i].innerText.trim() === newBoardName.trim()){
      //Should give some warning of there is a match
      console.log("found match")
      console.log(boardIds[i].innerText)
      console.log(newBoardName)
      return
    }
  }


  $('#customSelect').append('<option class = "select-item" id = "select-' + newBoardName + '">' + newBoardName + ' </option>')
  $('#edit-wrapper').show();
  $('#add-key').show();
  $('#delete-keyboard').show();
  var newSlide ='<div class = "custom swiper-slide swiper-slide-inner" id="custom-' + newBoardName + '">  </div>';
  $('#s'+swiper.activeIndex.toString()).css("background-color", "black")
  $('#s4').css("background-color", "purple")
  swiperInner.appendSlide(newSlide)
  swiper.slideTo(4, 200, false);
  console.log(swiperInner)
  console.log(swiperInner.slides.length)
  swiperInner.slideTo(swiperInner.slides.length-1, 200, false);
  customButtonCounts['custom-' + newBoardName] = 0

  socket.emit('newBoard', {
    id: newBoardName});
  $('#select-' + newBoardName).prop("selected", true)
  newBoardModal.style.display = "none";
});


$('#add-key').click(function() {
  var newButtonId = 'custom-key-' + $('#customSelect option:selected').attr('id').slice(7) + "-" + (customButtonCounts['custom-' + $('#customSelect option:selected').attr('id').slice(7)]);
  $('#custom-' + $('#customSelect option:selected').attr('id').slice(7)).append('<button class = "custom-key draggable key-button" id="' + newButtonId + '"></button>');
  if(move == false){
    $('#'+newButtonId).addClass('activestyle');
  }
  var ele = $('#'+newButtonId)
  interact('#'+newButtonId).draggable(draggableSettings);
  customButtonCounts['custom-' + $('#customSelect option:selected').attr('id').slice(7)] += 1;
  ele.text('')
  console.log((199*.02).toString())
  ele.css({position:'absolute', left:'0%', top: '0%', minHeight: (199*.02).toString() + "px"});
  socket.emit('saveKey', {
    index: $('#customSelect option:selected').attr('id').slice(7),
    id: newButtonId,
    val: '', 
    x: "0",
    y: "0" });
  updateKey = ele[0]
  console.log(ele)
  inputModal.value = ''
  editModal.style.display = "block"; 
});

$('#delete-keyboard').click(function() {
  if(swiperInner.slides.length != 0){
    socket.emit('deleteBoard', {
      id: $('#customSelect option:selected').attr('id').slice(7)});
    swiperInner.removeSlide(swiperInner.activeIndex)
    $('#' + $('#customSelect option:selected').attr('id')).remove()
  }
})

$('#edit-toggle').change(function(event) {
  console.log(event.target)
  if(move){
    $('#new-keyboard').show();
    $('#delete-keyboard').show();
    $('.custom').css({'background-color': 'white'});
    $('.custom-key').addClass('activestyle');
    move = false;
  } else{
    $('#new-keyboard').hide();
    $('#delete-keyboard').hide();
    $('.custom').css({'background-color': 'rgba(250,50,50,.5)'});
    $('.custom-key').removeClass('activestyle');
    move = true;
  }
});

$('.close').click(function() {
    settingsModal.style.display = "none";
    newBoardModal.style.display = "none";
});

$('#modal-close').click(function() {
    editModal.style.display = "none";
    newBoardModal.style.display = "none";
});

interact('.custom-key').draggable(draggableSettings);

//Purpose: Uses interact.js library to enable keys to move around
interact('.custom-key').draggable({
    snap: {
      targets: [
          interact.createSnapGrid({ x: .05*199, y: .1*470 })
        ],
      range: Infinity
    },
    inertia: true,      // enable inertial throwing
    restrict: {
      restriction: "parent", // keep the element within the area of it's parent
      endOnly: true,
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
      autoScroll: true, // enable autoScroll
      onmove: dragMoveListener // call this function on every dragmove event
      //onend: onendListener // THIS IS BUGGY, disabling for now
    });

function dragMoveListener (event) {
  if (move === true){
  var target = event.target,
      // keep the dragged position in the data-x/data-y attributes
      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
  // translate the element
  target.style.webkitTransform =
  target.style.transform =
    'translate(' + x + 'px, ' + y + 'px)';
  // update the posiion attributes
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
  }
}


//Purpose: Updates button with textbox value
$('#modal-save').click(function() {
  var newX = parseInt(updateKey.style.left) + updateKey.getAttribute('data-x')/199*100
  var newY = parseInt(updateKey.style.top) + updateKey.getAttribute('data-y')/470*100
  newX = parseInt(newX)
  newY = parseInt(newY)
  newX = Math.min(Math.max(0, newX),100).toString()
  newY = Math.min(Math.max(0, newY),100).toString()
  console.log(newX, newY)
  updateKey.innerText = inputModal.value;
  var ele = $("#"+updateKey.id);
  console.log(updateKey)
  console.log(updateKey.innerText)
  console.log(inputModal.value)
  console.log($("#"+updateKey.id).clone().children().remove().end().text())
  if(isUrl(inputModal.value)) {
    ele.addClass('url-button')
    ele.removeClass('key-button')
    hotkeyDestylize(ele, 'custom-' + $('#customSelect option:selected').attr('id').slice(7), updateKey.id, updateKey.innerText)
    if (altText.value){
      console.log("Alt text dectected");
      altTextStylize(ele,altText.value,updateKey.id);
    }
    else{
      hotkeyStylize(ele, 'custom-' + swiperInner.activeIndex.toString(), updateKey.id, updateKey.innerText)
    }
  } 
  else if(isApp(inputModal.value)) {
    ele.addClass('app-button')
    ele.removeClass('url-button')
    //hotkeyDestylize(ele, 'custom-' + $('#customSelect option:selected').attr('id').slice(7), updateKey.id, inputModal.value)
    if (altText.value){
      console.log("Alt text dectected");
      altTextStylize(ele,altText.value,updateKey.id);
    }
  } else{
    ele.addClass('key-button')
    ele.removeClass('url-button')
    hotkeyDestylize(ele, 'custom-' + $('#customSelect option:selected').attr('id').slice(7), updateKey.id, inputModal.value)
    if (altText.value){
      console.log("Alt text dectected");
      altTextStylize(ele,altText.value,updateKey.id);
    }
  }
  var inner_text = $("#"+updateKey.id).clone().children().remove().end().text();
  var alt_text = "";
  if (altText.value){
    alt_text = altText.value;
  }

  $("#"+updateKey.id).css({'width': 'auto'})
  socket.emit('saveKey', {
    index: $('#customSelect option:selected').attr('id').slice(7),
    id: updateKey.id,
    val: inner_text, 
    altText: alt_text,
    x: newX,
    y: newY, 
    pw:passcode});
  console.log(updateKey)
});

//Purpose: Used for resizing and gestures
window.dragMoveListener = dragMoveListener;


function customDoubleTap (event) { 
    if (move == true){
      editModal.style.display = "block"; //Allows the modal to be displayed to User
      updateKey = event.target
      if(event.target.id.indexOf("url-icon") != -1){
        inputModal.value = $("#" + event.target.id).parent().clone().children().remove().end().text().trim()
        altText.value = updateKey.innerText;//updateKey.innerText
        updateKey = updateKey.parentNode
      }
      else if(event.target.hasChildNodes()){
        inputModal.value = $("#" + event.target.id).clone().children().remove().end().text().trim()
        //console.log($("#" + event.target.id));
        altText.value = $("#" + event.target.id).children()[0].innerText;//updateKey.innerText
      }
      else{
        inputModal.value = updateKey.innerText
      }

    }
}










