"use strict";
(function() {

    window.App = {};


    function formatGraphData(options) {
        return _.map(options, function(option) {
            var oi = parseInt(option.oi, 10);
            var strike = parseFloat(option.s);
            return [ strike, oi];
        });
    }


    window.App.renderOptionGraph= function(optionData) {

        console.log(optionData);

        var exp     = optionData.exp || "";
        var matches = exp.match(/(\d{2})(\d{2})(\d{2})/) || [];
        var year    = matches[1] ? "20" + matches[1] : "n/a";
        var month   = matches[2] || "n/a";
        var day     = matches[3] || "n/a";

        var formattedExp = [month, day, year].join("/");

        var titleLabel = "Open Interest for " + optionData.symbol;
        var expLabel   = "Maturity " + formattedExp;

        var calls = formatGraphData(optionData.calls);
        var puts = formatGraphData(optionData.puts);

        $('#container').highcharts({
            title: {
                text: titleLabel
            },

            subtitle: {
                text: expLabel
            },

            xAxis: {
                labels: {
                    formatter: function() {
                        return '$' + Highcharts.numberFormat(this.value, 2);
                    }
                }
            },
            tooltip: {
                shared: true,
                crosshairs: true
            },

            series: [
                { data : calls, name :'Call OI' },
                { data : puts, name :'Put OI' }
            ]
        });




    };


})();