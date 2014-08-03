trains = {
    line: false,
    init: function() {
        if(location.hash.indexOf('line=') != -1) {
            this.line = location.hash.split('line=')[1];
            this.line = this.line.split('&')[0];
            this.line = this.line.toUpperCase();
            $(".header .title").html("Trains: "+metro.lines[this.line].name+" Line");
            $(".header").css("background-color", "#"+metro.colors[this.line]);
            if(~$.inArray(this.line, metro.colorsBlack)) {
                $(".header .title").css("color", "black");
            }

            assign(".logo", "ui-line.html#line="+this.line);
        } else {
            assign(".logo", "ui-stations.html");
        }
        this.getPrediction();
        $(".loading").hide();
        $(window).on("hashchange", function() {
            location.reload();
        });
        $(".refresh").click(trains.refresh);
        setInterval(trains.refresh, 60000);
    },
    refresh: function() {
        console.info("Refreshing");
        $(".contents").html("<div class='loading'></div>");
        trains.getPrediction();
    },
    getPrediction: function() {
        WMATA.getdynamic(function() {
            var json = WMATA.dynamic["timing"];
            console.log(json);
            var nm = 0;
            stdata = {};
            for(num in json) {
                var d = json[num];
                if(typeof stdata[d.LocationCode] == 'undefined') {
                    stdata[d.LocationCode] = [];
                }
                stdata[d.LocationCode].push(d);
            }
            var ltrs = {};

            var stns = [];
            // Sort alphabetically
            
            for(var i=0; i<stns.length; i++) {
                this.add(stns[i]);
            }
            for(stcode in stdata) {
                var cd = stcode.trim().toUpperCase();
                var trns = stdata[cd];
                var stn = metro.stations[cd];
                if(trains.line != false && stn.totalLines.indexOf(metro.lines[trains.line]) == -1) {
                    /* Skip if not in line */
                    console.debug("Showing only line "+trains.line+", not in "+stn.totalLines.join(',')+" at "+stn);
                    continue;
                }
                console.info("Of "+num+" trains, "+trns.length+" are at "+stn);
                if(trains.line == false) {
                    // Showing all trains
                    // trains.doStation(trns, cd);
                    stns.push([trns, cd]);
                } else {
                    ltrs[stcode] = trns;
                }
            }
            if(trains.line != false) {
                // Show line in order
                console.log(ltrs);
                var ln = metro.lines[trains.line];
                for(var i=0; i<ln.route.length; i++) {
                    var s = ln.route[i];
                    console.log(s, ltrs[s.code]);
                    if(typeof ltrs[s.code] != 'undefined') {
                        trains.doStation(ltrs[s.code], s.code);
                    }
                }
            } else {
                console.log(stns);
                stns.sort(function(a, b) {
                    return metro.stations[a[1]].name > metro.stations[b[1]].name ? 1 : -1;
                });
                console.log(stns);
                for(var i=0; i<stns.length; i++) {
                    var e = stns[i];
                    trains.doStation(e[0], e[1]);
                }
            }
            $(".loading").hide();

            if(location.hash.indexOf('station=') != -1) {
                var sj = location.hash.split('station=')[1];
                sj = sj.split('&')[0];
                $e = $(".nexttrains."+sj);
                console.debug("Station hash "+sj, $e);
                if($e.length > 0) {
                    $('html, body').animate({
                        scrollTop: $e.offset().top - 45
                    }, 500);
                } else if(typeof metro.stations[sj] != 'undefined' && typeof metro.stations[sj].together[0] != 'undefiend') {
                    var sj = metro.stations[sj].together[0].code;
                    $e = $(".nexttrains."+sj);
                    console.debug("Alt", $e);
                    if($e.length > 0) {
                        $('.contents').animate({
                            scrollTop: $e.offset().top - 45
                        }, 500);
                    }
                }
            }
        });
    },
    doStation: function(trns, cd) {
        var stn = metro.stations[cd];
        if(trns.length > 0) {
            trains.addStation(stn);
        }
        for(var i=0; i<trns.length; i++) {
            trains.addPrediction(trns[i], cd);
            if(i >= 2) {
                if($(".card.nexttrains."+cd).length > 0) {
                    var ch = parseInt($(".card.nexttrains."+cd).css("height").split("px")[0]);
                    $(".card.nexttrains."+cd).css(
                        "height", ch + 30
                    );
                } else {
                    console.error("nexttrains card with cd: "+cd+" does not exist.");
                }
            }
        }
    },
    addStation: function(st) {
        var str = '<div class="card nexttrains ' + st.code + '" data-name="' + st.name + '" data-station="' + st.code + '">\n' +
                  '<div class="title">' + st.name + '</div>' +
                  '<table><thead><tr>' +
                  '<th>Line</th><th>Cars</th><th>Destination</th><th>Mins</th><th>Arrival</th>' +
                  '</tr></thead>' +
                  '<tbody></tbody>' +
                  '</table></div>';
        if($(".contents [data-name=\""+st.name+"\"]").length > 0) {
            // Prevent duplicate Metro Center or L'Enfant Plaza
            console.debug("Not showing duplicate "+st.name);
            return;
        }
        $(".contents").append(str);
        assign(".card.nexttrains."+st.code+" .title", "ui-station.html#station="+st.code+"&historyback=true");
    },
    addPrediction: function(train, st) {
        $c = $(".card.nexttrains."+st+" table tbody");
        var mins = min = train.Min;
        if(mins == "ARR") mins = "<span class='arr'>ARR</span>";
        else if(mins == "BRD") mins = "<span class='brd'>BRD</span>";
        
        var tm = parseInt(+new Date);
        if(min != "ARR" && min != "BRD") {
            tm += 60 * parseInt(min) * 1000;
        }
        var time = new Date(tm),
        h = (time.getHours() > 12 ? time.getHours() - 12 : time.getHours()),
        m = (time.getMinutes()+1),
        timel = h+":"+(m<10 ? "0"+m : m);
        var str = '<tr>\n' +
                  '<td class="line"><span class="line ' + train.Line.toLowerCase() + '">' + train.Line + '</span></td>\n' +
                  '<td class="num">' + (train.Car ? train.Car : '-') + '</td>\n' +
                  '<td class="stop">' + train.DestinationName + '</td>' +
                  '<td class="mins">' + mins + '</td>\n' +
                  '<td class="time">' + timel + '</td>\n' +
                  '</tr>';
        $c.append(str);
    }
};