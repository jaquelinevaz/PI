/**
 * Created by Jaqueline on 05/09/2016.
 */

var express=require('express');
var router=express.Router();
var db=require("../couch");
var data_server=require('../data-acess/series-server-data')

function requireAuth(req, res, next){

    // check if the user is logged in

    console.log("Authenticated")
    console.log(req.isAuthenticated())
    if(!req.isAuthenticated()){
        //req.session.messages = "You need to login to view this page";
        console.log("Nao autenticado")
        res.redirect('/login');
    }
    next();
}

router.get("/",requireAuth,function(req,res) {

    if(req.query.deletedGroup!=undefined){

        //ir buscar todos os utilizadores que tem esse grupo e apagar
        db.select(req.query.deletedGroup,"",function(obj) {
            //tenho que percorrer tudo aqui obrigatoriamente

                db.select('users',"",function(users) {
                    //pensar em objecto em x de array fca mais facil apagar o campo

                    var me=users[req.user]
                    delete  me.myGroups[req.query.deletedGroup]

                    //UPDATE
                    var aux={}
                    aux[req.user]=me
                    aux['_rev']=users._rev
                    db.insert(aux,'users','seriesdb')

                    for(var key in obj.guests){
                        if(users[obj.guests[key]].otherGroups!=undefined)
                            delete  users[obj.guests[key]].otherGroups[req.query.deletedGroup]
                    }
                    console.log("Delete")
                   // res.sendStatus(200)
                    res.redirect('/group')
            },'seriesdb')

            db.delete(req.query.deletedGroup,'seriesdb')

        },'seriesdb')

    }
    else {
      var otherGroups=[]
        db.select("users", "", function (obj) {

                var user = obj[req.user]

            for (var key1 in obj) {
                if (key1 != '_id' && key1 != '_rev'){
                    var o = obj[key1].myGroups
                    if(user!=obj[key1] && o != undefined) {
                        for (var key2 in o) {
                            //aqueles todos os grupos dos outros users que nao se encontram no meu othergroups
                                 otherGroups.push(o[key2])


                        }
                    }
                }
            }

                var invites=[]
            if(user.invite!=undefined) {
                var aux2 = user.invite
                for (var key in aux2) {
                    invites.push(aux2[key])
                }
            }

            var myGroups = []
                if(user.myGroups!=undefined) {
                    var aux2 = user.myGroups
                    for (var key in aux2) {
                        myGroups.push(aux2[key])
                    }
                }
            var myOtherGroups = []
            if(user.otherGroups!=undefined) {
                var aux2 = user.otherGroups
                for (var key in aux2) {
                    myOtherGroups.push(aux2[key].name)
                }
            }

                res.render("group", {isUser: true,number:invites.length, myGroups: myGroups,otherGroups:otherGroups,allGroups:myGroups.concat(myOtherGroups)});
        },'seriesdb')
    }
 })


router.post("/",requireAuth,function(req,res){
    //cada user tem um array de nome de grupos associado
    //criado um grupo sendo que o id eh o nome

    //Registar num grupo que nao seja deste user
    if(req.body.registerGroup!=undefined) {

        db.select(req.body.registerGroup,"", function (group) {

            //so faz registo se a pessoa for diferente de quem criou o grupo
            if(group.owner!=req.user) {
                if(group.guests==undefined)group.guests={} //users
                group.guests[req.user]=req.user

                db.insert(group, req.body.registerGroup, 'seriesdb')
                db.select("users", "", function (obj) {
                    var o={}
                    o.name=req.body.registerGroup
                    o.permission="read" //por defeito
                    obj[req.user].otherGroups={}
                    obj[req.user].otherGroups[req.body.registerGroup] = o
                    db.insert(obj, 'users', 'seriesdb')
                     res.redirect('/group')
                },'seriesdb')
            }
        },'seriesdb')

    }else{

        //juntar o nome do grupo e as series
        var result = {}
        var body = req.body
        for (var key in body) {
            if (key == "nameGroup")result[key] = body[key]
            else {
                var str=body[key].replace(/ /g, "")
                result[str]=str
            }
        }
        //o dono do grupo e os o que tem esse grupo pensado em apagar o grupo no futuro
        result.owner = req.user
        result.guests = {}


        //criar o grupo
        db.insert(result, result.nameGroup.replace(/ /g, ""), 'seriesdb');


        //inserir em meus grupos o grupo que acabou de criar
        db.select("users", "", function (resul) {


            var str = result.nameGroup.replace(/ /g, "")

            if (resul[req.user].myGroups != undefined) {
                resul[req.user].myGroups[str] = str
            }
            else {
                resul[req.user].myGroups = {}
                resul[req.user].myGroups[str] = str
            }
            db.insert(resul, "users", 'seriesdb')


           // res.send(true)
           res.redirect("/group")

        }, 'seriesdb')


    }
    })


