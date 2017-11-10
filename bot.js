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
        return typeof(this.subject) !== undefined \
                && typeof(this.body) !== undefined;
    };
}

var Notifier = function (message_platforms, love_letter) {
    this.platforms = message_platforms;
    this.notify = function (platform) {};
    this.notify_all = function () {};
}

var Monitor = function (resource, loudness_threshold) {
    this.resource = resource;
    this.loudness_threshold = loudness_threshold;
    this.context = new AudioContext();
    this.analyser = this.context.createAnalyser();
    this.source = this.context.createMediaElementSource(this.resource);

    this.source.connect(this.analyser);
    this.analyser.connect(this.context.destination);

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

    this.is_online = function () {
        this.loudness() > this.loudness_threshold;
    }
}

var get_config_properties = function() {
        // TODO: read user input and return config properties (TBD)
    },
    get_resource = function(DOM) {
        // TODO: find and return video resource

        // Get resource
        return DOM.getElementsByClassName("video-stream html5-main-video")[0];
    },
    get_message_platforms = function() {
        // TODO: read user input and return a list of supported messaging
        // platforms
    },
    get_love_letter_properties = function() {
        // TODO: read user input and return love letter properties object
        // (subject, body)
    },
    monitor_resource = function (resource, notifier, config) {
        // TODO: asynchronous event loop to monitor stream uptime, and notify on
        // downtime
        var monitor = new Monitor(resource, config.loudness_threshold);
        (async function() {
            while (true) {
                var elapsed_seconds = 0;
                while (elapsed_seconds <= config.silence_threshold) {
                    await (new Promise(r => setTimeout(r,
                        config.poll_frequency)));
                    if (!monitor.is_online()) {
                        elapsed_seconds += 1;
                    }
                }
                notifier.notify_all();
                await (new Promise(r => setTimeout(r,
                    config.notify_frequency)));
            }
        }());
    };


//
// Off of a YouTube video page, the following script meters audio decibel
// levels (loudness) of a playing video.
//

document.addEventListener("DOMContentLoaded", () => {
    var config = get_config_properties(),
        resource = get_resource(this),
        love_letter = new LoveLetter(get_love_letter_properties());

    var notifier = new Notifier(get_message_platforms(), love_letter);
    
    monitor_resource(resource, notifier, config);
});

