var geo = {
    savedPosition: null,
    getPosition: function(cb) {
        if(!!navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(pos) {
                this.savePosition(pos, cb);
            }.bind(geo));
        } else {
            console.err("Geolocation is not supported.");
        }
    },
    savePosition: function(pos, cb) {
        this.savedPosition = pos;
        console.log("Position: "+pos.coords.latitude+","+pos.coords.longitude)
        if(cb) cb(this.savedPosition);
    },
    getMapsURL: function(pos, zm, sz) {
        if(!pos) pos = this.savedPosition;
        if(!zm) zm = 13;
        if(!sz) sz = "600x300";
        return "http://maps.googleapis.com/maps/api/staticmap?center="+pos.coords.latitude+","+pos.coords.longitude+"&zoom="+zm+"&size="+sz;
    },
    updateTripMap: function() {
        if(this.savedPosition) {
            this.mapsURL = this.getMapsURL(this.savedPosition, 14);
            $(".card.trip").attr("style", "background-image: url('" + this.mapsURL + "')");
            console.log("Maps: "+this.mapsURL);
            this.tripMapUpdated = true;
        } else console.debug("No position for trip map")
    }
}
$(function() {
    geo.getPosition(geo.updateTripMap.bind(geo));
});