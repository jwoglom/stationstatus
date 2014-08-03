incidents = {
    data: null,
    check: function() {
        WMATA.getdynamic(function() {
            this.data = WMATA.dynamic["incidents"];
        })
    }  
};