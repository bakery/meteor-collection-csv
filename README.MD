# Collection-CSV

Serialize collections to CSV

## Install

```
meteor add thebakery:collection-csv
```

## Use (server only)

Serialize all users in the system

```
CollectionToCSV.toCSV(Meteor.users.find())
```

Pick specific columns

```
CollectionToCSV.toCSV(Meteor.users.find(),['username','firstname']);
```

Give columns pretty names

```
CollectionToCSV.toCSV(Meteor.users.find(),{
  username : 'User Name',
  firstname : 'First Name'
});
```

Transform rows

```
CollectionToCSV.toCSV(Meteor.users.find(), function(row){
  return _.extend(row, {
    addedField: new Date()
  });
});
```

Transform rows + Pretty columns

```
CollectionToCSV.toCSV(Meteor.users.find(),{
  username : 'User Name',
  firstname : 'First Name',
  addedField : 'Date'
},function(row){
  return _.extend(row, {
    addedField: new Date()
  });
});
```