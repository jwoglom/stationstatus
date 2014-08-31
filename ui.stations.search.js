search = {
    init: function() {
        $(".search > input").keyup(search.check);
        $(".search .search-icon").click(function() {
            $(this).parent().addClass("open");
            setTimeout(function() {
                $(".search > input").focus();
            }, 400);
        }).hover(function() {
            setTimeout(function() {
                $(".search > input").focus();
            }, 400);
        }, function() {
            $(".search .search-icon").focus();
        });
        $(".header .title").css("cursor", "pointer").click(function() {
            if($(".search").hasClass("open")) {
                $(".search").removeClass("open");
            }
        })
    },
    check: function() { // binded: this=object
        search.query($(this).val());
        if($(this).val().trim().length <= 1) {
            $(this).parent().removeClass("open");
        } else {
            $(this).parent().addClass("open");
        }
    },
    query: function(q, dir) {
        var st = +new Date;
        console.debug("Search: "+q);
        $c = $(".contents ul.allstations .card");
        var trues = [];
        q = q.trim();

        // Only run with all stations
        if(typeof linestations == 'undefined') {
            $(".header .title").css("color", "");
            title("All Stations");
            $(".header").css("background-color", "");
            $(".card.seestdetail").hide();
        }

        if(q.length == 0) {
            $c.show();
            return;
        }

        // Only run with all stations
        if(typeof linestations == 'undefined') {
            for(linecode in metro.lines) {
                var line = metro.lines[linecode];
                var parts = q.toLowerCase().split(" ");
                for(var i=0; i<parts.length; i++) {
                    if(parts[i] == line.name.toLowerCase() || parts[i] == linecode.toLowerCase()) {
                        console.info("Showing "+line.name+" Line");
                        title(line.name+" Line");
                        $(".header").css("background-color", "#"+metro.colors[linecode]);
                        if(~$.inArray(line.code, metro.colorsBlack)) {
                            $(".header .title").css("color", "black");
                        }
                        $(".card.seestdetail span").html(line.name);
                        $(".card.seestdetail").attr("data-line", linecode).css("color", "#"+metro.colors[linecode]).click(function() {
                            var ln = $(this).attr("data-line");
                            setTimeout(function() {
                                location.href = "ui-line.html#line="+ln;
                            }, 400);
                        }).show();
                        break;
                    }
                }
            }
        }

        $c.each(function() {
            if(search.test.bind(this)(q)) {
                $(this).show();
                try {
                    trues.push(metro.stations[$(this).attr("data-station")]);
                } catch(e) {}
            } else {
                $(this).hide();
            }
        });
        if(trues.length == 0) {
            $(".contents ul.allstations .none").show();
        } else {
            $(".contents ul.allstations .none").hide();
        }
        // Add line ID in querystring if applicable
        location.hash = "#"+(typeof linestations != 'undefined' ? "line="+linestations.id+"&" : "")+"q=" + q;
        console.info("Query took "+(+new Date - st)+"ms", trues);
    },
    test: function(q) {
        var stcode = $(this).attr("data-station");
        var st = metro.stations[stcode];
        q = q.toLowerCase();
        if(st) {
            if(st.name.toLowerCase().indexOf(q) != -1) return true;
            if(st.code.toLowerCase() == q) return true;
            for(var i=0; i<st.totalLines.length; i++) {
                var ln = st.totalLines[i];
                if(q == ln.name.toLowerCase() || q == ln.code.toLowerCase()) {
                    return true;
                }
            }
        }
        return false;
    },
    checkQuery: function() {
        if(location.hash.indexOf('q=') != -1) {
            var q = location.hash.split('q=')[1];
            q = q.split('&')[0];
            console.info("Searching from querystring: "+q);
            this.query(q, true);
            $(".search").addClass("open");
            $(".search > input").val(q);
        }
    }
};