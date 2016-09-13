//127.0.0.1:5984/_utils/
var nano =require('nano')('http://127.0.0.1:5984');
var http = require("http"); 


//seriesdb


    function  createDb(name){
        nano.db.create(name ,function(err, body) {
            if (!err) {
                console.log('database  created!');
            }else console.log(err)
        });

    }

function destroyDb(name){
    nano.db.destroy(name);
}

//----------------------------------------------------------------
   //serve como update tb
//https://github.com/dscape/nano#dbinsertdoc-params-callback
//and also used to update an existing document, by including the _rev token in the document being saved:
   //if params is a string, its assumed as the intended document name
    function insert(res,iddoc,nameDb) {
        nano.use(nameDb).insert(res,iddoc, function (err, body, header) {
            if (err) {
                   console.log(err)
            } else {
                 console.log("Inserido")

                }
        });
    }

    function select(iddoc,whereparams,cb,nameDb) {
        nano.use(nameDb).get(iddoc,whereparams, function (err, body, header) {
            if (err) {
                     console.log(err)
            } else
                    cb(body,err)
        });
    }

    function delet(iddoc,nameDb)
    {

        nano.use(nameDb).get(iddoc, function (error, existing) {
            if (!error) {
                nano.use(nameDb).destroy(iddoc, existing._rev, function (err, body, header) {
                    if (!error) {

                      }
                });
            }
        });
    }

//feito por mim semi acabado
function update(res,iddoc,nameDb)
{
  select(iddoc,"",function(data){



  },nameDb)
}

module.exports={
    insert:insert,
    delete:delet,
    select:select,
    createDb:createDb,
    destroyDb:destroyDb,

}
