trains = {
    line: false,
    jumped: false,
    init: function() {
        if(location.hash.indexOf('line=') != -1) {
            this.line = location.hash.split('line=')[1];
            this.line = this.line.split('&')[0];
            this.line = this.line.toUpperCase();
            title("Trains: "+metro.lines[this.line].name+" Line");
            $(".header").css("background-color", "#"+metro.colors[this.line]);
            if(~$.inArray(this.line, metro.colorsBlack)) {
                $(".header .title").css("color", "black");
            }

            assign(".logo", "ui-line.html#line="+this.line);
        } else if(location.hash.indexOf('historyback=true') != -1) {
            $(".logo").click(function() {
                history.back();
            });
        } else {
            assign(".logo", "ui-stations.html");
        }
        this.getPrediction();
        $(".loading").hide();
        $(window).on("hashchange", function() {
            location.reload();
        });
        $(".refresh").click(function() {
            console.info("Refresh clicked");
            $(".refresh-time").html("Updating..");
            tm = tmst;
            trains.refresh();
        });
        var tm = tmst = 30;
        $(".refresh-time").html("Updating in "+tm+" seconds");
        window.updint = setInterval(function() {
            tm -= 5;
            if(tm <= 0) {
                $(".refresh-time").html("Updating..");
                trains.refresh();
                tm = tmst;
            } else {
                $(".refresh-time").html("Updating in "+tm+" seconds");
            }
        }, 5000);
    },
    refresh: function() {
        console.info("Refreshing");
        $(".card.nexttrains").removeClass("new");
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
                console.log("T",typeof stn.together[0] != 'undefined' ? stn.together[0].totalLines.indexOf(metro.lines[trains.line]) != -1 : null);
                if(trains.line != false && (stn.totalLines.indexOf(metro.lines[trains.line]) == -1) && !(typeof stn.together[0] != 'undefined' && stn.together[0].totalLines.indexOf(metro.lines[trains.line]) != -1)) {
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
                    ltrs[cd] = trns;
                }
                // If a multiple-code station, place the trains in both.
                if(typeof stn.together[0] != 'undefined') {
                    var tog = stn.together[0].code.toUpperCase();
                    if(trains.line == false) {
                        stns.push([trns, tog]);
                    } else {
                        ltrs[tog];
                    }
                }
                if(typeof stn.together[1] != 'undefined') {
                    var tog = stn.together[1].code.toUpperCase();
                    if(trains.line == false) {
                        stns.push([trns, tog]);
                    } else {
                        ltrs[tog];
                    }
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

            if(location.hash.indexOf('station=') != -1 && !trains.jumped) {
                trains.jumped = true;
                var sj = location.hash.split('station=')[1];
                sj = sj.split('&')[0];
                $e = $(".nexttrains."+sj);
                if($e.length > 0) {
                    $('.contents').animate({
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
        var dup = false;
        if(trns.length > 0) {
            if(!trains.addStation(stn)) {
                // Duplicate
                dup = true;
            }
        }
        for(var i=0; i<trns.length; i++) {
            trains.addPrediction(trns[i], cd);
            if(i >= 2) { // 140px default is for 2 trains
                if(dup && $(".card.nexttrains."+stn.together[0].code).length > 0) {
                    var $e = $(".card.nexttrains."+stn.together[0].code);
                    console.log("Using "+stn.together[0].code+" instead of "+stn.code);
                    cd = stn.together[0].code;
                } else if($(".card.nexttrains."+cd).length > 0) {
                    var $e = $(".card.nexttrains."+cd);
                } else {
                    console.error("nexttrains card with cd: "+cd+" does not exist.");
                    continue;
                }
                var ch = parseInt($e.css("height").split("px")[0]);
                $e.css(
                    "height", ch + 29
                );
                if(cd=="F03" || cd=="D03")console.debug("Moving nexttrains card "+cd+" +29 to "+(ch+29), trns[i]);
                
            }
        }
    },
    addStation: function(st) {
        var str = '<div class="card nexttrains new ' + st.code + '" data-name="' + st.name + '" data-station="' + st.code + '">\n' +
                  '<div class="title">' + st.name + '</div>' +
                  '<table><thead><tr>' +
                  '<th>Line</th><th>Cars</th><th>Destination</th><th>Mins</th><th>Arrival</th>' +
                  '</tr></thead>' +
                  '<tbody></tbody>' +
                  '</table></div>';
        if($(".contents .card.nexttrains.new[data-name=\""+st.name+"\"]").length > 0) {
            // Prevent duplicate Metro Center or L'Enfant Plaza
            console.debug("Not showing duplicate "+st.name);
            return false;
        }
        $pr = $(".contents .card.nexttrains." + st.code);
        if($pr.length > 0) {
            $pr.remove(); // Used when reloading
        }
        $(".contents").append(str);
        assign(".card.nexttrains."+st.code+" .title", "ui-station.html#station="+st.code+"&historyback=true");
        return true;
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
        h = (time.getHours() > 12 ? time.getHours() - 12 : time.getHours() == 0 ? 12 : time.getHours()),
        m = time.getMinutes(),
        timel = h+":"+(m<10 ? "0"+m : m);
        var dest = train.DestinationName;
        // Usability fix: Crop "Mt Vernon Sq 7th St-Convention Center" to "Mt Vernon Sq"
        if(dest.substring(0,12) == 'Mt Vernon Sq') dest = 'Mt Vernon Sq'; 
        var str = '<tr>\n' +
                  '<td class="line"><span class="line ' + train.Line.toLowerCase() + '">' + train.Line + '</span></td>\n' +
                  '<td class="num">' + (train.Car ? train.Car : '-') + '</td>\n' +
                  '<td class="stop">' + dest + '</td>' +
                  '<td class="mins">' + mins + '</td>\n' +
                  '<td class="time">' + timel + '</td>\n' +
                  '</tr>';
        $c.append(str);
    }
};