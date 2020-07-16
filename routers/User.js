require("dotenv").config();
const router = require("express").Router();
const jwt = require("jsonwebtoken")
let User = require("../models/User");
//let UserSession = require("../models/UserSession");
let refreshTokens=[];

/*1. For admin User to pull data */
router.route("/").get((req, res) => {
  User.find()
    .then((Users) => res.json(Users))
    .catch((err) => res.status(400).json("ERROR: " + err));
});


router.route("/posts").get(authenticationToken,(req, res) => {
   const val=[];
   val.push(req.user);
  User.find( {emailid:req.user.emailid},(err, exsistuser) => {
    if (err) {
      res.send("Error: Server error");
    } else if (exsistuser.length > 0) {
      res.json(req.user);
    }
  })
   
});

router.route("/token").post((req, res) => {
 const refreshToken = req.body.token;
 if(refreshToken == null) return res.sendStatus(401);
 if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
 jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
   const verifyuser={};
    verifyuser.username= user.username;
    verifyuser.emailid= user.emailid;
   if(err) return res.sendStatus(403);
   const accessToken=generateAccessToken(verifyuser);
   res.json({accessToken: accessToken})
 })
 
});



function authenticationToken(req,res,next){
  const authHeader= req.headers['authorization']
  const token=authHeader && authHeader.split(' ')[1]
  if(token == null)return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECERET,(err,user)=>{
    if(err) return res.sendStatus(403)
    req.user=user;
    next();
  })
}

/*2. For Adding User to the database  */
router.route("/signup").post((req, res) => {
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;

  const emailid = req.body.emailid;
  const password = req.body.password;

  if (!firstname) {
    res.send({
      success: false,
      status: 404,
      message: "Error: First name cannot be blank",
    });
  }
  if (!lastname) {
    res.send({
      success: false,
      status: 404,
      message: "Error: Last name cannot be blank",
    });
  }
  if (!emailid) {
    res.send({
      success: false,
      status: 404,
      message: "Error: email id cannot be blank",
    });
  }
  if (!password) {
    res.send({
      success: false,
      status: 404,
      message: "Error: password cannot be blank",
    });
  }

  User.find(
    {
      emailid: emailid,
    },
    (err, previousUsers) => {
      if (err) {
        res.send("Error: Server error");
      } else if (previousUsers.length > 0) {
        res.status(404).send('sorry email id exsist')
      }else{

      const newUser = new User();
      newUser.firstname = firstname;
      newUser.lastname = lastname;
      newUser.emailid = emailid;
      newUser.password = newUser.generateHash(password);

      newUser
        .save()
        .then(() => res.json("Users added!"))
        .catch((err) => res.status(400).json("ERROR: " + err));
    }
  }
  );
});

/*3. For Verify User from database  */
router.route("/signin").post((req, res) => {
  const emailid = req.body.emailid;
  const password = req.body.password;

  if (!emailid) {
    res.send({
      success: false,
      message: "Error: email id cannot be blank",
    });
  }
  if (!password) {
    res.send({
      success: false,
      message: "Error: password cannot be blank",
    });
  }

  User.find(
    {
      emailid: emailid,
    },
    (err, existingUsers) => {
      // this.password=password;
      if (err) {
        res.status(404).send('sorry email id not exists')
       // res.send("Error: Server error");
      } else if (existingUsers.length > 0) {
        const newUsers = new User();
        newUsers.password = existingUsers[0].password;
        if (newUsers.validPassword(password)) {
          const verifyuser={};
          verifyuser.username= existingUsers[0].firstname+" "+ existingUsers[0].lastname;
          verifyuser.emailid=existingUsers[0].emailid;
         const accessToken=generateAccessToken(verifyuser);
         const refreshToken= jwt.sign(verifyuser, process.env.REFRESH_TOKEN_SECRET);
         refreshTokens.push(refreshToken);
         res.json({ accessToken: accessToken, refreshToken: refreshToken })
        } else {
          res.status(404).send('sorry invalid Password')
        }
      }
    }
  );
});

router.route("/signout").delete((req,res) => {
  refreshTokens= refreshTokens.filter(token => token !== req.body.token);
  res.sendStatus(204);
})

function generateAccessToken(user){
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECERET, {expiresIn: '2m'})
}

//4.function for authentication


module.exports = router;
