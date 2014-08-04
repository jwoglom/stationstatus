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
                    this.notify(inc);
                }
            }

        }
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