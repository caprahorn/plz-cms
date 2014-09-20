var CoreHub = function () {
  'use strict';

  var Mongo = require('mongodb').MongoClient,
      Mailer = require('nodemailer'),
      Api = require('./core.api');

  var _databases = {},
      _mailers = {};
  
  function configure(options, callback) { 
    if(validConfiguration(options, callback) === false) {
      throw new Error('Malformed configuration options');
    }

    Mongo.connect(options.database.default.uri, function (error, database) {
      if(error) { callback(true); return; }
      
      addDatabase('default', database);
      setDatabases(options.database);
      setTransporters(options.mailer);

      callback(false, getApi(options));
    });
  }

  function validConfiguration(options, callback) {
    if(options === 'undefined' ||
       typeof options.database.default.uri !== 'string' ||
       typeof options.mailer.default !== 'object' ||
       typeof callback !== 'function') {

      return false;
    }

    return true;
  }

  function setDatabases(databases) {
    for(var name in databases) {
      if(databases.hasOwnProperty(name)) {
        if(name !== 'default') {
          setDatabase(name, databases[name].uri);
        }
      }
    }
  }

  function setDatabase(name, uri) {
    Mongo.connect(uri, function (error, database) {
      if(error) {
        console.log('DB connection error'); 
        return;
      }

      addDatabase(name, database);
    });
  }

  function addDatabase(name, database) {
    _databases[name] = database; 
  }

  function getDatabase(name) {
    if(name !== 'undefined') {
      return _databases.default;
    }

    return _databases[name];
  }

  function setTransporters(transporters) {
    for(var name in transporters) {
      if(transporters.hasOwnProperty(name)) {
        setTransporter(name, transporters[name]);
      }
    }
  }

  function setTransporter(name, config) {
    var transporter = Mailer.createTransport({
        service: config.service,
        auth: {
            user: config.email,
            pass: config.password
        }
    });
    
    addTransporter(name, transporter);
  }

  function addTransporter(name, transporter) {
    _mailers[name] = transporter;
  }

  function getMailer(name) {
    if(name !== 'undefined') {
      return _mailers.default;
    }
    
    return _mailers[name];
  }

  function getApi(modules) {
    var api = {
      get: {
        mailer: getMailer,
        database: getDatabase
      }
    };

    return Api.registerModules(modules, api);
  }

  return {
    configure: configure
  };
};

module.exports = CoreHub();