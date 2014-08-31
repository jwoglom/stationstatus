tripselect = {
    from: null,
    to: null,
    init: function() {
        if(location.hash.indexOf('from=') != -1) {
            this.from = location.hash.split('from=')[1];
            this.from = this.from.split('&')[0];
            if(location.hash.indexOf('to=') != -1) {
                this.to = location.hash.split('to=')[1];
                this.to = this.to.split('&')[0];
                this.three();
            } else {
                this.two();
            }
        } else {
            this.start();
        }
    },
    start: function() {
        var st = +new Date;
        var stns = [];
        for(code in metro.stations) {
            stns.push(metro.stations[code]);
        }
        // Sort alphabetically
        stns.sort(function(a, b) {
            return a.name > b.name ? 1 : -1;
        });
        for(var i=0; i<stns.length; i++) {
            if(stns[i].code != this.from) {
                this.add(stns[i]);
            }
        }
        $(".loading").hide();
        console.debug("Sorted in "+(+new Date - st)+"ms");
        title("Navigate from:");
        search.checkQuery();
    },
    two: function() {
        // Show same list of stations
        this.start();
        title("Navigate to:");
    },
    add: function(st) {
        var str = '<li class="card' + (st.transfer ? ' transfer' : '') + '" data-name="' + st.name + '" data-station="' + st.code + '" data-lines="" onclick="return tripselect.click.bind(this)()">\n' +
                  st.name + '\n' +
                  '<div class="lines">\n';
        for(var i=0; i<st.totalLines.length; i++) {
            var ln = st.totalLines[i];
            str +='<span class="' + ln.code.toLowerCase() + '">' + ln.code + '</span>\n';
            str = str.replace('data-lines="', 'data-lines=",' + ln.code);
        }
        str +=    '</div>\n</li>';
        // Remove leading , in lines list
        str = str.replace('data-lines=",', 'data-lines="');
        if($(".contents ul.allstations [data-name=\""+st.name+"\"]").length > 0) {
            // Prevent duplicate Metro Center or L'Enfant Plaza
            console.debug("Not showing duplicate "+st.name);
            return;
        }
        $(".contents ul.allstations").append(str);
    },
    click: function() { // binded: this=object
        var st = $(this).attr("data-station");
        console.info("CLICK: "+st);
        if(tripselect.from == null) {
            var url = "./ui-tripselect.html#from=" + st;
            setTimeout(function() {
                location.href = url;
                location.reload();
            }, 400);
        } else {
            var url = "./ui-trip.html#from=" + tripselect.from + "&to=" + st;
            setTimeout(function() {
                location.href = url;
            }, 400);
        }

        
    }
};