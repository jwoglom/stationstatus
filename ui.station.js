station = {
    id: null,
    st: null,
    init: function() {
        if(location.hash.indexOf('station=') != -1) {
            this.id = location.hash.split('station=')[1];
            this.id = this.id.split('&')[0];
            this.st = metro.stations[this.id];
            if(typeof this.st == 'undefined') return;
            this.add();   
        }
        $(window).on("hashchange", function() {
            location.reload();
        });
    },
    add: function() {
        this.showInformation();
        this.getPrediction();

        $(".loading").hide();
    },
    showInformation: function() {
        $(".header .title").html(this.st.name+" Station");
        this.showColorbar();
        var url = geo.getMapsURL(this.st.coords.lat, this.st.coords.long, 15);
        $(".contents .stationinfo").attr("style", "background-image: url('" + url + "')");
        assign(".stationinfo .bottom-button", "https://maps.google.com/maps?q="+this.st.coords.lat+", "+this.st.coords.long);
        assign(".card.starttrip .bottom-button", "ui-tripselect.html#from=" + this.id);
        $(".card.starttrip .bottom-button").html("Start Trip from "+this.st.name);
        this.showOrder();
    },
    showOrder: function() {
        $tpl = $(".contents .card-template.order");

        for(line in this.st.next) {
            $l = $tpl.clone();
            var nxt = this.st.next[line], en;
            if(nxt) {
                $(".half-bottom-button .right", $l).attr("data-station", nxt.code).html(nxt.name);
                $(".half-bottom-button .right", $l).addClass(line.toLowerCase());
                en = metro.stations[metro.lines[line].codes.end];
                $(".toward .right", $l).html(en.name);
            } else {
                $(".right", $l).css("visibility", "hidden");
            }
            var prv = this.st.prev[line], st;
            if(prv) {
                $(".half-bottom-button .left", $l).attr("data-station", prv.code).html(prv.name);
                $(".half-bottom-button .left", $l).addClass(line.toLowerCase());
                st = metro.stations[metro.lines[line].codes.start];
                $(".toward .left", $l).html(st.name);
            } else {
                $(".left", $l).css("visibility", "hidden");
            }

            console.debug(line+" prev: "+prv+" next: "+nxt);
            console.debug(line+" starts: "+st+" ends: "+en);
            $l.removeClass("card-template").css("display","");
            $l.addClass("card");
            $tpl.after($l);
        }

        $(".half-bottom-button > div").click(function() {
            setTimeout(function() {
                location.href = "ui-station.html#station=" + $(this).attr("data-station");
            }.bind(this), 400);
        });
    },
    showColorbar: function() {
        for(var i=0; i<this.st.totalLines.length; i++) {
            $(".container .multibackground").append("<span style='background-color: #"+metro.colors[this.st.totalLines[i].code]+"; opacity: 1; width: "+(100 / this.st.totalLines.length)+"%'></span>");
        }
    },
    getPrediction: function() {
        WMATA.gettiming(function() {
            var json = WMATA.timing["Trains"];
            console.log(json);
            var nm = 0;
            for(num in json) {
                if(json[num].LocationCode.toLowerCase().trim() == station.st.code.toLowerCase()) {
                    console.log(json[num]);
                    station.addPrediction(json[num]);
                    nm++;

                    if(nm > 2) { /* By default, Next Trains has room for two */
                        var ch = parseInt($(".card.nexttrains").css("height").split("px")[0]);
                        $(".card.nexttrains").css(
                            "height", ch + 30
                        )
                    }
                }
            }
            console.debug("Of "+num+" trains, "+nm+" are at "+station.st);
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
        setTimeout(function() {
            location.href = "ui-station.html#id=" + st;
        }, 400);
    }
};