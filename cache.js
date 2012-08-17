var fs = require('fs'), path = require('path');
exports.coordConvert = function (cachedir, dir, leveldir, xdir, ydir, levely, ext){
    if (leveldir <= 9){
        leveldir = '0' + leveldir;
        }
    ydir = ((levely - ydir) - 1).toString();  
    var i = 0, j = 0;
    var l = xdir.length, m = ydir.length;
    while (i < 9 - l){
        xdir = '0' + xdir;
        i++;}
    while (j < 9 - m){
        ydir = '0' + ydir;
        j++;}
    //console.log('livello = ' +leveldir);
    //console.log('xdir = ' +xdir);
    //console.log('ydir = ' +ydir);
    var x1, x2, x3, y1, y2, y3;
    x1 = xdir.substring(0,3);
    x2 = xdir.substring(3,6);
    x3 = xdir.substring(6,9);
    y1 = ydir.substring(0,3);
    y2 = ydir.substring(3,6);
    y3 = ydir.substring(6,9) +'.'+ ext;
    //console.log(x1 + '/' + x2 + '/' + x3 + '/' + y1 + '/' + y2 + '/' + y3);
    //return [leveldir, x1, x2, x3, y1, y2, y3];
    var dirArray = [cachedir, dir, leveldir, x1, x2, x3, y1, y2, y3];
    return dirArray;
    //esiste (dirArray, '');
    }
exports.controlla = function (file, root){
   return esiste(file, root);
    }
    
 function esiste (file, root){
     //path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif')
     var fs = require('fs'), path= require('path');
     console.log(root);
     if (file.length == 1){
         return fs.existsSync(path.resolve(root, file[0]));
         }
    else {
     var x = file.shift();
     var temp = path.resolve(root, x);
     fs.exists(path.resolve(root, x), function (exists) {
         if (!exists) {
             fs.mkdir(path.resolve(root, x), function (err){
                 if (err) {console.log('errore: ' + err)}
                 });
             }
  });
return esiste(file, path.resolve(root, x));
}
     
     
     }
