
function Room(roomid,maxClients){
    this.maxClients = maxClients
    this.roomid = roomid
    this.clients = []
}

Room.prototype.setRoomid = function(roomid){
    this.roomid = roomid
}

Room.prototype.setMaxClients = function(maxClients){
    this.maxClients = maxClients
}

Room.prototype.addClient = function(clientId){
    if(this.clients.length < this.maxClients){
        this.clients.push(clientId)
    }
    else{
        throw 'Exceeded MaxClients'
    }
}

Room.prototype.removeClient = function(clientId){
    this.clients.splice(this.clients.indexOf(clientId),1)
}

Room.prototype.getCurrentClientsNo = function(){
    return this.clients.length
}

module.exports = Room