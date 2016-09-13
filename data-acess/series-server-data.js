/**
 * Created by Jaqueline on 02/09/2016.
 */
var http_requests = require("../utils/http-request");


var options = {
    hostname: 'api.tvmaze.com',
    path: '',
    method: 'GET'

};

function changeOptions(path) {
    options.path=path
    return options
}
function searchSingleSerie(name,cb){
    var path ='/singlesearch/shows?q='+name
    http_requests(changeOptions(path), cb);
}

function searchSerie(name,cb){
    var path ='/search/shows?q='+name
    http_requests(changeOptions(path), cb);
}

function getSeasonsOfSerie(id,cb) {
    var path ='/shows/'+id+'/seasons'
    http_requests(changeOptions(path), cb);
}
function getCastOfSerie(id,cb) {
    var path ='/shows/'+id+'/cast'
    http_requests(changeOptions(path), cb);
}
function getEpisodesOfSerie(id,cb) {
    var path ='/shows/'+id+'/episodes'
    http_requests(changeOptions(path), cb);
}


module.exports = {
    searchSingleSerie:searchSingleSerie,
    searchSerie: searchSerie,
    getSeasonsOfSerie: getSeasonsOfSerie,
    getCastOfSerie: getCastOfSerie,
    getEpisodesOfSerie:getEpisodesOfSerie
}