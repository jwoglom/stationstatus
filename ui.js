assign = function(id, url) {
    $(id).click(function() {
        setTimeout(function() {
            location.href = url;
        }, 250);
    });
}

title = function(text) {
    $(".header .title").html(text);
    document.title = "StationStatus - " + text;
}