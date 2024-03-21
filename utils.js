// const bcrypt = require("bcrypt");

// function Authenticate(userPassword, correctPasswordHash) {
//     let isAuthenticated;
//     bcrypt.hash(userPassword, 10, (err, hash) => {
//         if (err) { 
//         } else {
//            correctPasswordHash = hash;
//         }
//       });

//       bcrypt.compare(userPassword, correctPasswordHash, (err, result) => {
//         if (err) {
//           console.log(err)
//         } else if (result) {
//           isAuthenticated = true;
          
//         } else {
//           res.send("Incorrect password. Please try again.");
//         }
//       });
//       return isAuthenticated;

// }