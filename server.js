// Import needed modules
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const uuid = require('node-uuid');
const fs = require('fs');
const dataFileName = './data.json';
const appData = require(dataFileName);
const aws = require('aws-sdk');
const yk = require('./yk');

// Create app data (mimics a DB)
const userData = appData.users;
const infoData = appData.info;
const galleryData = appData.gallery;

function getUser(username) {
  const user = userData.find(u => u.username === username);
  return Object.assign({}, user);
}

// Create default port
const PORT = process.env.PORT || 3000;

// Create a new server
const server = express();

// prep s3
aws.config.update({
  accessKeyId: yk.accessKeyId,
  secretAccessKey: yk.secretAccessKey
});

// Configure server
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(session({
  secret: process.env.SESSION_SECRET || 'awesomecookiesecret',
  resave: false,
  saveUninitialized: false,
}));
server.use(flash());
server.use(express.static('public'));
server.use(passport.initialize());
server.use(passport.session());
server.set('views', './views');
server.set('view engine', 'pug');

// configure passport. does this go here?
passport.use(new LocalStrategy(
  (username, password, done) => {
    const user = getUser(username);

    if (!user || user.password !== password) {
      return done(null, false, { message: 'Username and password combination is invalid'});
    }

    delete user.password;

    return done(null, user);
  }
));

// serialize user in session
passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser((username, done) => {
  const user = getUser(username);

  delete user.password;

  done(null, user);
});

function isAuthenticated(req, res, next) {
  if (!req.user) {
    req.flash('error', 'You must be logged in.');
    return res.redirect('/');
  }

  return next();
}

// update data file after update to in-memory data
function updateDataFile() {
  fs.writeFile(dataFileName, JSON.stringify(appData, null, 2), function(err) {
    if (err) return console.log(err);
    // console.log(JSON.stringify(appData));
    // console.log('writing to ' + dataFileName);
  });
}

function writeGalleryDataToFile(dataObj){
  appData.gallery = dataObj;
  updateDataFile();
}

// create home route
server.get('/', (req, res) => {
    res.render('index');
  }
);
// create dashboard route
server.get('/alessa', (req, res) => {
    if (req.user) {
      return res.redirect('alessa/dashboard');
    }

    res.render('alessa/index');
  }
);

server.get('/alessa/dashboard',
  isAuthenticated,
  (req, res) => {
    res.render('alessa/dashboard');
  }
);

// Create auth routes
const authRoutes = express.Router();

authRoutes.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/alessa',
    successRedirect: '/alessa/dashboard',
    failureFlash: true,
  })
);

server.use('/auth', authRoutes);

// Create API routes
const apiRoutes = express.Router();

apiRoutes.get('/me', (req, res) => {
  res.json({ user: req.user });
});

// Get site info
apiRoutes.get('/info',
  (req, res) => {
    const info = infoData;

    res.json({ info });
  }
);

apiRoutes.post('/info',
  (req, res) => {
    infoData.instaSubHead = req.body.instaSubHead;
    infoData.aboutSubHead = req.body.aboutSubHead;
    infoData.contactSubHead = req.body.contactSubHead;
    infoData.about = req.body.about;
    infoData.name = req.body.name;

    updateDataFile();
  }
);

// Get gallery
apiRoutes.get('/gallery',
  (req, res) => {
    const gallery = galleryData;

    res.json({ gallery });
  }
);

apiRoutes.post('/gallery/add',
  isAuthenticated,
  (req, res) => {
    const name = req.body.name;

    var newArt = {
      id: uuid.v4(),
      link: name,
      header: "",
      subHeader: ""
    };

    galleryData.push(newArt);

    writeGalleryDataToFile(galleryData);

    res.status(201).json({ newArt });
  }
);

// add a gallery image
apiRoutes.get('/gallery/aws',
  isAuthenticated,
  (req, res) => {

    var filetype = req.query.filetype;
    var filename = req.query.filename;

    exports = module.exports = {
      sign: function(filename, filetype) {
        var awsUrl = '';

        var s3 = new aws.S3();

        var params = {
          Bucket: 'alessa',
          Key: filename,
          Expires: 60,
          ContentType: filetype,
          ACL: 'public-read'
        };

        s3.getSignedUrl('putObject', params, function(err, data) {
          if(err) {
            console.log(err);
            return err;
          } else {
            awsUrl = data;
          }
        })

        return awsUrl;
      }
    }

    var specialUrl = exports.sign(filename, filetype);
    res.json({signedUrl: specialUrl});
  }
);

// Update art peice
apiRoutes.post('/gallery/update',
  isAuthenticated,
  (req, res) => {
    var id = req.body.id;
    var head = req.body.head;
    var subHead = req.body.subHead;

    for(var i = 0; i < galleryData.length; i++) {
      if(galleryData[i].id === id) {
        galleryData[i].header = head;
        galleryData[i].subHeader = subHead;

        writeGalleryDataToFile(galleryData);

        i = galleryData.length;
      }
    }
  }
);

// Reorder art gallery
apiRoutes.post('/gallery/reorder',
  isAuthenticated,
  (req, res) => {
    var idArray = req.body.galleryIds;

    var reorderedGallery = [];

    for (var i = 0; i < idArray.length; i ++) {
      for(var n = 0; n < galleryData.length; n ++) {
        if(galleryData[n].id === idArray[i]){
          reorderedGallery.push(galleryData[n]);
          n = galleryData.length;
        }
      }
    }

    writeGalleryDataToFile(reorderedGallery);
  }
);

// Delete art piece
apiRoutes.delete('/gallery/:id',
  isAuthenticated,
  (req, res) => {
    const { id } = req.params;
    const artWorkIndex = galleryData.findIndex(exc => exc.id === id);

    // wait for memory data to update then update data file
    var promise = new Promise(function(resolve, reject) {
      galleryData.splice(artWorkIndex, 1);

      if (galleryData.indexOf(id) === -1) {
        resolve();
      } else {
        reject(Error('Failed to update gallery in memory'));
      }
    });

    promise.then(function(){
      writeGalleryDataToFile(galleryData);
    }, function(err) {
      console.log(err);
    });

    res.sendStatus(204);
  }
);

server.use('/api', apiRoutes);

// Start server
server.listen(PORT, () => {
  console.log(`The API is listening on port ${PORT}`);
});
