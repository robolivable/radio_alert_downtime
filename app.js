//
// Off of a YouTube video page, the following script meters audio decibel
// levels (loudness) of a video.
//

var v = document.getElementsByClassName("video-stream html5-main-video")[0];

var context = new AudioContext(),
    analyser = context.createAnalyser(),
    source = context.createMediaElementSource(v);

source.connect(analyser);
analyser.connect(context.destination);

var array = new Uint8Array(analyser.frequencyBinCount);
analyser.getByteFrequencyData(array);

var loudness = 0;
for (var i = 0; i < array.length; i = i + 1) {
    loudness = loudness + parseFloat(array[i]);
}

console.log(loudness/array.length); // loudness scale (0 == no sound/mute)

