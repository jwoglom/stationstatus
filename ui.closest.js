closest = {
    me: null,
    stations: [],
    quick: function() {
        if(typeof localStorage != 'undefined' && typeof localStorage.pos != 'undefined') {
            var cd = localStorage.pos.split(",");
            console.info("Showing close stations to previous location");
            this.run(cd[0], cd[1]);
        } else {
            console.info("No saved location");
        }
    },
    slow: function(pos) {
        localStorage.setItem("pos", pos.coords.latitude+","+pos.coords.longitude);
        this.run(pos.coords.latitude, pos.coords.longitude);
    },
    run: function(lat, long) {
        this.me = new LatLon(parseFloat(lat), parseFloat(long));
        if(this.me == null || this.me.lat == null) {
            console.error("Invalid location", this.me);
            return;
        }
        this.stations = [];
        $(".card.closest > ul").html("");
        this.check(lat, long);
        this.display();
    },
    check: function(lat, long) {
        console.log("me:", this.me);
        for(sid in metro.stations) {
            var st = metro.stations[sid];
            st.coords.latlon = new LatLon(parseFloat(st.coords.lat), parseFloat(st.coords.long));
            st.coords.dist = this.me.distanceTo(st.coords.latlon);
            this.stations.push(st);
        }
        this.stations.sort(function(a, b) {
            return a.coords.dist - b.coords.dist;
        });
        console.debug(this.stations);
        for(var i=0; i<this.stations.length; i++) {
            var s = this.stations[i];
        }
    },
    display: function() {
        for(var i=0; i<2; i++) {
            console.info("Displaying close station "+this.stations[i])
            this.add(this.stations[i]);
        }
        $(".card.closest > .bottom-button").show();
        assign(".card.closest > .bottom-button", "ui-closest.html");
    },
    add: function(st) {
        var str = '<li class="station' + (st.transfer ? ' transfer' : '') + '" data-station="' + st.code + '" data-lines="" onclick="return closest.click.bind(this)()">\n' +
                  st.name + '\n' +
                  '<div class="lines">\n';
        for(var i=0; i<st.totalLines.length; i++) {
            var ln = st.totalLines[i];
            str +='<span class="' + ln.code.toLowerCase() + '">' + ln.code + '</span>\n';
            str = str.replace('data-lines="', 'data-lines=",' + ln.code);
        }
        str +=    '</div>\n</li>';
        // Remove leading , in lines list
        str = str.replace('data-lines=",', 'data-lines="');
        $(".card.closest > ul").append(str);
    },
    click: function() {
        location.href = "ui-station.html#station=" + $(this).attr("data-station");
    }
}
doAssign = function() {
    assign(".card.stations > .bottom-button", "ui-stations.html");
    for(linecode in metro.lines) {
        assign(".contents .card.lines ."+linecode.toLowerCase(), "ui-line.html#line="+linecode  );
    }
    assign(".card.trip > .bottom-button", "ui-tripselect.html");
}