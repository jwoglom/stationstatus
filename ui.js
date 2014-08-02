assign = function(id, url) {
    $(id).click(function() {
        setTimeout(function() {
            location.href = url;
        }, 250);
    });
}