window.closest = closest = {
    me: null,
    stations: [],
    separateCards: false,
    numCards: 2,
    stopGPSWait: false,
    nextLocation: 'ui-station.html#station=',
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
        if(this.stopGPSWait) return console.info("Stopped GPS wait");
        this.stations = [];
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
    customInit: function() {
        $(".contents .customloc .bottom-button").click(function() {
            closest.runCustom();
        })
    },
    runCustom: function() {
        this.stopGPSWait = true;
        $(".contents ul.closest").html("<div class='loading'></div>");
        this.stations = [];
        var loc = $(".contents .customloc > input").val();
        console.info("Searching for: " + loc);
        geo.geocode(loc, function(coords, addr) {
            if(coords == false) {
                console.error("No results.", coords, addr);
                $(".contents .customloc").after("<div class='card' style='height: 38px'><center style='line-height: 38px;font-size: 16px'>No matches. Is that a valid location?</center></div>");
            } else {
                console.info("Results:", coords, addr);
                closest.me = new LatLon(parseFloat(coords.lat), parseFloat(coords.lng));
                closest.calcDistances();
                closest.checkAPI(coords.lat, coords.lng);
                title("Closest Stations to "+addr);
            }
        });
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
                    // console.debug("Skipping additional "+metro.stations[st]);
                    continue;
                }
                usedsts.push(st);
                if(st2.length > 0) usedsts.push(st2);
                closest.stations.push(metro.stations[st]);
            }
            closest.display();
        }, "text");
    },
    calcDistances: function(add) {
        for(sid in metro.stations) {
            var st = metro.stations[sid];
            st.coords.latlon = new LatLon(parseFloat(st.coords.lat), parseFloat(st.coords.long));
            st.coords.dist = this.me.distanceTo(st.coords.latlon); // kilometers
            st.coords.distmiles = st.coords.dist * 0.621371;
            if(add) this.stations.push(st);
        }
    },
    checkLocal: function(lat, long, add) {
        console.log("me:", this.me);
        this.calcDistances(add);
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
        var sts = [];
        for(var i=0; i<this.numCards; i++) {
            sts.push(this.stations[i]);
            this.add(this.stations[i]);
        }

        console.info("Displayed "+sts.length+" close stations:", sts);
        $(".card.closest > .bottom-button").show();
        assign(".card.closest > .bottom-button", "ui-closest.html");
        $(".loading").hide();
    },
    add: function(st) {
        var str = '<li class="station' + (this.separateCards ? ' card' : '') + (st.transfer ? ' transfer' : '') + '" data-name="' + st.name + '" data-station="' + st.code + '" data-lines="" onclick="return window.closest.click.bind(this)()">\n' +
                  st.name + '\n' +
                  // Inaccurate
                  //' <span class="dist">~' + (parseInt(st.coords.distmiles * 100) / 100) + ' mi</span>\n' +
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
            // or, multiple entrances from WMATA API
            // console.debug("Not showing duplicate "+st.name);
            return;
        }
        $("ul.metrograph.closest").append(str);
    },
    click: function() {
        location.href = closest.nextLocation + $(this).attr("data-station");
    }
}
doAssign = function() {
    assign(".card.stations > .bottom-button", "ui-stations.html");
    for(linecode in metro.lines) {
        assign(".contents .card.lines ."+linecode.toLowerCase(), "ui-line.html#line="+linecode  );
    }
    assign(".card.trip > .bottom-button", "ui-tripselect.html");
    assign(".card.trains > .bottom-button", "ui-trains.html");
    assign(".card.homeoutages > .bottom-button", "ui-outages.html");
}