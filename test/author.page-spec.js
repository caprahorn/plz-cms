'use strict';

require('should');

var Tc = require('./test-config');

describe('author | Configuration', function () {
  it('should not accept undefined author options', function () {
    (function () {
      require('../app/core.hub')(Tc.invalidAuthorConfig);
    }).should.throw();
  });

  it('should accept properly defined author options', function () {
    (function () {
      require('../app/core.hub')(Tc.validAuthorConfig);
    }).should.not.throw();
  });
});

describe('author.page | Public API', function () {
  var plz, page, pageCollection, Utility, db;

  plz = require('../app/core.hub')(Tc.validAuthorConfig);
  Utility = require('../app/utility.api')(plz);
  db = Utility.db;

  describe('plz.create.page()', function () {

    before(function (done) {
      db.getDatabase(function (error, database) {
        page = Tc.validAuthorConfig.author.page.collection;
        pageCollection = database.collection(page);

        pageCollection.count(function(error, count) {
          if(count >= 1) {
            pageCollection.drop(function () {
              done();
            });
          } else {
            done();
          }
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      plz.create.page(Tc.invalidPage, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should insert a page with required fields present', function(done) {
      plz.create.page(Tc.validPage, function (error) {
        error.should.be.false;

        pageCollection.count(function(error, count) {
          count.should.equal(1);

          var findOptions = {pageTitle: Tc.validPage.pageTitle};

          pageCollection.findOne(findOptions, function (error, result) {
            for(var field in Tc.validPage) {
              if(Tc.validPage.hasOwnProperty(field) && field !== "_id") {
                if(result[field] instanceof Array){
                  var arrayString = result[field].toString();
                  arrayString.should.equal(Tc.validPage[field].toString());
                }
                else{
                  result[field].should.equal(Tc.validPage[field]);
                }
              }
            }
            done();
          });
        });
      });
    });

    it('should not insert a page that already exists', function(done) {
      plz.create.page(Tc.validPage, function (error) {
        error.should.be.true;
        done();
      });
    });

    after(function (done) {
      pageCollection.drop(function () {
        done();
      });
    });
  });

  describe('plz.publish.page()', function () {
    before(function (done) {
      plz = require('../app/core.hub')(Tc.validAuthorConfig);

      db.getDatabase(function (error, database) {
        page = Tc.validAuthorConfig.author.page.collection;
        pageCollection = database.collection(page);

        plz.create.page(Tc.validPage, function (error) {
          error.should.be.false;
          done();
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      var request = {
        options: 'invalid options',
      };

      plz.publish.page(request, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should publish a page with public visibility', function(done) {
      var request = {
        userName: 'chahm',
        pageTitle: 'Simple plz-cms page',
      };

      plz.publish.page(request, function (error, result) {
        error.should.be.false;
        result.should.not.be.empty;

        pageCollection.findOne(request, function (error, result) {
          result.visibility.should.equal("public");
          done();
        });
      });
    });

    it('should return error if page does not exist', function(done) {
      var request = {
        userName: 'chahm',
        pageTitle: 'nonexistent page',
      };

      plz.publish.page(request, function (error, result) {
        error.should.be.true;
        result.should.not.be.empty;
        done();
      });
    });

    after(function (done) {
      pageCollection.drop(function () {
        done();
      });
    });
  });

  describe('plz.get.page()', function () {
    before(function (done) {
      plz = require('../app/core.hub')(Tc.validAuthorConfig);

      db.getDatabase(function (error, database) {
        page = Tc.validAuthorConfig.author.page.collection;
        pageCollection = database.collection(page);

        plz.create.page(Tc.validPage, function (error) {
          error.should.be.false;
          done();
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      var request = {
        options: 'invalid options',
      };

      plz.get.page(request, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should fetch a page with required fields present', function(done) {
      var request = {
        userName: 'chahm',
        pageTitle: 'Simple plz-cms page',
      };

      plz.get.page(request, function (error, result) {
        error.should.be.false;
        result.should.not.be.empty;
        done();
      });
    });

    it('should fetch a page using _id', function(done) {
      plz.create.page(Tc.anotherValidPage, function (error, result) {
        error.should.be.false;
        var request = {
          _id: result.insertedId
        };
        plz.get.page(request, function (error, result) {
          error.should.be.false;
          result.should.not.be.empty;
          done();
        });
      });
    });

    it('should fetch multiple pages using label', function(done) {
      Tc.anotherValidPage.pageTitle = 'page 3';
      Tc.anotherValidPage._id = undefined;
      plz.create.page(Tc.anotherValidPage, function (error) {
        error.should.be.false;
        var request = {
          label: 'mainmenu',
          limit: '*'
        };
        plz.get.page(request, function (error, result) {
          error.should.be.false;
          result.should.not.be.empty;
          result.length.should.equal(3);
          done();
        });
      });
    });

    it('should not fetch more pages than specified limit', function(done) {
      var request = {
        label: 'mainmenu',
        limit: 2
      };
      plz.get.page(request, function (error, result) {
        error.should.be.false;
        result.should.not.be.empty;
        result.length.should.equal(request.limit);
        done();
      });
    });

    it('should not fetch previous revisions using label', function(done) {
      var editRequest = {
        userName: 'chahm',
        pageTitle: 'Simple plz-cms page',
        content: 'new content'
      };
      plz.edit.page(editRequest, function (error) {
        error.should.be.false;
        var getRequest = {
          label: 'mainmenu',
          limit: '*'
        };
        plz.get.page(getRequest, function (error, result) {
          error.should.be.false;
          result.should.not.be.empty;
          result.length.should.equal(3);
          done();
        });
      });
    });

    it('should return error if page does not exist', function(done) {
      var request = {
        userName: 'chahm',
        pageTitle: 'nonexistent page',
      };

      plz.get.page(request, function (error, result) {
        error.should.be.true;
        result.should.not.be.empty;
        done();
      });
    });

    after(function (done) {
      pageCollection.drop(function () {
        done();
      });
    });
  });

  describe('plz.edit.page()', function () {
    before(function (done) {
      plz = require('../app/core.hub')(Tc.validAuthorConfig);

      db.getDatabase(function (error, database) {
        page = Tc.validAuthorConfig.author.page.collection;
        pageCollection = database.collection(page);

        plz.create.page(Tc.validPage, function (error) {
          error.should.be.false;
          done();
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      var request = {
        options: 'invalid options',
      };

      plz.edit.page(request, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should modify a page with new content', function(done) {
      var request = {
        userName: 'chahm',
        pageTitle: 'Simple plz-cms page',
        content: 'new content'
      };

      plz.edit.page(request, function (error, result) {
        error.should.be.false;
        result.should.not.be.empty;

        pageCollection.findOne(request, function (error, result) {
          result.content.should.equal(request.content);
          done();
        });
      });
    });

    it('should return error if page does not exist', function(done) {
      var request = {
        userName: 'chahm',
        pageTitle: 'nonexistent page',
      };

      plz.get.page(request, function (error, result) {
        error.should.be.true;
        result.should.not.be.empty;
        done();
      });
    });

    after(function (done) {
      pageCollection.drop(function () {
        done();
      });
    });
  });

  describe('plz.remove.page()', function () {
    before(function (done) {
      plz = require('../app/core.hub')(Tc.validAuthorConfig);

      db.getDatabase(function (error, database) {
        page = Tc.validAuthorConfig.author.page.collection;
        pageCollection = database.collection(page);

        plz.create.page(Tc.validPage, function (error) {
          error.should.be.false;
          done();
        });
      });
    });

    it('should return error if required fields are missing', function(done) {
      var request = {
        options: 'invalid options',
      };

      plz.remove.page(request, function (error) {
        error.should.be.true;
        done();
      });
    });

    it('should remove a page matching the given criteria', function(done) {
      var request = {
        userName: 'chahm',
        pageTitle: 'Simple plz-cms page'
      };

      plz.remove.page(request, function (error, result) {
        error.should.be.false;
        result.should.not.be.empty;

        pageCollection.count(function(error, count) {
          count.should.equal(0);
          done();
        });
      });
    });

    it('should return error if page does not exist', function(done) {
      var request = {
        userName: 'chahm',
        pageTitle: 'nonexistent page',
      };

      plz.get.page(request, function (error, result) {
        error.should.be.true;
        result.should.not.be.empty;
        done();
      });
    });

    after(function (done) {
      pageCollection.drop(function () {
        done();
      });
    });
  });
});
