var mongoose = require( 'mongoose' );
var _ = require('underscore');
var moment = require('moment');

// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.
var mongo_uri_string = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/maxpain';

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(mongo_uri_string, function (err, res) {
    if (err) {
        console.log ('ERROR connecting to: ' + mongo_uri_string + '. ' + err);
    } else {
        console.log ('Succeeded connected to: ' + mongo_uri_string);
    }
});

//Schemas
var Options = new mongoose.Schema({
    symbol: String,
    calls: Array,
    puts: Array,
    expiry: Date,
    exp: String,
    recorded: Date
});

var OptionsModel = mongoose.model( 'Option', Options );


exports.loadOptions = function(query, callback) {

    return OptionsModel
        .find( query)
        .exec(function( err, results ) {
            if( !err ) {
                callback(results );
            } else {
                console.log( err );
                exit;
            }
        });



};

exports.saveOptionMonth = function(optionsArray) {

    _.each(optionsArray, function(optionsToSave, expiry) {

        optionsToSave.recorded = new Date();
        optionsToSave.expiry = moment(optionsToSave.exp, 'YYMMDD').toDate();

        var options = new OptionsModel(optionsToSave);
        options.save( function( err ) {
            if( !err ) {
                console.log( 'created:', expiry);
            } else {
                console.log( err );
            }
        });

    });

}
