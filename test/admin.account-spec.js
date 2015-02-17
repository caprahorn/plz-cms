'use strict';

require('should');

var Tc = require('./test-config');

var plz = require('../app/core.hub')(Tc.validAdminConfig),
    database = require('../app/utility.database')(plz);

describe('admin.account | Public API', function () {
  describe('plz.login.user()', function () {
    before(function (done) {
      plz.create.user(Tc.validUser, function () {
        done();
      });
    });

    it('should callback an error if getDocument fails', function (done) {
      var mockDatabase = {};

      mockDatabase.getDocument = function (query, callback) {
        callback(true, 'Mock failure');
      };

      require('../app/admin.account')(plz, mockDatabase);

      plz.login.user({}, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should return a user with matching email/password', function (done) {
      var login = {
        email: 'sender@example.com',
        password: 'someFakePass0'
      };

      plz.login.user(login, function (error, result) {
        error.should.be.false;
        result.should.be.type('object');
        done();
      });
    });

    it('should return an empty array if no match is found', function (done) {
      var login = {
        email: 'sender@example.com',
        password: 'someWrongPass0'
      };

      plz.login.user(login, function (error, result) {
        error.should.be.false;
        result.should.eql([]);
        done();
      });
    });

    afterEach(function () {
      plz = require('../app/core.hub')(Tc.validAdminConfig);
      database = require('../app/utility.database')(plz);
    });

    after(function (done) {
      database.getDatabase(function (error, db) {
        db.collection('user').drop(function () { done(); });
      });
    });
  });

  describe('plz.send.activation()', function () {
    var _user;

    before(function (done) {
      plz.create.user(Tc.validUser, function (error, result) {
        _user = result.data[0];
        done();
      });
    });

    it('should callback false on error', function (done) {
      var adminAccount = require('../app/admin.account')(plz);

      adminAccount.sendLink = function (options, callback) {
        callback(true, 'Mock Failure');
      };

      var options = {};

      plz.send.activation(options, function (error, result) {
        options.status.should.be.ok;
        error.should.be.true;
        result.should.be.a.String;
        done();
      });
    });

    it('should callback true on send success', function (done) {
      var adminAccount = require('../app/admin.account')(plz);

      adminAccount.sendLink = function (options, callback) {
        callback(false, 'Mock Success');
      };

      var options = {};

      plz.send.activation(options, function (error, result) {
        options.status.should.be.ok;
        error.should.be.false;
        result.should.be.a.String;
        done();
      });
    });

    afterEach(function () {
      plz = require('../app/core.hub')(Tc.validAdminConfig);
    });

    after(function (done) {
      database.getDatabase(function (error, db) {
        db.collection('user').drop(function () { done(); });
      });
    });
  });

  describe('plz.send.reset()', function () {
    var _user;

    before(function (done) {
      plz.create.user(Tc.validUser, function (error, result) {
        _user = result.data[0];
        done();
      });
    });

    it('should callback true on reset success', function (done) {
      var adminAccount = require('../app/admin.account')(plz);

      adminAccount.sendLink = function (options, callback) {
        callback(true, 'Mock failure');
      };

      var options = {};

      plz.send.reset(options, function (error, result) {
        options.status.should.be.ok;
        error.should.be.true;
        result.should.be.a.String;
        done();
      });
    });

    it('should callback true on reset success', function (done) {
      var adminAccount = require('../app/admin.account')(plz);

      adminAccount.sendLink = function (options, callback) {
        callback(false, 'Mock Success');
      };

      var options = {};

      plz.send.reset(options, function (error, result) {
        options.status.should.be.ok;
        error.should.be.false;
        result.should.be.a.String;
        done();
      });
    });

    afterEach(function () {
      plz = require('../app/core.hub')(Tc.validAdminConfig);
    });

    after(function (done) {
      database.getDatabase(function (error, db) {
        db.collection('user').drop(function () { done(); });
      });
    });
  });

  describe('plz.restrict.user()', function () {
    var user;

    before(function () {
      plz = require('../app/core.hub')(Tc.validAdminConfig);
    });

    it('should return true if a user has access', function (done) {
      var options = {
        user: user,
        roles: ['peasant', 'peon']
      };

      plz.restrict.user(options, function (error, access) {
        error.should.be.false;
        access.should.be.true;
        done();
      });
    });

    it('should return false if a user does not have access', function (done) {
      var options = {
        user: user,
        roles: ['admin']
      };

      plz.restrict.user(options, function (error, access) {
        error.should.be.false;
        access.should.be.false;
        done();
      });
    });
  });

  describe('plz.allow.user()', function () {
    var user;

    before(function () {
      plz = require('../app/core.hub')(Tc.validAdminConfig);
    });

    it('should return true if a user has access', function (done) {
      var options = {
        user: user,
        roles: ['admin']
      };

      plz.allow.user(options, function (error, access) {
        error.should.be.false;
        access.should.be.true;
        done();
      });
    });

    it('should return false if a user does not have access', function (done) {
      var options = {
        user: user,
        roles: ['super-admin']
      };

      plz.allow.user(options, function (error, access) {
        error.should.be.false;
        access.should.be.false;
        done();
      });
    });
  });
});

describe('admin.account | Private API', function () {
  var account, plz, mailer, database, mockDatabase, mockMailer;

  describe('sendLink()', function () {
    beforeEach(function () {
      plz = require('../app/core.hub')(Tc.validAdminConfig);
      database = require('../app/utility.database')(plz);
      mailer = require('../app/utility.mailer')(plz);

      mockDatabase = {};
      mockMailer = {};
    });

    it('should callback an error if db editDocument fails', function (done) {
      mockDatabase.editDocument = function (query, callback) {
        callback(true, 'Mock failure');
      };

      account = require('../app/admin.account')(plz, mockDatabase);

      var options = {
        user: {
          email: 'merlin@sonofamberandchaos.com',
        },
        status: 'pending',
        hash: 'aaaaaaaaaaddddddddddfffffffffffffff001233'
      };
      
      account.sendLink(options, function (error, result) {
        error.should.be.true;
        result.should.be.a.String;
        done();
      });
    });

    it('should callback an error if mailer fails', function (done) {
      mockDatabase.editDocument = function (query, callback) {
        callback(false, 'Mock DB Success');
      };

      mockMailer.sendMail = function (options, callback) {
        callback(true, 'Mock mail Failure');
      };

      account = require('../app/admin.account')(plz, mockDatabase);

      var options = {
        user: {
          email: 'merlin@sonofamberandchaos.com',
        },
        status: 'pending',
        hash: 'aaaaaaaaaaddddddddddfffffffffffffff001233'
      };
      
      account.sendLink(options, function (error, result) {
        error.should.be.true;
        result.should.be.a.String;
        done();
      });
    });

    it('should callback result if mailer succeeds', function (done) {
      mockDatabase.editDocument = function (query, callback) {
        callback(false, 'Mock DB success');
      };

      mockMailer.sendMail = function (options, callback) {
        callback(false, 'Mock mailer success');
      };

      account = require('../app/admin.account')(plz, mockDatabase, mockMailer);

      var options = {
        user: {
          email: 'merlin@sonofamberandchaos.com',
        },
        status: 'pending',
        hash: 'aaaaaaaaaaddddddddddfffffffffffffff001233',
        subject: 'Hi, Corwin',
        body: '...Are you really my father or is it some elaborate plot?'
      };
      
      account.sendLink(options, function (error, result) {
        error.should.be.false;
        result.should.be.a.String;
        done();
      });
    });
  });

  describe('authorize()', function () {
    beforeEach(function () {
      plz = require('../app/core.hub')(Tc.validAdminConfig);
      database = require('../app/utility.database')(plz);
      mockDatabase = {};
    });

    it('should callback an error if db getDocument fails', function (done) {
      mockDatabase.getDocument = function (query, callback) {
        callback(true, false);
      };

      account = require('../app/admin.account')(plz, mockDatabase);

      var options = {
        email: 'merlin@sonofamberandchaos.com',
        hash: 'aaaaaaaaaaddddddddddfffffffffffffff001233'
      };
      
      account.authorize(options, function (error, result) {
        error.should.be.true;
        result.should.be.false;
        done();
      });
    });

    it('should callback an error if result is empty', function (done) {
      mockDatabase.getDocument = function (query, callback) {
        callback(false, []);
      };

      account = require('../app/admin.account')(plz, mockDatabase);

      var options = {
        email: 'merlin@sonofamberandchaos.com',
        hash: 'aaaaaaaaaaddddddddddfffffffffffffff001233'
      };
      
      account.authorize(options, function (error, result) {
        error.should.be.false;
        result.should.be.false;
        done();
      });
    });

    it('should callback success if result is present', function (done) {
      mockDatabase.getDocument = function (query, callback) {
        callback(false, [{email: 'majora@mask.com'}]);
      };

      account = require('../app/admin.account')(plz, mockDatabase);

      var options = {
        email: 'merlin@sonofamberandchaos.com',
        hash: 'aaaaaaaaaaddddddddddfffffffffffffff001233'
      };
      
      account.authorize(options, function (error, result) {
        error.should.be.false;
        result.should.be.true;
        done();
      });
    });

  });

  describe('completeAction()', function () {
    beforeEach(function () {
      plz = require('../app/core.hub')(Tc.validAdminConfig);
      database = require('../app/utility.database')(plz);
      mockDatabase = {};
    });

    it('should callback an error if database editDocument fails', function (done) {
      var options = {
        email: 'merlin@sonofamberandchaos.com',
        passwordNew: 'WAoS0Compl3x',
        passwordConfirm: 'WAoS0Compl3x',
      };

      mockDatabase.editDocument = function (query, callback) {
        callback(true, false);
      };

      account = require('../app/admin.account')(plz, mockDatabase);

      account.completeAction(options, function (error, result) {
        error.should.be.true;
        result.should.be.false;
        done();
      });
    });

    it('should callback an error if document was not edited', function (done) {
      var options = {
        email: 'merlin@sonofamberandchaos.com',
        passwordNew: 'WAoS0Compl3x',
        passwordConfirm: 'WAoS0Compl3x',
      };

      mockDatabase.editDocument = function (query, callback) {
        callback(false, {value: { ok: 0 } });
      };

      account = require('../app/admin.account')(plz, mockDatabase);

      account.completeAction(options, function (error, result) {
        error.should.be.false;
        result.should.be.false;
        done();
      });
    });

    it('should callback true if editDocument succeeds', function (done) {
      var options = {
        email: 'merlin@sonofamberandchaos.com',
        passwordNew: 'WAoS0Compl3x',
        passwordConfirm: 'WAoS0Compl3x',
      };

      mockDatabase.editDocument = function (query, callback) {
        callback(false, {value: { ok: 1 } });
      };

      account = require('../app/admin.account')(plz, mockDatabase);

      account.completeAction(options, function (error, result) {
        error.should.be.false;
        result.should.be.true;
        done();
      });
    });
  });
});
