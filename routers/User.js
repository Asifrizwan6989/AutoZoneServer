
const router = require('express').Router();
let User= require('../models/User');
let UserSession = require('../models/UserSession')

router.route('/').get((req, res) => {
User.find()
.then(Users => res.json(Users))
.catch(err => res.status(400).json('ERROR: ' + err));
});

router.route('/signup').post((req, res)=>{
    const firstname= req.body.firstname;
    const lastname=req.body.lastname;

    const emailid= req.body.emailid;
    const password= req.body.password;
  
if(!firstname){
    res.send({
        success: false,
        message: "Error: First name cannot be blank"
    })
}
if(!lastname){
    res.send({
        success: false,
        message: "Error: Last name cannot be blank"
    })
}
if(!emailid){
    res.send({
        success: false,
        message: "Error: email id cannot be blank"
    })
}
if(!password){
    res.send({
        success: false,
        message: "Error: password cannot be blank"
    })
}

User.find({
    emailid:emailid
},(err, previousUsers)=>{
    if(err){
        res.send("Error: Server error")
    }else if(previousUsers.length > 0){
        res.send("Error: Account already exist");
    }

    const newUser = new User();
    newUser.firstname = firstname;
    newUser.lastname = lastname;
    newUser.emailid = emailid;
    newUser.password = newUser.generateHash(password);

    newUser.save() .then(()=> res.json('Users added!'))
    .catch(err => res.status(400).json('ERROR: ' +err));
    });

})
   
router.route('/signin').post((req, res) => {
    
    const emailid= req.body.emailid;
    const password= req.body.password;
  

if(!emailid){
    res.send({
        success: false,
        message: "Error: email id cannot be blank"
    })
}
if(!password){
    res.send({
        success: false,
        message: "Error: password cannot be blank"
    })
}

User.find({
    emailid:emailid
},(err, existingUsers)=>{
   // this.password=password;
   console.log("password",password);
    console.log("existingUsers",existingUsers[0].password);
    if(err){
        res.send("Error: Server error")
    }
    else if(existingUsers.length > 0){
        const newUsers =new User;
        newUsers.password=existingUsers[0].password;
        if(newUsers.validPassword(password)){
           // const sessionexist=[];
            console.log("existingUsers[0]._id",existingUsers[0]._id);
            // function checkSession(){
            //     UserSession.find({userId: existingUsers[0]._id},(err, existingSession)=>{
            //         console.log("existingSession" , existingSession);
            //         return sessionexist=existingSession;
            //     }); 
            // }
            // checkSession();         
            UserSession.find({userId: existingUsers[0]._id},(err, existingSession)=>{
                     //console.log("sessionexist" , sessionexist);
                    // console.log("existingUsers[0]._id", existingUsers[0]._id);
                if(existingSession.length>0){
                    UserSession.findById(existingSession[0]._id).then(userSession=>{
                        console.log("userSession",userSession);
                      userSession.timestamp= Date.now();
                        
                      userSession.save()
                    }).then(()=> res.send('Session updated successfully'))
                    .catch(err => res.status(400).json('ERROR: ' +err));
                    // console.log("Existing session user");

                    // existingSession.timestamp= Date.now();
                    // existingSession.update().then(
                    //     ()=> res.json("existingSession"))
                    // .catch(err => res.status(400).json('ERROR: ' +err));
                }else{
                    console.log("New session for user");
                    const newUserSession = new UserSession;
                    newUserSession.userId= existingUsers[0]._id;
                    newUserSession.save().then(()=> res.json(newUserSession))
                    .catch(err => res.status(400).json('ERROR: ' +err));
                }

      })
        }else{
            res.send("Error: invalid Password ")
        }
    }
})
 
});


module.exports = router;