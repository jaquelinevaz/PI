
var express=require('express');
var router=express.Router();
var db=require("../couch");

router.get('/',function(req,res){

    res.render("recoverPassword")
})


router.post('/', function (req, res, next) {


        console.log("Recover POST")

        db.select("users",{ name:req.body.userName,
            email:req.body.email
        },function(user){
            var aux=user[req.body.email]
            res.render("recoverPassword",{password:"Password is "+aux.password})
        },'seriesdb')


    }
);

module.exports=router

