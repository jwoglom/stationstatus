between = {
    data: {},
    fill: function(from, to, cb) {
        $.get("tools/between.php", {from: from, to: to}, function(d) {
            var j = JSON.parse(d);
            if(typeof between.data[from] == 'undefined') between.data[from] = {};
            between.data[from][to] = j;
            if(cb) cb();
        }, "text");
    },
    fare: function(from, to) {
        if(typeof this.data[from] != 'undefined' || this.data[from][to] != 'undefined') {
            var obj = this.data[from][to];
        return obj['RailFare'][this.isPeak() ? 'PeakTime' : 'OffPeakTime'];
        }
    },
    isPeak: function() {
        var now = new Date();
        var day = now.getDay();
        var hr = now.getHours();
        var min = now.getMinutes();
        var wkday = day > 0 && day < 6;
        var wdopening = wkday && hr >= 5 && (hr <= 9 && min <= 30); // weekday opening to 9:30 am
        var wdclosing = wkday && hr >= 3 && hr < 7; // weekday 3-7 pm
        var weclosing = !wkday && hr < 5; // weekends midnight-closing

        return wdopening || wdclosing || weclosing;
    },
    formatMoney: function(number) {
        var number = number.toString(), 
        dollars = number.split('.')[0], 
        cents = (number.split('.')[1] || '') +'00';
        dollars = dollars.split('').reverse().join('')
            .replace(/(\d{3}(?!$))/g, '$1,')
            .split('').reverse().join('');
        return '$' + dollars + '.' + cents.slice(0, 2);
    }
    
}