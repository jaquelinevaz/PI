/**
 * Created by Jaqueline on 12/09/2016.
 */
var express=require('express');
var router=express.Router();


//visto
router.get("/",function(req,res) {

res.render('teste')

})
router.post("/",function(req,res) {
console.log("PSIU")
//res.render('teste',{name:'ola'})
res.send(true)
})

module.exports=router