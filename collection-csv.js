/* globals CollectionToCSV : true */

var stringify = Npm.require('csv-stringify');

CollectionToCSV = {
  toCSV : function(cursor, arg1, arg2){
    check(cursor, Match.Where(function(x){
      return _.isFunction(x.fetch);
    }));

    var data = cursor.fetch();    
    var rows = [];
    var transform = arg2 ? arg2 :
      (_.isFunction(arg1) ? arg1 : undefined); 
    var headers = arg1  && !_.isFunction(arg1) ? arg1 : undefined; 

    check(headers,Match.Optional(Match.OneOf([String], Object)));
    check(transform, Match.Optional(Function));

    // augment data when transform is available
    if(transform){
      data = _.map(data, transform);
      data = _.filter(data, function(d){
        return d;
      });
    }

    if(data.length === 0){
      return '';
    }

    // do not let functions in as field values
    data = _.map(data, function(d){
      var basicFields = _.filter(_.keys(d), function(k){
        return !_.isFunction(d[k]);
      });
      return _.pick(d,basicFields);
    });

    var headersToUse = headers ?
      (_.isArray(headers) ? headers : _.keys(headers)) : _.keys(data[0]);

    if(headers){
      rows.push(_.isArray(headers) ? headersToUse : _.values(headers));
    } else {
      rows.push(headersToUse);
    }

    _.each(data, function(d){
      var row = [];
      _.each(headersToUse, function(h){
        row.push(d[h]);
      });
      rows.push(row);
    });

    return Meteor.wrapAsync(this.stringify).call(this,rows);    
  },

  stringify : function(data, callback){
    return stringify(data, function(err,output){
      if(err) {
        throw new Error(err.message);
      } else {
        callback.call(this,null,output);  
      }
    });
  }
};