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
    getMapsURL: function(pos, zm, sz) {
        if(!pos) pos = this.savedPosition;
        if(!zm) zm = 13;
        if(!sz) sz = "584x150";
        return "http://maps.googleapis.com/maps/api/staticmap?center="+pos.coords.latitude+","+pos.coords.longitude+"&zoom="+zm+"&size="+sz;
    },
    updateTripMap: function() {
        if(this.savedPosition) {
            this.mapsURL = this.getMapsURL(this.savedPosition, 14);
            $(".card.trip").attr("style", "background-image: url('" + this.mapsURL + "')");
            this.tripMapUpdated = true;
        } else console.debug("No position for trip map")
    }
}
