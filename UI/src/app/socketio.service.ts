import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import {environment} from '../environments/environment';
import { v4 as uuid, validate as uuidValidate  } from 'uuid';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket:any
  constructor(private http: HttpClient) { }

  //setup the socketio
  setupSocketConnection() {
    this.socket = io(environment.SOCKET_ENDPOINT);
  }

  // genarate a room id 
  getChatId(){
    
    return uuid()
    // return this.http.get(environment.GETROOM_URL)
  }

  //method to validate the chat id
  validateChatId(chatId:string){
    return uuidValidate(chatId)
  }


  joinChat(chatid:string){

    this.socket.emit('join',chatid)
  }


  userJoined(){

    let observable = new Observable<any>(observer=>{
      this.socket.on('connected',(data:string)=>{
        observer.next(data);
      });
      return () => {this.socket.disconnect();}
    });

    return observable;
  }


  sentMessage(chatid:string,message:string){
    this.socket.emit('message',{"chatid":chatid,"message":message})
  }


  reciveMessage(){

    let observable = new Observable<any>(observer=>{
      this.socket.on('message',(data:any)=>{
        console.log(data)
        observer.next(data);
      });
      return () => {this.socket.disconnect();}
    });

    return observable;
  }


iamOnline(chatid:string){

  this.socket.emit('iam online',{"chatid":chatid})
}


isOnline(){
  let observable = new Observable<any>(observer=>{
    this.socket.on('online',(data:any)=>{
      console.log(data)
      observer.next(data);
    });
    return () => {this.socket.disconnect();}
  });

  return observable;

}

  
}
