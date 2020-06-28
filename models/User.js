const mongoose = require('mongoose');
const bcrypt= require("bcrypt")

const UserSchema= new mongoose.Schema(
    {
        firstname:{
            type:String,
            default:""
        },
    
        lastname:{
            type:String,
            default:""
        },
        emailid:{
            type:String,
            default:""
        },
        password:{
            type:String,
            default:""
        },
        isDeleted:{
            type:Boolean,
            default:false
        },
    }
);

UserSchema.methods.generateHash=function(password){
return bcrypt.hashSync(password, bcrypt.genSaltSync(8),null);
}
UserSchema.methods.validPassword= function(password){
    console.log("Asif", password);
    console.log("Asif", this.password);
    return bcrypt.compareSync(password, this.password);
}
module.exports= mongoose.model('User',UserSchema)