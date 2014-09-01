outages = {
    data: null,
    stations: [],
    showAll: false,
    showStation: false,
    parentelem: null,
    check: function(stns) {
        if(this.parentelem == null) this.parentelem = $(".card.nexttrains").last();
        console.debug("outages parentelem",this.parentelem);
        if(stns instanceof Array) {
            this.stations = stns;
        } else if(typeof stns == 'object') {
            this.stations.push(stns);
        }
        WMATA.getdynamic(function() {
            outages.data = WMATA.dynamic["outages"];
            outages.parse.bind(outages)();
        });
    },
    parse: function() {
        console.log("Parsing");
        var num = 0;
        for(var i=0; i<this.data.length; i++) {
            var out = this.data[i];
            for(var j=0; j<this.stations.length; j++) {
                var st = this.stations[j];
                if(st.code == out.StationCode || (st.together.length > 0 && st.together[0].code == out.StationCode)) {
                    console.warn("Outage", out);
                    this.notify(out);
                    num++;
                }
            }
        }
        if(num > 0 && !this.showAll) {
            this.parentelem.after('<div class="card show-outages">' +
                                   '<div class="bottom-button" style="color: red">Elevator/Escalator Outages (' + num + ')</div>' +
                                   '</div>');
            $(".card.show-outages").click(function() {
                $(this).hide();
                $(".card.outage").show();
            })
        } else {
            $(".card.outage").show();
        }
    },
    timeDiff: function(now, date) {
        console.log(date);
        var diff = (new Date().getTime() - date.getTime()) / 1000; // seconds
        var min = parseInt(diff / 60);
        var hr = parseInt(min / 60);
        var day = parseInt(hr / 24);
        var wk = parseInt(day / 7);
        var time = "";
        if(wk > 0) time += wk + " week" + (wk > 1 ? "s" : "") + ", ";
        if(day > 0) time += day % 7 + " day" + (day > 1 ? "s" : "") + ", ";
        if(hr > 0) time += hr % 24 + " hour" + (hr > 1 ? "s" : "") + " and ";
        if(min >= 0) time += min % 60 + " minute" + (hr > 1 ? "s" : "");
        else time = "now";
        return time;
    },
    notify: function(out) {
        var date = new Date(out.DateOutOfServ);
        var time = this.timeDiff(new Date(), date);
        var text = out.LocationDescription + ' at ' + out.StationName + ' has been down for ' + time + '.';
        var type = out.UnitType;
        type = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
        var title = type + ' outage: ' + out.SymptomDescription + '.';
        if(this.showStation) {
            title = metro.stations[out.StationCode].name + ' ' + type + ' ' + out.SymptomDescription;
        }
        var str = '<div class="card outage">' +
                  '<div class="title">' + title + '</div>' +
                  '<p>' + text + '</p>' +
                  '</div>';
        this.parentelem.after(str);
        $(".card.outage .title").click(function() {
            console.debug("Hiding outage card");
            $(this).parent().slideUp(250);
        })
    }
};