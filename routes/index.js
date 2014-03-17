"use strict";

var yql = require('yql');
var _   = require('underscore');
var mongo = require('../src/mongo');


exports.index = function(req, res){

    var q = req.query;
    var symbol = q.symbol;
    var expiration = q.exp;

    var params = {
        symbol: symbol,
        expiration: expiration
    };

    mongo.loadOptions( {exp: expiration.replace(/-/g,'').substr(2,6)}, function(optionResults){

        console.log(optionResults);

        if(optionResults && optionResults.length > 0) {
            var optionData = optionResults[0];
            res.render('index', {params: params, optionData: optionData});
        } else {
            yql.exec("SELECT * FROM yahoo.finance.options WHERE symbol=@symbol AND expiration=@expiration",
                function(yqlResponse) {

                    console.log(JSON.stringify(yqlResponse, null, 3));

                    var expiration = params.expiration.replace(/-/g,'').substr(2,6);

                    var optionData = getOptionData({
                        symbol: params.symbol,
                        expiration: expiration
                    }, yqlResponse);
                    console.log(JSON.stringify(optionData, null, 3));

                    mongo.saveOptionMonth(optionData);

                    res.render('index', {params: params, optionData: optionData[expiration]});

                }, {
                    symbol: params.symbol,
                    expiration: params.expiration.substr(0,7)
                }
            );

        }
    });
}




function getOptionData(params, yqlResponse) {
    var exp = params.expiration;
    var symbol = params.symbol;

    var regex = new RegExp("^" + symbol + "(" + exp.substr(0,4)  + "\\d\\d)");

    var expirations = {};

    var results = yqlResponse.query.results;

    if(results && results.optionsChain && results.optionsChain.option) {
        var options = results.optionsChain.option || [];

        _.each(options, function(option) {
            var longSymbol = option.symbol || "";
            var matches = longSymbol.match(regex);
            if(matches && matches.length > 1) {
                var date = matches[1];

                if(!expirations[date]) {
                    expirations[date] = {
                        calls: [],
                        puts: [],
                        exp: date,
                        symbol: symbol
                    };
                }

                var expiration = expirations[date];

                var optionItem = {
                    s: parseFloat(option.strikePrice),
                    p:  parseFloat(option.lastPrice),
                    bid:  parseFloat(option.bid),
                    ask:  parseFloat(option.ask),
                    vol: parseInt(option.vol,10) || 0,
                    oi: parseInt(option.openInt,10) || 0,
                    id: longSymbol
                };

                if(option.type == "C") {
                    expiration.calls.push(optionItem);
                } else if (option.type == "P") {
                    expiration.puts.push(optionItem);
                }



            }

        });

//        var sortOptions = function  (a,b) {
//            return a.s - b.s;
//        };
//
//        optionData.calls = optionData.calls.sort(sortOptions);
//        optionData.puts = optionData.puts.sort(sortOptions);

    }

    return expirations;
}

