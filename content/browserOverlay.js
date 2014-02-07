/*
 * I'm not an idiot, I understand that these source files might as well
 * be on the front page of a website: anyone can access this source.
 * 
 * As such, feel free to use, modify, or directly rip off anything found below.
 * 
 * For an example of someone who likes to whine and shout his little head off to
 * anyone brave enough to read his source, Tube Enhancer Plus is a laugh.
 */

if ("undefined" == typeof(YoutubeTimeBookmarks)) {
  var YoutubeTimeBookmarks = {};
};

if (!String.format) {
  String.format = function (format) {
    var args = Array.prototype.slice.call(arguments, 1);
    var sprintfRegex = /\{(\d+)\}/g;
    var sprintf = function (match, number) {
      return number in args ? args[number] : match;
    };
    return format.replace(sprintfRegex, sprintf);
  };
}


YoutubeTimeBookmarks.Lib = {
  hasAttributeById : function(id, attribute) {
    return document.getElementById(id).hasAttribute(attribute);
  },
  
  createBookmark : function(url, name) {
    let bmsvc = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
                      .getService(Components.interfaces.nsINavBookmarksService);
    let ios = Components.classes["@mozilla.org/network/io-service;1"]
                    .getService(Components.interfaces.nsIIOService);
    let uri = ios.newURI(url, null, null);
    bmsvc.insertBookmark(bmsvc.toolbarFolder, uri, bmsvc.DEFAULT_INDEX, name);
  }
};


YoutubeTimeBookmarks.Main = {
  makeTimeBookmark : function() {
    let time_string = YoutubeTimeBookmarks.Main.getTimeString();
    if (time_string) {
      let video_url = content.location.href;
      let video_id = YoutubeTimeBookmarks.Main.getVideoId(video_url);
      if (video_id) {
        // This allows a 'fresh' url, without other gunk added from who knows where
        YoutubeTimeBookmarks.Lib.createBookmark(String.format("http://www.youtube.com/watch?v={0}{1}", video_id, time_string), content.document.title);
      } else {
        // This is a backup in case the url is too funky for the regExp to handle
        YoutubeTimeBookmarks.Lib.createBookmark(String.format("{0}{1}", video_url, time_string), content.document.title);
      }
    }
  },
  
  getVideoId : function(url) {
    let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    let match = url.match(regExp);
    if (match&&match[2].length == 11) {
      return match[2];
    } else {
      return null
    }
  },
  
  getTimeString : function() {
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    let time = YoutubeTimeBookmarks.Main.getVideoTime();
    if (time) {
      hours = Math.floor(time / 3600);
      minutes = Math.floor((time % 3600) / 60);
      seconds = Math.floor((time % 3600) % 60);
      if (hours > 0) {
        return String.format("&t={0}h{1}m{2}s", hours, minutes, seconds);
      } else if (minutes > 0) {
        return String.format("&t={0}m{1}s", minutes, seconds);
      } else {
        return String.format("&t={0}s", seconds);
      }
    }
  },
  
  getVideoTime : function() {
    if (content.document.getElementById('movie_player')) {
      let sandbox = Components.utils.Sandbox(gBrowser.contentWindow,{sandboxPrototype:gBrowser.contentWindow, wantXrays:false});
      let currenttime = Components.utils.evalInSandbox("document.getElementById('movie_player').getCurrentTime()", sandbox);
      if (currenttime > 0) {
        return currenttime;
      } else {
        return null;
      }
    }
  }
};
