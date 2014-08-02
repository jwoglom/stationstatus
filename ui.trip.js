trip = {
    from: null,
    to: null,
    sfrom: null,
    sto: null,
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
        this.addNames();
        this.addMap();
        this.getPrediction();
    },
    addNames: function() {
        this.add(this.sfrom);
        $(".contents ul.allstations").append('<div class="arrow"></div>');
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
    getPrediction: function() {
        $(".card.nexttrains .title").html("Next Trains at "+trip.sfrom.name);
        WMATA.gettiming(function() {
            var json = WMATA.timing["Trains"];
            console.log(json);
            var nm = 0;
            for(num in json) {
                if(json[num].LocationCode.toLowerCase().trim() == trip.sfrom.code.toLowerCase()) {
                    console.log(json[num]);
                    trip.addPrediction(json[num]);
                    nm++;

                    if(nm > 2) { /* By default, Next Trains has room for two */
                        var ch = parseInt($(".card.nexttrains").css("height").split("px")[0]);
                        $(".card.nexttrains").css(
                            "height", ch + 30
                        )
                    }
                }
            }
            console.debug("Of "+num+" trains, "+nm+" are at "+station.sfrom);
            if(nm < 1) {
                $(".card.nexttrains table tbody").append("<tr><td colspan=5><center style='font-size: 14px'>There are no trains scheduled to arrive at this station.</center></td></tr>");
            }
        });
    },
    addPrediction: function(train) {
        $c = $(".card.nexttrains table tbody");
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
    click: function() { // binded: this=object
        var st = $(this).attr("data-station");
        console.info("CLICK: "+st);
        var url = "ui-station.html#station=" + st + "&historyback=true";
        
        setTimeout(function() {
            location.href = url;
        }, 400);
    }
};