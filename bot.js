/*
RAD bot - Radio Alert Downtime bot.

Copyright (c) 2017 Robert Oliveira (rob - https://twitter.com/robolivable)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

//
//Off of a YouTube video page, the following script meters audio decibel
//levels (loudness) of a playing video.
//

var PROTOCOL = "https";

// TODO: implement all platforms
var PLATFORMS = {
    boxcar: {"uri":PROTOCOL+"://"},
    discord: {"uri":PROTOCOL+"://"},
    mailchimp: {"uri":PROTOCOL+"://"},
    pushover: {"uri":PROTOCOL+"://"},
    twilio: {"uri":PROTOCOL+"://"},
    twitter: {"uri":PROTOCOL+"://"}
};

function xml_request(type, uri, data) {
    // TODO: make xmlhttp request
}

var Config = function (properties) {
    // TODO: set user defined properties
}

var LoveLetter = function (properties) {
    this.subject = properties.subject;
    this.body = properties.body;
    this.is_valid = function () {
        return typeof(this.subject) !== undefined 
                && typeof(this.body) !== undefined;
    };
}

var Notifier = function (message_platforms, love_letter) {
    this.platforms = message_platforms;
    this.notify = function (platform) {};
    this.notify_all = function () {};
}

var Monitor = function (resource) {
    this.resource = resource;
    this.context = new AudioContext();
    this.analyser = this.context.createAnalyser();
    this.source = this.context.createMediaElementSource(this.resource);

    this.source.connect(this.analyser);
    this.analyser.connect(this.context.destination);

    this.is_running = true;
    this.in_loop = false;

    this.loudness = function () {
        /* loudness scale: 0 == no sound/mute */
        var a = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(a);

        var _ = 0;
        for (var i = 0; i < a.length; i = i + 1) {
            _ = _ + parseFloat(a[i]);
        }

        return _/a.length;
    };

    this.is_online = function (threshold) {
        this.loudness() > threshold;
    }

    this.start = function () {
        this.is_running = true;
    }
    this.stop = function () {
        this.is_running = false;
    }
}

var get_config_properties = function() {
        // TODO: read user input and return config properties (TBD)
        return {};
    },
    get_resource = function(DOM) {
        // TODO: find and return video resource

        // Get resource
        return DOM.getElementsByClassName(
            "video-stream html5-main-video")[0];
    },
    get_message_platforms = function() {
        // TODO: read user input and return a list of supported messaging
        // platforms
        return {};
    },
    get_love_letter_properties = function() {
        // TODO: read user input and return love letter properties object
        // (subject, body)
        return {};
    },
    monitor_resource = function (monitor, notifier, config) {
        // TODO: asynchronous event loop to monitor stream uptime, and notify
        // on downtime
        (async function() {
            monitor.in_loop = true;
            while (monitor.is_running()) {
                var elapsed_seconds = 0;
                while (elapsed_seconds <= config.silence_elapsed_threshold) {
                    if (!monitor.is_running()) {
                        monitor.in_loop = false;
                        return;
                    }
                    await (new Promise(r => setTimeout(r,
                        config.poll_frequency)));
                    if (monitor.is_online(config.loudness_threshold)) {
                        elapsed_seconds = 0;
                    }
                    else {
                        elapsed_seconds += 1;
                    }
                }
                notifier.notify_all();
                if (!config.repeat_notify) {
                    break;
                }
                await (new Promise(r => setTimeout(r,
                    config.notify_frequency)));
            }
            monitor.in_loop = false;
        }());
    };

document.addEventListener("DOMContentLoaded", function() {
    console.log("RAD bot starting...");
    var resource = get_resource(document),
        love_letter = new LoveLetter(get_love_letter_properties());

    console.log(resource);

    var notifier = new Notifier(get_message_platforms(), love_letter);
    
    try {
        var monitor = new Monitor(resource);
    }
    catch (exception) {
        console.warn(
            "Could not initiate monitor! " +
            "Perhaps the video element isn't loaded? " +
            "(" + exception + ")");
        return;
    }

    console.log("Monitoring resource...");
    monitor_resource(monitor, notifier, get_config_properties());

    this.document.getElementById("submit").addEventListener(
        "click", function() {
        var config = {};
        config.loudness_threshold = document.getElementById(
            "loudness_threshold").value;
        config.poll_frequency = document.getElementById(
            "poll_frequency").value;
        config.repeat_notify = document.getElementById(
            "repeat_notify").checked;
        config.notify_frequency = document.getElementById(
            "notify_frequency").value;
        config.silence_elapsed_threshold = document.getElementById(
            "silence_elapsed_threshold").value;
        chrome.storage.sync.set({"config": config}, function () {
            console.log("Configuration updated -- restarting montor...");
            monitor_resource(monitor, notifier, get_config_properties());
        });
    });
});

