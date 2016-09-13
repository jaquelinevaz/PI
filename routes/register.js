/**
 * Created by Jaqueline on 05/09/2016.
 */
var express=require('express');
var router=express.Router();
var db=require("../couch");

var dbName='seriesdb'

router.get('/',function(req,res){

    res.render("register")

})
router.post('/',function(req,res){
    console.log("Regist POST")
    console.log(req.body)

    var user = {
        name: req.body.userName,
        password: req.body.password,
        email: req.body.email
    }
    db.select('users','',function (data) {
        var obj=data
        obj[user.email]=user
        db.insert(obj, "users",dbName)
        res.redirect('/');
    },'seriesdb')
    })



module.exports=router