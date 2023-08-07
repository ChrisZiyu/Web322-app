const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// Create a Schema variable to point to mongoose.Schema
const Schema = mongoose.Schema;

const loginHistorySchema = new Schema({
  dateTime:{type:Date,
            required:true},
  userAgent:{type:String,
            required:true},
});

// define the user schema
const userSchema = new Schema({
    userName: {type:String,
              required:true,
              unique:true},
    password: {type:String,
              required:true},
    email:    {type:String,
              required:true},
    loginHistory:[loginHistorySchema], //array of login history
  });
  

let User;//it defines when connection start

module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
  let db = mongoose.createConnection("mongodb+srv://repinsolo:RRDylGnvD4GDHc5V@senecaweb.jcjrele.mongodb.net/?retryWrites=true&w=majority");
  db.on('error', (err)=>{//.on will cause the event listener to be called every time the event is emitted.
  reject(err); // reject the promise with the provided error
  });
  db.once('open', ()=>{//This will cause the event listener to be called only the first time the event is emitted. After the first emission, the listener is removed.
  User = db.model("users", userSchema);
  resolve();
  });
  });
  };

module.exports.registerUser = async function(userData) {
    try {
      if (userData.password !== userData.password2) {
        throw "Passwords do not match";
      }
      //Hash password with bcrypt
      const hashedPassword = await bcrypt.hash(userData.password,10);
      // Create a new user using the userData
      // let newUser = new User(userData);
      let newUser = new User({
        userName: userData.userName,
        email: userData.email,
        password: hashedPassword,
      });
      // Save the new user to the database
      await newUser.save();
  
      // Registration successful, resolve promise without any message.
      return;
    } catch (err) {
      if (err.code === 11000) {
        throw "User already taken";
      } else if (err.message === 'Password do not match'){
        throw "Password do not match";
      }else {
        throw "There was an error creating the user: " + err;
      }
    }
};

module.exports.checkUser = function(userData) {
  return new Promise(function(resolve, reject) {
      User.find({ userName: userData.userName })
          .then(users => {
              if (users.length === 0) {
                  reject("Unable to find user: " + userData.userName);
              } else {
                  const user = users[0];
                  bcrypt.compare(userData.password, user.password) // Compare hashed password
                      .then((result) => {
                        console.log(userData.password);
                          if (result) {
                              // Password matches
                              const loginData = {
                                  dateTime: new Date().toString(),
                                  userAgent: userData.userAgent,
                              };
                              // Push loginData to loginHistory array
                              user.loginHistory.push(loginData);

                              // Update login History and return the promise
                              return User.updateOne(
                                  { userName: user.userName },
                                  { $set: { loginHistory: user.loginHistory } }
                              ).then(result => {
                                  console.log('Update login history result:', result);
                                  // Resolve the promise with the user object
                                  resolve(user);
                              });
                          } else {
                              // Incorrect password
                              reject("Incorrect password for user: " + userData.userName);
                          }
                      })
                      .catch(err => {
                          console.error('Bcrypt error:', err);
                          reject("There was an error verifying the user's password.");
                      });
              }
          })
          .catch(err => {
              console.error('Check user error:', err);
              reject("There was an error verifying the user: " + err);
          });
  });
};


// module.exports.checkUser=function(userData){
//   return new Promise(function(resolve,reject){
//     User.find({userName: userData.userName},function(err,users){
//       if(err){
//         //no match
//         reject("user may not be found at all / there was an error with the query: "+err);
//       }else{
//         //check if user exist in database
//         if(user.length===0){
//           reject("unable to find user: "+userData.userName);
//         }else{
//           //user found, password matching check
//           const user=users[0];
//           if(user.password !== userData.password){
//             reject("Incorrect password for user: "+userData.userName);
//           }else{
//             //password matches
//             const loginData ={
//               dateTime:new Date().toString(),
//               userAgent: userData.userAgent,
//             };
//             //push loginData to loginHistory array
//             user.loginHistory.push(loginData);

//             //Update login History
//             User.updateOne(
//               {userName: user.userName},
//               {$set:{loginHistory:user.loginHistory}},
//               function(err,result){
//                 if(err){
//                   reject("There was an error verifying the user:"+ err);
//                 }else{
//                   resolve(user);
//                 }
//               });
//           }
//         }
//       }
//     });
//   });
// };


