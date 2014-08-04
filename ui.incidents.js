incidents = {
    data: null,
    locdat: {},
    check: function(dat) {
        if(dat != null) this.locdat = dat;
        WMATA.getdynamic(function() {
            incidents.data = WMATA.dynamic["incidents"];
            incidents.parse.bind(incidents)();
        });
    },
    checkHome: function() {
        this.locdat = {
            showAll: true,
            home: true
        };
        WMATA.getdynamic(function() {
            incidents.data = WMATA.dynamic["incidents"];
            incidents.parse.bind(incidents)();
        });
    },
    arrayMatch: function(a, b) {
        console.debug("check incident match",a,b);
        for(var i=0; i<a.length; i++) {
            for(var j=0; j<b.length; j++) {
                if(a[i] == b[j]) return true;
            }
        }
        return false;
    },
    parse: function() {
        if(location.hash.indexOf('showAllAlerts=true') != -1) {
            console.info("Showing all alerts");
            this.locdat.showAll = true;
        }
        var tonotify = [], notified = 0;
        for(iid in this.data) {
            var inc = this.data[iid];
            if(inc.LinesAffected != null) inc.lines = inc.LinesAffected.split(";");
            else inc.lines = [];
            if(inc.lines[inc.lines.length-1] == "") inc.lines.pop();
            inc.sev = inc.delaySeverity;
            if(typeof inc.delaySeverity != 'undefined') inc.sev = inc.sev.trim().toLowerCase();
            console.debug(inc);
            if(typeof this.locdat.lines != 'undefined') {
                if(this.arrayMatch(inc.lines, this.locdat.lines)) {
                    tonotify.push(inc);
                }
            } else if(this.locdat.showAll) {
                tonotify.push(inc);
            }
        }
        for(var i=0; i<tonotify.length; i++) {
            this.notify(tonotify[i]);
            notified++;
        }
        if(this.locdat.home) {
            $(".card.homeincidents .bottom-button").html("View Incidents (" + tonotify.length + ")");
            if(tonotify.length > 0 && !this.locdat.showAll) {
                $m = $(".card.homeincidents").clone();
                // $(".card.homeincidents").remove(); // Still show
                $m.addClass("show-incidents");
                $m.css("color", "red");
                $m.click(function() {
                    $(".card.incident").show();
                    $(this).hide();
                });
                $m.insertBefore($(".card.trip"));
                $(".card.incident").hide();
            }
            assign(".card.homeincidents", "ui-incidents.html");
            if(!this.locdat.showAll) return;
        }
        if(tonotify.length > 1 && !this.locdat.showAll) {
            // Group together
            var on = "";
            if(!!this.locdat.alertsOn) {
                on = " on " + this.locdat.alertsOn + " ";
            }
            var str = '<div class="card show-incidents">' +
                      '<div class="bottom-button">Show Alerts ' + on + '(' + tonotify.length + ')</div>' +
                      '</div>';
            $(".card.incident").hide();
            $(".contents").prepend(str);
            $(".card.show-incidents").click(function() {
                $(".card.incident").show();
                $(this).hide();
            })
        }
        if(this.locdat.showNoneMsg && notified == 0) {
            var str = '<div class="card incident nocolor">' +
                  '<div class="title">No incidents</div>' +
                  '<p>There are no incidents at this time. Lucky you!</p>' +
                  '</div>';
        }
        if(this.locdat.callback) this.locdat.callback(notified);
    },
    notify: function(inc) {
        console.info("Notifying incident:", inc);
        var lines = "", text = "";
        for(var i=0; i<inc.lines.length; i++) {
            if(inc.lines[i] != null && typeof metro.lines[inc.lines[i]] != 'undefined') {
                lines += metro.lines[inc.lines[i]].name + ", ";
            }
        }
        lines = lines.substring(0, lines.length - 2);
        if(inc.lines.length == 1) lines = ": "+lines+" Line";
        else lines = ": "+lines+" Lines";
        if(typeof this.locdat.linesinfo != 'undefined') {
            // Show description of why affected by line
            var stns = "";
            for(var i=0; i<inc.lines.length; i++) {
                var l = inc.lines[i];
                var sts = this.locdat.linesinfo[l];
                if(typeof sts != 'undefined') {
                    for(var j=0; j<sts.length; j++) {
                        stns += sts[j].name + ", ";
                    }
                }
            }
            stns = stns.substring(0, stns.length - 2);
            lines += " (" + stns + ")";
        }
        if(inc.Description != null) {
            text += inc.Description;
        }
        var str = '<div class="card incident">' +
                  '<div class="title">' + inc.IncidentType + lines + '</div>' +
                  '<p>' + text + '</p>' +
                  '</div>';
        $(".contents").prepend(str);
    }
};