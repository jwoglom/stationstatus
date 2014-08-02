allstations = {
    init: function() {
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
            this.add(stns[i]);
        }
        $(".loading").hide();
        console.debug("Sorted in "+(+new Date - st)+"ms");
        search.checkQuery();
    },
    add: function(st) {
        var str = '<li class="card' + (st.transfer ? ' transfer' : '') + '" data-station="' + st.code + '" data-lines="" onclick="return allstations.click.bind(this)()">\n' +
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
        $(".contents ul.allstations").append(str);
    },
    click: function() { // binded: this=object
        var st = $(this).attr("data-station");
        console.info("CLICK: "+st);
        setTimeout(function() {
            location.href = "ui-station.html#id=" + st;
        }, 400);
    }
};