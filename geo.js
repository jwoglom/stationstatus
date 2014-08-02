var geo = {
    savedPosition: null,
    getPosition: function(cb) {
        if(!!navigator.geolocation) {
            var st = +new Date;
            navigator.geolocation.getCurrentPosition(function(pos) {
                this.savePosition(pos, cb);
                console.debug("Retrieved in "+(+new Date - st)+"ms");
            }.bind(geo));
        } else {
            console.err("Geolocation is not supported.");
        }
    },
    savePosition: function(pos, cb) {
        this.savedPosition = pos;
        console.info("Position: "+pos.coords.latitude+","+pos.coords.longitude)
        if(cb) cb(this.savedPosition);
    },
    getMapsURLGeoloc: function(savedpos, zm, sz) {
        if(!savedpos) savedpos = this.savedPosition;
        return this.getMapsURL(savedpos.coords.latitude, savedpos.coords.longitude, zm, sz);
    },
    getMapsURL: function(lat, long, zm, sz) {
        if(!zm) zm = 13;
        if(!sz) sz = "584x150";
        return "http://maps.googleapis.com/maps/api/staticmap?center="+lat+","+long+"&zoom="+zm+"&size="+sz;
    },
    updateTripMap: function() {
        if(this.savedPosition) {
            this.mapsURL = this.getMapsURLGeoloc(this.savedPosition, 14);
            $(".card.trip").attr("style", "background-image: url('" + this.mapsURL + "')");
            this.tripMapUpdated = true;
        } else console.debug("No position for trip map")
    }
}
