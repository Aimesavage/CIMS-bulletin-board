// import dependencies
require('dotenv').config()
const express = require('express');
const port = process.env.PORT || 3000;
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const ejs = require('ejs')
const app = express();

const bcrypt = require("bcrypt");
const session = require("express-session")
const cron = require("node-cron")
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const server = createServer(app);
const io = require('socket.io')(server)
const mongoose = require('mongoose');
const {Poster, User, Review} = require("./dbs.js");
const { error } = require('console');

const uploadDir = path.join(__dirname, 'public/images/');
fs.ensureDirSync(uploadDir);
var userInfoID;
var reviews = [];
var session_email;
// initialise dependencies
    // body-parser

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'my-secret-key' , resave: false, saveUninitialized: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, 'public')))

//implement hashing for sensitive informations

const secret = process.env.SECRET;
let correctPasswordHash;
bcrypt.hash(secret, 10, (err, hash) => {
  if (err) { 
  } else {
     correctPasswordHash = hash;
  }
});









const mongoDBUri = 'mongodb://127.0.0.1:27017/bulletinBoardDB';

// mongoose.connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true });



// // // Remote MongoDB
const uri = process.env.MONGODB_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

function posterUpload() {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });

  return multer({ storage });
}




app.get("/", async (req, res) => {
   res.render("home")
});




app.get('/upload', (req, res)=>{
  if (req.session.authenticated){

    res.render("upload")
  }
  else{
    res.redirect('/login')
  }
        
    })
    


    app.post('/upload', posterUpload().single('images'), async (req, res) => {
      try {
        if (!req.file) {
          throw new Error('No file uploaded.');
        }
    
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
          throw new Error('User not found.');
        }
    
        const poster = new Poster({
          ID: user._id,
          name: req.file.filename,
          date: req.body.date
        });
    
        await poster.save();
        io.emit('newPoster', poster.name); // Emit event for new poster upload
        res.render('success-upload');
      } catch (err) {
        console.error('Error during file upload:', err);
        res.status(500).send(err.message);
      }
    });



app.get("/board", async (req, res) => {
  try {
   
    const posterArray = await Poster.find({})

    res.render('board', { posterArray});
} catch (err) {
    console.log(err);
}
});
app.get("/admin_login", (req,res)=>{
    res.render("admin_login")
})





app.get("/admin", async(req, res) => {
  // Check if the user is already authenticated via session
  if (req.session.authenticated) {

    try {

        const posterArray = await Poster.find({})
           
            res.render("admin", { posterArray});
            
    } catch (err) {
        console.log(err);
    
    }
    
  } else {
    res.render("admin_login");
  }
});

app.post("/admin", async (req, res) => {
  const itemsToDelete = req.body.check;
  try {
    const targetPath = path.join(__dirname, "public", "images", itemsToDelete.toString());
    
    await Poster.deleteMany({ name: { $in: itemsToDelete } });
     // Emit a Socket.io event when posters are deleted
     io.emit('posterDeleted', itemsToDelete);
    fs.unlink(targetPath, (err => {
      if (err) console.log(err);
      else {
        console.log("\nDeleted Symbolic Link");
       
      }
    }));
  } catch (error) {
    console.error("Error:", error);
  }
  res.redirect("/admin");
});



app.post("/admin_login", (req, res) => {
  const enteredPassword = req.body.password;
  bcrypt.compare(enteredPassword, correctPasswordHash, (err, result) => {
    if (err) {
      // Handle error
    } else if (result) {
      req.session.authenticated = true;
      res.redirect("/admin");
    } else {
      res.send("Incorrect password. Please try again.");
    }
  });
});

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      }
      res.redirect("/login"); // Redirect the user to the login page after logging out
    });
  });

  app.get("/sign_up", (req, res)=>{
    res.render("sign_up")

  })

  app.post("/sign_up", async (req, res) => {


    const userEmail = req.body.email;


    const userInfo = await User.findOne({email: userEmail})
    

    if (userInfo) {
      return res.status(400).send("User already exists.");

    }


    const userPassword = req.body.password;
  
    const hashedPassword = await bcrypt.hash(userPassword, 10); // Add async/await for hashing
  
    const user = new User({
      email: userEmail,
      password: hashedPassword, // Store the hashed password
    });

    userInfoID = user._id;
  
    await user.save(); // Ensure this is awaited
    req.session.authenticated = true;
    res.redirect("/users" );
      
    
    
  });
  


  app.get("/login", (req, res)=>{
    res.render("login")
  })



  app.post("/login", async (req, res)=>{
    try{
      
    const userInfo = await User.findOne({email: req.body.email})
    let enteredPassword = req.body.password;
    
    
    

      bcrypt.compare(enteredPassword, userInfo.password, (err, result) => {
        if (err) {
          console.log(err);
        } else if (result) {
          req.session.authenticated = true;
          session_email = userInfo.email;
          userInfoID = userInfo._id;
          res.redirect('/users');
        } else {
          res.send("Incorrect password. Please try again.");
        }
      });
      
  }
    
    
    
    catch{

      res.redirect('/sign_up')
    }
  })

  app.get("/users", async(req, res) => {
    // Check if the user is already authenticated via session
    if (req.session.authenticated) {
  
      try {
  
          const posterArray = await Poster.find({ID: userInfoID})
             
              res.render("users", { posterArray});
              
      } catch (err) {
          console.log(err);
      
      }
      
    } else {
      res.render("login");
    }
  });

  app.post('/users', async (req,res)=>{

    const itemsToDelete = req.body.check;
  try {
    const targetPath = path.join(__dirname, "public", "images", itemsToDelete.toString());
    
    await Poster.deleteMany({ name: { $in: itemsToDelete } });
     // Emit a Socket.io event when posters are deleted
     io.emit('posterDeleted', itemsToDelete);
    fs.unlink(targetPath, (err => {
      if (err) console.log(err);
      else {
        console.log("\nDeleted Symbolic Link");
       
      }
    }));
  } catch (error) {
    console.error("Error:", error);
  }
  res.redirect("/users");
  })



  //handle review
  app.get('/addreview', (req,res)=>{


    res.render('addreview')
  })

  app.post('/addreview', async (req, res)=>{

    const review = new Review({review:req.body.review_body})
    await review.save()

   


  })


  app.get("/reviews", async(req, res)=>{

      reviews = await Review.find();

    res.render('reviews', {reviews})


  })
  // Cron-job for autodeletion
async function removeExpiredEvents() {
    const currentDate = new Date();
    await Poster.deleteMany({ date: { $lt: currentDate } });
  }
  

  
  // Schedule the function to run every day at midnight
cron.schedule('0 0 0 * * *', () => {
    removeExpiredEvents().catch((error) => {
      console.error('Error removing expired events:', error);
    });
  });

  io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });



server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

















module.exports = app