var express = require('express');
var health = require('express-ping');
var http=require('http');
var request = require('request');
var app = express();
var expressWs = require('express-ws')(app);
var matrice=[0,0,0];
app.use(health.ping());
const WebSocket = require('ws');
var events = require('events');
var eventEmitter = new events.EventEmitter();

app.use(function (req, res, next) {
  
      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8100');
  
      // Request methods you wish to allow
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

      res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
      res.header('Access-Control-Allow-Credentials', "true");
    
      next();
  });
/*const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
wss.on('connection', function connection(ws, req) {
  

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  try{ 
    ws.send(JSON.stringify(matrice));
  }catch(e){
    console.log("errore sulla porta");
    
  }

  eventEmitter.on('cambio', function(){
    console.log("cambio stato dei server");
    try{ 
      ws.send(JSON.stringify(matrice));
    }catch(e){
      console.log("errore sulla porta");
      
    }
  });

 
  
});*/

var server = http.createServer(app);
var io = require('socket.io')(server);
io.on('connection', function(client){
  console.log("connesso");
  //client.emit('matrice',matrice);
  try{ 
    //ws.send(JSON.stringify(matrice));
    client.emit('matrice',matrice);
  }catch(e){
    console.log("errore sulla porta");
    
  }

  eventEmitter.on('cambio', function(){
    console.log("cambio stato dei server");
    try{ 
      //ws.send(JSON.stringify(matrice));
      client.broadcast.emit('matrice',matrice);
    }catch(e){
      console.log("errore sulla porta");
      
    }
  });
  client.on('disconnect', function(){});
});

server.listen(3003, function listening() {
  console.log('Listening on %d', server.address().port);
  var a=function(urlTo, server){
    request.get({url:urlTo, time : true}, function (error, response, body) {
      var vecchio=matrice[server-1];
      //
      if(!error){
        //console.log('server '+server+': statusCode:', response && response.statusCode+' time:', response.elapsedTime);
        //jsresp=JSON.parse(body);
        //console.log('load avg'+jsresp.resources.loadavg);
        //console.log('load avg'+JSON.stringify(jsresp.resources.memory));
        var stc=response.statusCode;
        switch (true) {
          case (stc>=400 && stc<=417):
            
            matrice[server-1]=0;
            
            break;
            case (stc=='undefined'):
            matrice[server-1]=0;
            break;
          case (stc>=500 && stc<=505):
            matrice[server-1]=0;
          break;
          case (stc>=200 && stc<=206):
            matrice[server-1]=1;
          break;
          default:
            break;
        }
      }else{
        //console.log('server '+server+' error: ', error.code); // Print the error if one occurred
        matrice[server-1]=0;
      }
      //console.log("vecchio",vecchio);
      //console.log("nuovo",matrice[server-1]);
      if(vecchio!==matrice[server-1]) 
      { console.log("cambio");
        eventEmitter.emit('cambio');}
      //console.log(JSON.stringify(matrice));
    });
  
  }
  
  
    setInterval(function(){
      a("http://localhost:3000/res",1);
      a("http://localhost:3001/res",2);    
      a("http://localhost:3002/res",3);    
      
    }, 3000);
});

/*app.listen(3004, function () {

  console.log('Example app listening on port 3000!');

var a=function(urlTo, server){
  request.get({url:urlTo, time : true}, function (error, response, body) {
    if(!error){
      //console.log('server '+server+': statusCode:', response && response.statusCode+' time:', response.elapsedTime);
      //jsresp=JSON.parse(body);
      //console.log('load avg'+jsresp.resources.loadavg);
      //console.log('load avg'+JSON.stringify(jsresp.resources.memory));
      var stc=response.statusCode;
      switch (true) {
        case (stc>=400 && stc<=417):
          matrice[server-1]=0;
          break;
          case (stc=='undefined'):
          matrice[server-1]=0;
          break;
        case (stc>=500 && stc<=505):
          matrice[server-1]=0;
        break;
        case (stc>=200 && stc<=206):
          matrice[server-1]=1;
        break;
        default:
          break;
      }
    }else{
      //console.log('server '+server+' error: ', error.code); // Print the error if one occurred
      matrice[server-1]=0;
    }
    //console.log(JSON.stringify(matrice));
  });

}


  setInterval(function(){
    a("http://localhost:3000/res",1);
    a("http://localhost:3001/res",2);    
    a("http://localhost:3002/res",3);    
    
  }, 3000);
    
  
});*/
