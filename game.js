const uuidv4 = require('uuid/v4');

module.exports = function(server){

    var rooms = [];
    var io = require('socket.io')(server,{transports:['websocket']});

io.on('connect',function(socket){

    var createRoom = function(){
        var roomId = uuidv4();
        socket.join(roomId, function() {
            var room = { roomId: roomId, clients: [{ clientId: socket.id, ready: false }] };
            rooms.push(room);

            socket.emit('join', { roomId: roomId, clientId: socket.id });
        });

    }

    var getAvailableRoomId = function(){
        if(rooms.length>0){
            for(var i=0;i<rooms.length;i++){
                if(rooms[i].clients.length< 2){
                    var x= (Math.random()*rooms[i].clients.length);
                    return x;
                }
            }
        }
        return -1; 
    }

 i= Math.random()*rooms[i].clients.length;

    var roomIndex = getAvailableRoomId();

    if (roomIndex > -1) 
    {
        socket.join(rooms[roomIndex].roomId, function() 
        {
        var client = { clientId: socket.id, ready: false }
        rooms[roomIndex].clients.push(client);

    socket.emit('join', { roomId: rooms[roomIndex].roomId, clientId: socket.id });
    });
    } else 
    {
     createRoom();

    }

    socket.on('ready',function(data){
        if(!data)return;

        var room= rooms.find(room=>room.roomId===data.roomId);
        if(room){
            var clients = room.clients;
            var client = clients.find(client=>client.clientId===data.clientId);
            if(client) client.ready = true;

            if (clients.length == 2) {
                if (clients[0].ready == true && clients[1].ready == true) {
                    io.to(clients[0].clientId).emit('play', { first: true });
                    io.to(clients[1].clientId).emit('play', { first: false });
                }
            }


        }
    })

    socket.on('select',function(data){

        if(!data) return;
        var index = data.index;
        var roomId = data.roomId;
        if(index>-1&&roomId){
            socket.to(roomId).emit('selected',{index:index});
        }

    });  
    
    socket.on('win',function(data){

        if(!data) return;
        var index = data.index;
        var roomId = data.roomId;
        if(index>-1&&roomId){
            socket.to(roomId).emit('lose',{index:index});
        }

    });   
    
    socket.on('tie',function(data){

        if(!data) return;
        var index = data.index;
        var roomId = data.roomId;
        if(index>-1&&roomId){
            socket.to(roomId).emit('tie',{index:index});
        }

    });

  

    socket.on('disconnect',function(r){

        for (var i = 0; i < rooms.length; i++) {
        var client = rooms[i].clients.find(client => client.clientId === socket.id);
           if (client) {
               var clientIndex = rooms[i].clients.indexOf(client);
               rooms[i].clients.splice(clientIndex, 1);

                if (rooms[i].clients.length == 0) {
                    var roomIndex = rooms.indexOf(rooms[i]);
                    rooms.splice(roomIndex, 1);
                }
            }
        }
    });        
    });
};
