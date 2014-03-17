
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var yql = require('yql');
var mongo = require('./src/mongo');
var $ = require('cheerio');
var request = require('request');


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);


app.get('/optionExp', function(req, res) {
    var q = req.query || {};
    var symbol = q.symbol || "";

    var url ="http://investing.money.msn.com/investments/equity-options?symbol=" + symbol;
    request(url, function(err, resp, html) {
        var parsedHTML = $.load(html)
        var expirations = []
        parsedHTML('.cotb.cf li')
            .each(function(index, el){
                expirations.push(($(el).text().trim()));
            });
        console.log(expirations);
        res.send(expirations);
    });

});



app.get('/options', function(req, res) {

    var q = req.query;
    var symbol = q.symbol;
    var expiration = q.exp;

    yql.exec("SELECT * FROM yahoo.finance.options WHERE symbol=@symbol AND expiration=@expiration",
        function(yqlResponse) {
            console.log(JSON.stringify(yqlResponse, null, 3));
            res.send(yqlResponse);
        }, {
            symbol: symbol,
            expiration: expiration
        }
    );


});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


//yql.exec("SELECT * FROM yahoo.finance.option_contracts WHERE (symbol=@symbol)",
//    function(response) {
//        console.log(JSON.stringify(response, null, 3));
//    }, {symbol: 'AAPL'});

//yql.exec("SELECT * FROM yahoo.finance.options WHERE symbol=@symbol AND expiration=@expiration",
//    function(response) {
//        console.log(JSON.stringify(response, null, 3));
//    }, {
//        symbol: 'GOOG',
//        expiration: '2014-03'
//    });
