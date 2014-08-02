d = function(t) { console.debug("*"+t); }

WMATA = {
    params: {
        "format": "json"
    },
    blob: {},
    // Run a modified jQuery.get
    getblob: function(cb) {
        var ths = this;
        $.get("data/blob.txt", {}, function(ret) {
            ths.blob = JSON.parse(ret);
            cb();
        }, "text");
    },
    unblob: function(name, cb) {
        cb(this.blob[name]);
    }
}


Rail = function(params) {
    this.name = params.DisplayName,
    this.lines = {},
    this.stations = {},
    this.colors = {
        "OR": "DD8602",
        "SV": "A0A2A0",
        "BL": "0993D5",
        "YL": "F6D316",
        "RD": "BF1237",
        "GR": "00AF51"
    },
    this.addLine = function(line) {
        var cd = line.code;
        this.lines[cd] = line;
    },
    this.getLine = function(cd) {
        return this.lines[cd];
    },
    this.fill = function() {
        this.fillLines();
        this.fillStations();
        this.fillRoutes();
    },
    this.fillLines = function() {
        var lines = WMATA.blob.lines;
        this.linesJSON = lines;
        for(key in lines) {
            var line = lines[key];
            var obj = new Line(line);
            this.addLine(obj);
        }
    },
    this.getLineRoute = function(line) {
        var route = WMATA.blob["path-"+line.codes.start+"-"+line.codes.end];
        d("Calculating "+line+" route");
        this.calcLineRoute(line, route);
    },
    this.calcLineRoute = function(line, paths) {
        var last = null, last2 = null;
        for(key in paths) {
            var path = paths[key];
            var st = this.stations[path.StationCode];
            var ln = path.LineCode;
            this.lines[ln].route.push(st);
            st.pos[ln] = path.SeqNum;
            st.dist[ln] = path.DistanceToPrev;
            if(last != null) {
                last.next[ln] = st;
                st.prev[ln] = last;
            } else {
                st.prev[ln] = false; // First station
            }
            last2 = last; last = st;
        }
        if(last != null) {
            last.prev[ln] = last2;
            last.next[ln] = false; // Last station
        }
    },
    this.fillRoutes = function() {
        for(key in this.lines) {
            var line = this.lines[key];
            this.getLineRoute(line);
            console.log(line);
        }
    },
    this.addStation = function(station) {
        var cd = station.code;
        this.stations[cd] = station;
    },
    this.getStation = function(cd) {
        return this.stations[cd];
    },
    this.fillStations = function(cb) {
        var stations = WMATA.blob.stations;
        for(key in stations) {
            var station = stations[key];
            var obj = new Station(station);
            this.addStation(obj);
        }
        // Must be run after all stations have been created
        // Use the new object of station objects, this.stations
        // instead of the local var stations
        for(key in this.stations) {
            this.addStationGroupings(this.stations[key]);
        }
    },
    this.addStationGroupings = function(station) {
        var tot = 0;
        var lns = station.lineIDs;
        for(var i=0; i<lns.length; i++) {
            var ln = lns[i];
            if(ln != null) {
                d("Grouped "+station+" on "+this.lines[ln]);
                this.lines[ln].stations[station.code] = station;
                station.lines.push(this.lines[ln]);
                station.totalLines.push(this.lines[ln]);
                tot++;
            }
        }

        var tog = station.togetherIDs;
        for(var i=0; i<tog.length; i++) {
            var to = tog[i];
            if(to != null && to != "") {
                var nto = this.stations[to];
                d("Grouped "+station+" together with "+nto);
                station.together.push(nto);
                // Add the lines on the grouped station to
                // the totalLines of the current station
                for(var j=0; j<nto.lineIDs.length; j++) {
                    var ln = nto.lineIDs[j];
                    if(this.lines[ln]) {
                        station.totalLines.push(this.lines[ln]);
                    }
                }
                tot++;
            }
        }

        var crds = WMATA.blob["coords"];
        if(typeof crds[station.code] != 'undefined') {
            var crd = crds[station.code];
            var parts = crd.split(",");
            station.coords = {
                "str": crd,
                "lat": parts[0],
                "long": parts[1]
            };
            d("Added coordinates for "+station);
        }

        station.transfer = (tot > 1);
    };
};

Rail.prototype = {
    toString: function() {
        return this.name+" ("+this.code+")";
    }
};

Line = function(params) {
    this.name = params.DisplayName,
    this.code = params.LineCode,
    this.codes = {
        start: params.StartStationCode,
        end: params.EndStationCode,
        intstart: params.InternalDestination1, // Alternative start
        intend: params.InternalDestination2 // Alternative end
    },
    this.stations = {}, // Object of stations by code
    this.route = []; // Array of stations in order
    d("Created Line "+this);
};

Line.prototype = {
    toString: function() {
        return this.name+" ("+this.code+")";
    }
};

Station = function(params) {
    this.name = params.Name,
    this.code = params.Code,
    this.transfer = false,
    this.totalLines = [],
    this.together = [], // Array of station objects
    this.togetherIDs = [
        params.StationTogether1,
        params.StationTogether2
    ],
    this.lines = [], // Array of line objects
    this.lineIDs = [
        params.LineCode1,
        params.LineCode2,
        params.LineCode3,
        params.LineCode4
    ],
    this.location = [
        params.Lat,
        params.Lon
    ],
    this.dist = {}, // Distance to previous station, by line
    this.pos = {},  // Order placement, by line
    this.prev = {}, // Object of station objects, by line
    this.next = {}; // Object of station objects, by line
    d("Created Station "+this);
};

Station.prototype = {
    toString: function() {
        return this.name+" ("+this.code+")";
    }
};