router.get("/invite",requireAuth,function(req,res) {
    db.select("users","",function (data) {

            var aux=data[req.user].invite
            var groups=[]
            for(var key in aux){
                groups.push(aux[key].name)
            }
        res.render('groupInvite',{groups:groups,isUser: true})

    },"seriesdb")

})

router.post("/invite",requireAuth,function(req,res) {
    console.log("inviteee")
    var group = req.body.group;
    var perm = req.body.permission

    db.select("users", "", function (users) {

        var user=users[req.user]

        if (group != undefined && perm != undefined) {

                if(user.invite!=undefined){
                //Eliminar o grupo de invites
                //se eu aceitar vou inserir no others as permissoes
                //  e me registar no grupo mas se n  tiver ja registado
                //voltarei a registar
                //e eliminar do convite

                    if (perm == "accept") {

                                //entao registo se nao adiciono a permissao
                            if(user.otherGroups==undefined){
                                var o ={}
                                o.name=group
                                o.permission=perm
                                user.otherGroups={}
                                user.otherGroups[group]=o
                                delete user.invite[group]
                                users[req.user]=user
                                db.insert(users,"users","seriesdb")

                                res.redirect("/group")

                            }else{
                                user.otherGroups[group].permission=perm
                                delete user.invite[group]
                                users[req.user]=user
                                db.insert(users,"users","seriesdb")

                                res.redirect("/group")
                            }
                    } else {
                        console.log("Decline")
                        //eliminar o convite
                    delete user.invite[group]
                    users[req.user]=user
                    db.insert(users,"users","seriesdb")

                        res.redirect("/group")
                    }
            }
            else res.redirect("/group")

        }else res.redirect("/group")
    },'seriesdb')
})

router.post("/:name",requireAuth,function(req,res){

    var groupName = req.params.name

     if(req.body.nameSerie!=undefined ) {

        db.select(groupName, "", function (val) {

            var obj=val
            obj['_rev']=val._rev
            obj[req.body.nameSerie]=req.body.nameSerie

            for(var key in val) {
                if (key != "_id" && key != "_rev" && key != "guests" && key != "nameGroup"&&key!="owner")
                    obj[key]=val[key]
            }

            db.insert(obj,groupName,'seriesdb')
            res.redirect(groupName+'/')
        },'seriesdb')
    }
    else if (req.body.deletedSerie != undefined) {

        //ir buscar todos os utilizadores que tem esse grupo e apagar
        db.select(groupName, "", function (obj) {
            //tenho que percorrer tudo aqui obrigatoriamente

            //UPDATE
            console.log('update')
            var aux = obj
            aux['_rev'] = obj._rev
            delete aux[req.body.deletedSerie]
            console.log(aux)
            db.insert(aux, groupName, 'seriesdb')
            res.redirect(groupName + '/')
        }, 'seriesdb')
    }
    else if (req.body.permission != undefined) {
         console.log("body")
         console.log(req.body.user)
         var user = req.body.user //email

         db.select("users", "", function (users) {

             users[user].invite = {}
             users[user].invite[groupName] = {name: groupName, permission: req.body.permission}

             db.insert(users, "users", "seriesdb")
             res.redirect(groupName + '/')
         }, 'seriesdb')
     }
})


