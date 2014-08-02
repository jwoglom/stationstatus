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
        if(q.length == 0) {
            $c.show();
            return;
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
        location.hash = "#line="+linestations.id+"&q=" + q;
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