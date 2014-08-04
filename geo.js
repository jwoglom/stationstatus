var geo = {
    savedPosition: null,
    getPosition: function(cb) {
        if(!!navigator.geolocation) {
            var st = +new Date;
            console.info("Querying position..");
            navigator.geolocation.getCurrentPosition(function(pos) {
                geo.savePosition(pos, cb);
                console.info("Retrieved position in "+(+new Date - st)+"ms");
                console.info("Position: "+pos.coords.latitude+","+pos.coords.longitude);
            }.bind(geo));
        } else {
            console.error("Geolocation is not supported.");
        }
    },
    savePosition: function(pos, cb) {
        this.savedPosition = pos;
        if(cb) cb(this.savedPosition);
    },
    getMapsURLGeoloc: function(savedpos, zm, sz) {
        if(!savedpos) savedpos = this.savedPosition;
        return this.getMapsURL(savedpos.coords.latitude, savedpos.coords.longitude, zm, sz);
    },
    getMapsURL: function(lat, long, zm, sz) {
        if(!zm) zm = 13;
        if(!sz) sz = "640x640";
        return "http://maps.googleapis.com/maps/api/staticmap?center="+lat+","+long+"&zoom="+zm+"&size="+sz;
    },
    tempTripMap: function() {
        if(typeof localStorage != 'undefined' && typeof localStorage.pos != 'undefined') {
            var pos = localStorage.pos.split(",");
            this.setMap(this.getMapsURL(pos[0], pos[1]), 12);
        }
    },
    updateTripMap: function() {
        if(this.savedPosition) {
            this.mapsURL = this.getMapsURLGeoloc(this.savedPosition, 14);
            this.setMap(this.mapsURL);
            this.tripMapUpdated = true;
        } else console.debug("No position for trip map")
    },
    setMap: function(url) {
        $(".card.trip").attr("style", "background-image: url('" + url + "')");
    },
    geocode: function(loc, cb) {
        $.get("http://maps.google.com/maps/api/geocode/json", {
            address: loc
        }, function(d) {
            var json = JSON.parse(d);
            var res = json["results"];
            if(res.length > 0) {
                res = res[0];
                var coords = res.geometry.location; // {lat, lng}
                var addr = res.formatted_address;
                cb(coords, addr);
            } else {
                cb(false, loc);
            }
        }, "text");
    }
}
