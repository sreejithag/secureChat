import { Component, OnInit } from '@angular/core';
import { SocketioService } from '../socketio.service';
import { SafeHtmlPipe } from '../safe-html.pipe';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {

  messages : string='';

  loadingMsg : string = 'Setting up Chat, please wait...'

  isLoading : Boolean = true;

  chatid: string = ''

  isConnected: boolean = false;

  constructor(private socketService: SocketioService, private route:ActivatedRoute) {

      this.messages=''

      
   }

  ngOnInit(){


   this.route.paramMap.subscribe({
      next: params=>{
         let chatid = params.get('chatid') || ''

         //validate if chat is valid by validating the uuid or not and sets up the socket connection
         if(this.socketService.validateChatId(chatid)){

            this.isLoading=false
            this.chatid=chatid
            this.socketService.setupSocketConnection()
            this.socketService.joinChat(chatid)

         }
         else{
            this.loadingMsg='Chat id is not valid try again'
         }

      },
      error : error =>{
         console.log("error"+ error.message)
      }
   })

   this.socketService.userJoined()
         .subscribe(data=>{
            console.log('connected')
            this.isConnected=true
            this.socketService.iamOnline(this.chatid)
         })

   this.socketService.isOnline()
         .subscribe(data=>{
            this.isConnected=data
         })


   this.socketService.reciveMessage()
         .subscribe(data=>{
            this.messages=this.messages + `
            <div class="flex items-end">
             <div class="flex flex-col space-y-2 max-w-xs mx-2 order-2 items-start">
                <div><span class="px-4 py-2 rounded-lg inline-block bg-gray-300 text-gray-600">${data}</span></div>
             </div>
          </div>

            `
         })

   

  }

  sent(chat:NgForm){
    
   if((chat.value.message!=null && chat.value.message!='') && this.isConnected ){
      this.socketService.sentMessage(this.chatid,chat.value.message)
      this.messages=this.messages+`
      <div class="chat-message">
      <div class="flex items-end justify-end">
         <div class="flex flex-col space-y-2  max-w-xs mx-2 order-1 items-end">
            <div><span class="px-4 py-2 rounded-lg inline-block rounded-br-none bg-blue-600 text-white ">${chat.value.message}</span></div>
         </div>
      </div>
   </div>
    `;

    chat.resetForm()
   }
    

    

   
  }

}
