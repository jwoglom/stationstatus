trip = {
    from: null,
    to: null,
    sfrom: null,
    sto: null,
    stransfer: false,
    init: function() {
        if(location.hash.indexOf('from=') != -1) {
            this.from = location.hash.split('from=')[1];
            this.from = this.from.split('&')[0];
            this.sfrom = metro.stations[this.from];
            if(location.hash.indexOf('to=') != -1) {
                this.to = location.hash.split('to=')[1];
                this.to = this.to.split('&')[0];
                this.sto = metro.stations[this.to];
                this.load();
            } else {
                location.href = 'ui-tripselect.html#from=' + this.from;
            }
        } else {
            location.href = 'ui-tripselect.html';
        }
        $(".loading").hide();
        $(window).on("hashchange", function() {
            location.reload();
        });
    },
    load: function() {
        this.stransfer = this.findTransferStart();
        this.addNames();
        this.addMap();
        this.getPrediction("sfrom"); // Get predictions for from station
        if(this.stransfer) {
            $(".card.nexttrains.stransfer").show();
            this.getPrediction("stransfer");
        }
    },
    addNames: function() {
        this.add(this.sfrom);
        $(".contents ul.allstations").append('<div class="arrow"></div>');
        if(this.stransfer) {
            this.add(this.stransfer);
            $(".contents ul.allstations").append('<div class="arrow"></div>');
        }
        this.add(this.sto);
    },
    add: function(st) {
        var str = '<li class="card' + (st.transfer ? ' transfer' : '') + '" data-station="' + st.code + '" data-lines="" onclick="return trip.click.bind(this)()">\n' +
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
        $(".contents ul.allstations").append(str);
    },
    addMap: function() {
        $(".card.stationinfo .bottom-button").html("Navigate to " + this.sfrom.name);
        var url = geo.getMapsURL(this.sfrom.coords.lat, this.sfrom.coords.long, 15);
        $(".card.stationinfo").attr("style", "background-image: url('" + url + "')");
        assign(".stationinfo .bottom-button", "https://maps.google.com/maps?q="+this.sfrom.coords.lat+", "+this.sfrom.coords.long);
    },
    getPrediction: function(type) {
        $(".card.nexttrains."+type+" .title").html("Next Trains at "+trip[type].name);
        WMATA.gettiming(function() {
            var json = WMATA.timing["Trains"];
            console.log(json);
            var nm = 0;
            for(num in json) {
                if(json[num].LocationCode.toLowerCase().trim() == trip[type].code.toLowerCase() ||
                    (typeof trip[type].together[0] != 'undefined' && json[num].LocationCode.toLowerCase().trim() == trip[type].together[0].code.toLowerCase()) ||
                    (typeof trip[type].together[1] != 'undefined' && json[num].LocationCode.toLowerCase().trim() == trip[type].together[1].code.toLowerCase())) {
                    console.log(json[num]);
                    trip.addPrediction(json[num], type);
                    nm++;

                    if(nm > 2) { /* By default, Next Trains has room for two */
                        var ch = parseInt($(".card.nexttrains."+type).css("height").split("px")[0]);
                        $(".card.nexttrains."+type).css(
                            "height", ch + 30
                        )
                    }
                }
            }
            console.debug("Of "+num+" trains, "+nm+" are at "+trip[type]);
            if(typeof trip[type].together[0] != 'undefined') console.debug("(or "+trip[type].together[0]+")");
            if(typeof trip[type].together[1] != 'undefined') console.debug("(or "+trip[type].together[1]+")");
            if(nm < 1) {
                $(".card.nexttrains."+type+" table tbody").append("<tr><td colspan=5><center style='font-size: 14px'>There are no trains scheduled to arrive at this station.</center></td></tr>");
            }
        });
    },
    addPrediction: function(train, type) {
        $c = $(".card.nexttrains."+type+" table tbody");
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
    },
    isTransferPoint: function(cur, end) {
        for(lid in cur.totalLines) {
            var ln = cur.totalLines[lid];
            if(end.totalLines.indexOf(ln) != -1) return true;
        }
        return false;
    },
    findTransferStart: function() {
        var s = this.sfrom;
        var e = this.sto;
        if(this.isTransferPoint(s, e)) {
            console.info("No transfer needed");
            return false;
        }
        var t = this.findTransfer(s, e, 0);
        if(t == false) {
            console.error("It is impossible to get between "+s+" and "+e);
            return false;
        } else if(t == s) {
            console.info("No transfer needed");
            return false;
        } else {
            console.info("Transfer needed at "+t+" between "+s+" and "+e);
            return t;
        }
    },
    findTransfer: function(s, e, t) {
        // console.debug("fT "+s+" "+e);
        if(s == null) return false;
        if(this.isTransferPoint(s, e)) {
            console.info(s+" is a transfer point to get to "+e);
            return s;
        } else if (t == 0) {
            for(lid in s.totalLines) {
                var l = s.totalLines[lid];
                var n = s.next[l.code];
                while(n != null && n.next[l.code]) {
                    var f = this.findTransfer(n, e, t+1);
                    // console.debug("F: "+l+" "+n+" "+f);
                    if(!!f) return f;
                    n = n.next[l.code];
                }
                var p = s.prev[l.code];
                while(p != null && p.prev[l.code] != null) {
                    var b = this.findTransfer(p, e, t+1);
                    // console.debug("B: "+l+" "+p+" "+b);
                    if(!!b) return b;
                    p = p.prev[l.code];
                }
            }
        }
        return false;
    },
    click: function() { // binded: this=object
        var st = $(this).attr("data-station");
        console.info("CLICK: "+st);
        var url = "ui-station.html#station=" + st + "&historyback=true";
        
        setTimeout(function() {
            location.href = url;
        }, 400);
    }
};