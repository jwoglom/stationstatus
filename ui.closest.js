closest = {
    me: null,
    stations: [],
    separateCards: false,
    numCards: 2,
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
        $("ul.metrograph.closest").html("");
        this.checkLocal(lat, long, false);
        this.checkAPI(lat, long);
    },
    checkAPI: function(lat, long) {
        console.log("me:", this.me);
        $.get("tools/getclosests.php", {
            lat: lat,
            lon: long
        }, function(d) {
            var json = JSON.parse(d);
            var entrs = json["Entrances"];
            var usedsts = [];
            for(eid in entrs) {
                var entr = entrs[eid];
                var st = entr["StationCode1"];
                var st2 = entr["StationCode2"];
                if(usedsts.indexOf(st) != -1 || (st2.length > 0 && usedsts.indexOf(st2))) {
                    console.info("Skipping additional "+metro.stations[st]);
                    continue;
                }
                usedsts.push(st);
                if(st2.length > 0) usedsts.push(st2);
                closest.stations.push(metro.stations[st]);
            }
            closest.display();
        }, "text");
    },
    checkLocal: function(lat, long, add) {
        console.log("me:", this.me);
        for(sid in metro.stations) {
            var st = metro.stations[sid];
            st.coords.latlon = new LatLon(parseFloat(st.coords.lat), parseFloat(st.coords.long));
            st.coords.dist = this.me.distanceTo(st.coords.latlon); // kilometers
            st.coords.distmiles = st.coords.dist * 0.621371;
            if(add) this.stations.push(st);
        }
        this.stations.sort(function(a, b) {
            return a.coords.dist - b.coords.dist;
        });
        console.debug(this.stations);
        for(var i=0; i<this.stations.length; i++) {
            var s = this.stations[i];
        }
        if(add) this.display();
    },
    display: function() {
        for(var i=0; i<this.numCards; i++) {
            console.info("Displaying close station "+this.stations[i])
            this.add(this.stations[i]);
        }
        $(".card.closest > .bottom-button").show();
        assign(".card.closest > .bottom-button", "ui-closest.html");
    },
    add: function(st) {
        var str = '<li class="station' + (this.separateCards ? ' card' : '') + (st.transfer ? ' transfer' : '') + '" data-name="' + st.name + '" data-station="' + st.code + '" data-lines="" onclick="return closest.click.bind(this)()">\n' +
                  st.name + '\n' +
                  ' <span class="dist">' + (parseInt(st.coords.distmiles * 100) / 100) + ' mi</span>\n' +
                  '<div class="lines">\n';
        for(var i=0; i<st.totalLines.length; i++) {
            var ln = st.totalLines[i];
            str +='<span class="' + ln.code.toLowerCase() + '">' + ln.code + '</span>\n';
            str = str.replace('data-lines="', 'data-lines=",' + ln.code);
        }
        str +=    '</div>\n</li>';
        // Remove leading , in lines list
        str = str.replace('data-lines=",', 'data-lines="');
        if($("ul.metrograph.closest [data-name=\""+st.name+"\"]").length > 0) {
            // Prevent duplicate Metro Center or L'Enfant Plaza
            console.debug("Not showing duplicate "+st.name);
            return;
        }
        $("ul.metrograph.closest").append(str);
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
    assign(".card.trains > .bottom-button", "ui-trains.html");
}