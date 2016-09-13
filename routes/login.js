var express=require('express');
var router=express.Router();
var db=require("../couch");
var passport = require('passport');

//usado na parte do grupo
router.get('/',function(req,res,next){
    console.log("GET LOGIN")
    if(req.user){
        console.log(req.user)
        // already logged in

        res.redirect('/group/');
    } else {
        res.render("Login")
    }

})

router.post('/',passport.authenticate('local', { successRedirect: '/group',
    failureRedirect: '/',
    failureFlash: true })
);

module.exports=router