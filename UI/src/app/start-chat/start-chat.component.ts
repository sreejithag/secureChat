import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SocketioService } from '../socketio.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start-chat',
  templateUrl: './start-chat.component.html',
  styleUrls: ['./start-chat.component.css']
})
export class StartChatComponent implements OnInit {

  isLoading:boolean = false;
  showSetup:boolean = true;
  isChatSetuped:boolean = false;
  chatid:string='';
  buttonText:string = 'Copy to clipboard'

  public title:String = environment.TITLE;

  chat_url:string = '';

  

  constructor(private socketio:SocketioService,private router: Router) { }

  

  ngOnInit(): void {
  }

  //method to hide setup and show url screen 
  hideSetup(){
    this.showSetup=false;
    this.isChatSetuped=true;
  }


  start(){
  //  this.isLoading=true
    // this.socketio.getRoomId().subscribe({
    //   next: data => {
    //     this.isLoading=false
    //     this.data = data
    //     this.chat_url=environment.HOST_Name+'/chat/'+this.data.roomid;
    //     this.isChatSetuped = true
    //     this.showSetup = false
    //   },
    //   error: error =>{
    //     console.log('error'+ error.message)
    //     this.isLoading=false
    //   }
      
    // })

    this.isLoading=false
    this.chatid=this.socketio.getChatId()
    this.chat_url=environment.HOST_Name+'/chat/'+this.chatid
    this.isChatSetuped = true
    this.showSetup = false

    
  }

  copyToClipboard(){
    
    navigator.clipboard.writeText(this.chat_url).then().catch(e => console.error(e))
    this.buttonText='Copied'
  }

  routeToChat(){
    this.router.navigate(['/chat/'+this.chatid])
  }

}
