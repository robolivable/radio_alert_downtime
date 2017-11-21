(function () {
    document.getElementById("repeat_notify").addEventListener("click", function() {
        document.getElementById("notify_frequency").disabled = !(document.getElementById(
            "repeat_notify").checked);
    });

}());
