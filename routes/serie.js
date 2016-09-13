var express = require('express');
var router=express.Router();
var dataApi=require('../data-acess/series-server-data')



router.get('/:id',function(req,res){

        res.render('serie',{id:req.params.id})

})

router.get('/:id/cast',function(req,res){
    dataApi.getCastOfSerie(req.params.id,function(err,data){
        console.log(data)
        res.render('cast',{cast:data})
    })

})

router.get('/:id/episodes',function(req,res){

    dataApi.getSeasonsOfSerie(req.params.id,function(err,data){
        console.log(data)
        res.render('seasons',{seasons:data})
    })


})

module.exports=router