router.get("/:name",requireAuth,function(req,res,next) {

    var nameGroup = req.params.name
    var n = req.query.n

    if (n != undefined) {

        db.select(nameGroup, "", function (obj) {

            var arr = []

            for (var key in obj) {
                if (key != '_id' && key != '_rev' && key != 'nameGroup' && key != 'owner' && key != 'guests') {
                    var str = obj[key].replace(/ /g, "%20")
                    arr.push(str)
                }
            }

            var final = []
            var episodesFinal = []
            var ix = arr.length - 1
            arr.forEach(function (serieName, index) {
                data_server.searchSingleSerie(serieName, function (err, data) {


                    var o = {}
                    o.id = data.id
                    o.name = data.name
                    o.url = data.url
                    o.image = data.image.medium

                    var episodesFirst = []

                    data_server.getEpisodesOfSerie(data.id, function (err, data) {

                        if (n > data.length)episodesFinal = episodesFinal.concat(data)

                        var today = new Date()

                        data.forEach(function (episode) {

                            var anotherDay = new Date(episode.airdate)

                            if (((anotherDay.getMonth() + 1) >= (today.getMonth() + 1) && today.getYear() == anotherDay.getYear())|| ((anotherDay.getMonth() + 1) < (today.getMonth() + 1) && today.getYear() == anotherDay.getYear()) ) {

                                episodesFirst.push(episode)
                            }

                        })

                        for (var i = 0; i < n; i++) {
                            episodesFinal.push(episodesFirst[i])
                        }

                        if (ix - 1 == index) {
                            if (req.user != obj.owner) {

                                db.select("users","",function (users) {
                                    var arr = []
                                    for (var key in users) {
                                        if (key != '_id' && key != '_rev' && req.user != key) {
                                            arr.push(users[key].email)
                                        }
                                    }
                                        if(users[req.user].otherGroups[nameGroup].permission=="read"){
                                            res.render("otherGroup", {
                                                isUser: true,
                                                series: final,
                                                episodes: episodesFinal
                                            });
                                        }
                                        else  res.render("myGroup", {
                                            isUser: true,
                                            series: final,
                                            episodes: episodesFinal,
                                            users: arr})

                                },"seriesdb")


                            } else {
                                db.select("users", "", function (data) {

                                    var arr = []
                                    for (var key in data) {
                                        if (key != '_id' && key != '_rev' && req.user != key) {
                                            arr.push(data[key].email)
                                        }
                                    }

                                    res.render("myGroup", {
                                        isUser: true,
                                        series: final,
                                        episodes: episodesFinal,
                                        users: arr
                                    });
                                }, 'seriesdb')
                            }
                        }
                        final.push(o)
                    })
                })
            })
        }, 'seriesdb')
    }
    else {
        db.select(nameGroup, "", function (obj) {

            var arr = []

            for (var key in obj) {
                if (key != '_id' && key != '_rev' && key != 'nameGroup' && key != 'owner' && key != 'guests') {
                    var str = obj[key].replace(/ /g, "%20")
                    arr.push(str)
                }
            }

            var final = []
            var episodesFinal = []
            var i = arr.length - 1
            arr.forEach(function (serieName, index) {
                data_server.searchSingleSerie(serieName, function (err, data) {


                    var o = {}
                    o.id = data.id
                    o.name = data.name
                    o.url = data.url
                    o.image = data.image.medium

                    final.push(o)
                    if (i == index) {

                        if (req.user != obj.owner) {

                            db.select("users", "", function (users) {

                                var arr = []
                                for (var key in users) {
                                    if (key != '_id' && key != '_rev' && req.user != key) {
                                        arr.push(users[key].email)
                                    }
                                }
                                if (users[req.user].otherGroups[nameGroup].permission =="read") {

                                    res.render("otherGroup", {
                                        isUser: true,
                                        series: final,

                                    });
                                }
                                else  res.render("myGroup", {
                                    isUser: true,
                                    series: final,
                                    users: arr
                                })
                            },'seriesdb')
                        } else {
                            db.select("users", "", function (data) {

                                var arr = []
                                for (var key in data) {
                                    if (key != '_id' && key != '_rev' && req.user != key) {
                                        arr.push(data[key].email)
                                    }
                                }
                                //so owner deste grupo pode fazer isso
                                //para os invites ir buscar todos os users
                                //que tenham este grupo ou seja ir no othergroups
                                //e apresentar o nome dos users

                                /*
                                var invites=[]
                                var invite=data[req.user].invite

                                for (var key in invite) {
                                        invites.push(invite[key].name)
                                }*/


                                res.render("adminGroup", {
                                    nameGroup:nameGroup,
                                    isUser: true,
                                    series: final,
                                    episodes: episodesFinal,
                                    users: arr
                                });
                            },'seriesdb')
                        }
                    }
                })
            })
        }, 'seriesdb')
    }
})


module.exports=router;