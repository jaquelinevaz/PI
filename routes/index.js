var express = require('express');
var router = express.Router();
var dataApi=require('../data-acess/series-server-data')
var series=require('./serie')
var logAux=require('./login')
var regist=require('./register')
var recover=require('./recoverPassword')
var group=require('./group')
var teste=require('./teste')


router.get('/', function(req, res, next) {

  //Apresenta se a pagina logo se nao tiver que procurar
 console.log(req.query.q)
  if(req.query.q==undefined){
    console.log('undefined query')
    res.render('index');
  }
  else{ //Procura alguma coisa

    //chama se a aplicaçao
    console.log(req.query.q)
    console.log('query')
    dataApi.searchSerie(req.query.q,function(err,data){
        console.log(data)
        //var regex = /(<([^>]+)>)/ig
        var arrfinal=[]
        data.forEach(function (value) {
            value.show.summary=value.show.summary.replace(/<[a-z]>/g,"")
            arrfinal.push(value)
        })

        res.render('index',{series:arrfinal})
    })

  }

});
router.use('/register',regist);
router.use('/recoverPassword',recover);
router.use('/login',logAux);
router.use('/serie',series);
router.use('/group',group);
router.use('/teste',teste);

module.exports = router;
