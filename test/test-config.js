var TestConfig = function () {
  'use strict';
  
  var MONGO_URI = 'mongodb://127.0.0.1:27017/test';
 
  var validCoreConfig = {
    modules: {
    },
    database: {
      default: {
        uri: MONGO_URI
      }
    },
    mailer: {
      default: {
        service: '',
        address: 'sender@example.com',
        password: '' 
      }
    }
  };

  var invalidCoreConfig = {
    modules: {
    }, 
    database: {
      notDefault: 'mongo://'
    },
    mailer: {
    }
  };

  var validAdminConfig = {
    modules: {
      admin: true
    },
    database: {
      default: {
        uri: MONGO_URI
      }
    },
    mailer: {
      default: {
        service: '',
        address: 'sender@example.com',
        password: ''
      }
    },
    admin: {
      collection: 'user',
      roles: {
        admin: true,
        user: true
      },
      required: {
        name: 'string',
        email: 'email',
        password: 'password',
        createdAt: 'number',
        modifiedAt: 'number',
        lastLogin: 'number',
        status: 'string'
      }
    }
  };

  var invalidAdminConfig = {
    modules: {
      admin: true
    },
    database: {
      default: {
        uri: MONGO_URI
      }
    },
    mailer: {
      default: {
        service: '',
        address: 'sender@example.com',
        password: '' 
      }
    }
  };

  var validAuthorConfig = {
    modules: {
      admin: false,
      author: true
    },
    database: {
      default: {
        uri: MONGO_URI
      }
    },
    mailer: {
      default: {
        service: '',
        address: 'sender@example.com',
        password: ''
      }
    },
    author: {
      modules: {
        page: true,
        post: true
      },
      page: {
        collection: 'page',
        required: {
          userName: 'string',
          pageTitle: 'string',
          visibility: 'string',
          contentType: 'string',
          content: 'string',
          createdAt: 'number',
          modifiedAt: 'number',
          status: 'string'
        }
      },
      post: {
        collection: 'post',
        required: {
          userName: 'string',
          postTitle: 'string',
          visibility: 'string',
          contentType: 'string',
          content: 'string',
          createdAt: 'number',
          modifiedAt: 'number',
          status: 'string'
        }
      }
    }
  };

  var invalidAuthorConfig = {
    modules: {
      author: true
    },
    database: {
      default: {
        uri: MONGO_URI
      }
    },
    mailer: {
      default: {
        service: '',
        address: 'sender@example.com',
        password: ''
      }
    }
  };

  var validPage = {
    userName: 'chahm',
    pageTitle: 'Simple plz-cms page',
    visibility: 'public',
    createdAt: 3134999944,
    modifiedAt: 3134999944,
    status: 'draft',
    contentType: 'text/plain',
    content: ''
  };

  var invalidPage = {
    pageTitle: 'invalid options',
    createdAt: 3134999944,
    modifiedAt: 3134999944,
    status: 'draft'
  };

  var validPost = {
    userName: 'chahm',
    postTitle: 'Simple post',
    visibility: 'public',
    createdAt: 3135000000,
    modifiedAt: 3135000000,
    status: 'draft',
    contentType: 'text/plain',
    content: ''
  };

  var invalidPost = {
    postTitle: 'invalid options',
    createdAt: 3134999944,
    modifiedAt: 3134999944,
    status: 'draft'
  };

  var validUser = {
    name: 'greg',
    email: 'sender@example.com',
    password: 'someFakePass0',
    createdAt: 3134999944,
    modifiedAt: 3134999945,
    lastLogin: 0,
    status: 'created',
    role: 'admin'
  };

  var invalidUser = {
    name: 'greg',
    email: 'sender@exmaple.com',
    password: 'someFakePass0',
    createdAt: 3134999944,
    modifiedAt: 3134999945,
    role: 'admin'
  };
  
  return {
    validCoreConfig: validCoreConfig,
    invalidCoreConfig: invalidCoreConfig,
    validAdminConfig: validAdminConfig,
    invalidAdminConfig: invalidAdminConfig,
    validAuthorConfig: validAuthorConfig,
    invalidAuthorConfig: invalidAuthorConfig,
    validPage: validPage,
    invalidPage: invalidPage,
    validPost: validPost,
    invalidPost: invalidPost,
    validUser: validUser,
    invalidUser: invalidUser
  };
};

module.exports = TestConfig();
