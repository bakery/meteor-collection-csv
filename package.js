Package.describe({
  name: 'thebakery:collection-csv',
  version: '0.1.0',
  summary: 'Serialize Mongo collections to CSV strings'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');

  api.use(['underscore','check'],'server');
  api.addFiles('collection-csv.js','server');
  api.export('CollectionToCSV');
});

Package.onTest(function(api) {
  api.use(['tinytest','mongo','underscore', 
    'practicalmeteor:sinon','thebakery:collection-csv'
  ]);
  api.addFiles('tests/collection-csv-tests.js');
});

Npm.depends({
  'csv-stringify': '0.0.8'
});