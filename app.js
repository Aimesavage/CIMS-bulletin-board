require('dotenv').config()
const express = require('express');
const port = process.env.PORT || 3000;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs')
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const session = require("express-session")
const cron = require("node-cron")
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const server = createServer(app);
const io = require('socket.io')(server)
const mongoose = require('mongoose');


const secret = process.env.SECRET;
const saltRounds = 10; 
let correctPasswordHash;



bcrypt.hash(secret, saltRounds, (err, hash) => {
  if (err) {
   
  } else {
     correctPasswordHash = hash;

  }
});



app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'my-secret-key' , resave: false, saveUninitialized: true }));




const { log } = require('console');
// Local MongoDB
// mongoose.connect('mongodb://127.0.0.1:27017/posterDB');



// // Remote MongoDB
const uri = process.env.MONGODB_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));


const posterSchema = {
    name: String,
    date: Date
};

const Poster =mongoose.model("Poster", posterSchema)


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, 'public')))






function posterUpload() {

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, 'public/images/')); // Specify the destination folder
        },

        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
        }
    })
    const upload = multer({storage})  
    return upload 
}




app.get("/", async (req, res) => {
   res.render("home")
});


app.get("/board", async (req, res) => {
    try {
     
      const posterArray = await Poster.find({})

      res.render('board', { posterArray});
  } catch (err) {
      console.log(err);
  }
});

app.get('/upload', (req, res)=>{
        res.render("upload")
    })
    
app.get("/success")

app.post('/upload', posterUpload().single('images'), (req, res) => {
    if (!req.file || req.file.length === 0) {
        return res.status(400).send('No files uploaded.');
    }
    
    const posterName =  req.file.filename;
    const posterDate = req.body.date;

    const poster = new Poster({
        name: posterName,
        date: posterDate
    });

    poster.save()
        .then(() => {
            // Emit a Socket.io event when a new poster is uploaded
             io.emit('newPoster', posterName);
            return res.render('success-upload');
        })
        .catch((err) => {
            console.error('Error saving poster:', err);
            return res.status(500).send('Error saving poster.');
        });
});




app.get("/login", (req,res)=>{
    res.render("login")
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
    res.render("login");
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



app.post("/login", (req, res) => {
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