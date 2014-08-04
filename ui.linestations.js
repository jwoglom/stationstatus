linestations = {
    init: function() {
        if(location.hash.indexOf('line=') != -1) {
            this.id = location.hash.split('line=')[1];
            this.id = this.id.split('&')[0];
            this.initLine(this.id.toUpperCase());
        } else {
            console.error("No line given");
            $(".contents > ul.allstations").html("<center>No line given</center>");
            return
        }
    },
    initLine: function(lin) {
        var st = +new Date;
        var stns = [];
        if(typeof metro.lines[lin] == 'undefined') {
            console.error("Invalid line: "+lin);
            $(".contents > ul.allstations").html("<center>Invalid line: "+lin+"</center>");
            return;
        }

        var line = metro.lines[lin];
        for(var i=0; i<line.route.length; i++) {
            this.add(line.route[i]);
        }
        $(".loading").hide();
        console.debug("Sorted in "+(+new Date - st)+"ms");

        console.info("Showing "+line.name+" Line");
        $(".header .title").html(line.name+" Line");
        $(".header").css("background-color", "#"+metro.colors[line.code]);
        if(~$.inArray(line.code, metro.colorsBlack)) {
            $(".header .title").css("color", "black");
        }

        if(typeof incidents != 'undefined') {
            incidents.check({
                lines: [lin]
            });
        }

        assign(".card.seearrivals .bottom-button", "ui-trains.html#line="+lin);

        if(typeof search != 'undefined') search.checkQuery();
    },
    add: function(st) {
        var str = '<li class="card' + (st.transfer ? ' transfer' : '') + '" data-name="' + st.name + '" data-station="' + st.code + '" data-lines="" onclick="return linestations.click.bind(this)()">\n' +
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
        setTimeout(function() {
            location.href = "ui-station.html#station=" + st;
        }, 400);
    }
};