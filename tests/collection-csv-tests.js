/* globals stubs: false, CollectionToCSV: false */
/* jshint maxlen: 120 */

if(Meteor.isClient){
  Tinytest.add('toCSV is NOT available on the client', function (test) {
    test.isUndefined(CollectionToCSV);
  });
} else {

  var stubCollection = function(data){
    var collection = new Mongo.Collection(null);
    var cursor = new Mongo.Collection.Cursor();
    var findStub = stubs.create('Collection.find', collection, 'find');
    var fetchStub = stubs.create('Cursos.fetch', cursor, 'fetch');

    findStub.returns(cursor);
    fetchStub.returns(data);

    return collection;
  };

  Tinytest.add('CollectionToCSV.toCSV is available on the server', function (test) {
    test.isNotUndefined(CollectionToCSV);
    test.isNotUndefined(CollectionToCSV.toCSV);    
  });

  Tinytest.add('toCSV deduces column header names', function(test){
    var collection = stubCollection([{ name : 'name', age : 22 }]);
    test.matches(CollectionToCSV.toCSV(collection.find()),/name,age\nname,22/);
    stubs.restoreAll();
  });

  Tinytest.add('toCSV returns an empty string for a an empty dataset', function(test){
    var collection = stubCollection([]);
    test.equal(CollectionToCSV.toCSV(collection.find()),'');
    stubs.restoreAll();
  });

  Tinytest.add('toCSV support headers that are arrays or objects', function(test){
    var collection = stubCollection([]);

    test.equal(CollectionToCSV.toCSV(collection.find()),'');
    test.equal(CollectionToCSV.toCSV(collection.find(),['a','b']),'');
    test.equal(CollectionToCSV.toCSV(collection.find(),{ a : 'A', b: 'B'}),'');

    test.throws(function(){
      CollectionToCSV.toCSV(collection.find(),'hello');
    });
    test.throws(function(){
      CollectionToCSV.toCSV(collection.find(),1);
    });

    stubs.restoreAll();
  });

  Tinytest.add('toCSV only returns specified headers when headers param is set', function(test){
    var collection = stubCollection([
      { _id: '1', name: 'name1', age: 20 },
      { _id: '2', name: 'name2', age: 21 },
      { _id: '3', name: 'name3', age: 22 }
    ]);
    test.matches(CollectionToCSV.toCSV(collection.find(),['name','age']),
      /name,age\nname1,20\nname2,21\nname3,22/);
    stubs.restoreAll();
  });

  Tinytest.add('toCSV supports header mapping', function(test){
    var collection = stubCollection([
      { _id: '1', name: 'name1', age: 20 },
      { _id: '2', name: 'name2', age: 21 },
      { _id: '3', name: 'name3', age: 22 }
    ]);
    var headerMapping = {
      name : 'First Name',
      age : 'Person\'s age'
    };

    test.matches(CollectionToCSV.toCSV(collection.find(),headerMapping),
      /First Name,Person's age\nname1,20\nname2,21\nname3,22/);
    stubs.restoreAll();
  });

  Tinytest.add('toCSV supports transforms', function(test){
    var collection = stubCollection([
      { name: 'name1', age: 20 },
      { name: 'name2', age: 21 },
      { name: 'name3', age: 22 }
    ]);

    var transform = function(row){
      return _.extend(row, {
        computed : [row.name,row.age].join('-')
      }); 
    };

    test.matches(CollectionToCSV.toCSV(collection.find(),transform),
      /name,age,computed\nname1,20,name1-20\nname2,21,name2-21\nname3,22,name3-22/);
    stubs.restoreAll();
  });

  Tinytest.add('csv transforms play nicely with header mapping', function(test){
    var collection = stubCollection([
      { name: 'name1', age: 20 },
      { name: 'name2', age: 21 },
      { name: 'name3', age: 22 }
    ]);
    var headerMapping = {
      name : 'First Name',
      age : 'Person\'s age',
      computed : 'Computed field'
    };

    var transform = function(row){
      return _.extend(row, {
        computed : [row.name,row.age].join('-')
      }); 
    };

    test.matches(CollectionToCSV.toCSV(collection.find(), headerMapping, transform),
      /First Name,Person's age,Computed field\nname1,20,name1-20\nname2,21,name2-21\nname3,22,name3-22/);
    stubs.restoreAll();
  });

  Tinytest.add('toCSV omits fields that are functions', function(test){
    var collection = stubCollection([
      { name: 'name1', age: 20, prettyName: function(){ throw new Error('bad implementation'); } },
      { name: 'name2', age: 21, prettyName: function(){ throw new Error('bad implementation'); } },
      { name: 'name3', age: 22, prettyName: function(){ throw new Error('bad implementation'); } }
    ]);
    
    test.matches(CollectionToCSV.toCSV(collection.find()),
      /name,age\nname1,20\nname2,21\nname3,22/);
    stubs.restoreAll();
  });

  Tinytest.add('toCSV skips rows where transforms return null', function(test){
    var collection = stubCollection([
      { name: 'name1', age: 20 },
      { name: 'name2', age: 21 },
      { name: 'name3', age: 22 }
    ]);
    
    var transform = function(row){
      return row.age > 20 ? row : null;
    }; 

    test.matches(CollectionToCSV.toCSV(collection.find(),transform),
      /name,age\nname2,21\nname3,22/);
    stubs.restoreAll();
  });
}