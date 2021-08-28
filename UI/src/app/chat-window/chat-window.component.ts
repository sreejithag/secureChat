import { Component, OnInit } from '@angular/core';
import { SocketioService } from '../socketio.service';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CryptoService } from '../crypto.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css'],
})
export class ChatWindowComponent implements OnInit {
  messages: string = '';

  loadingMsg: string = 'Validating the room id..';

  isLoading: Boolean = true;

  chatid: string = '';

  isConnected: boolean = false;

  Keypair: any;

  haveClientPublicKey: boolean = false;

  isKeypairGenerated: boolean = false;

  ClientPublicKeyPem: string = '';

  constructor(
    private socketService: SocketioService,
    private route: ActivatedRoute,
    private crypto: CryptoService,
    private router: Router
  ) {
    this.messages = '';
  }

  ngOnInit() {
    this.route.paramMap.subscribe({
      next: (params) => {
        const chatid = params.get('chatid') || '';

        //validate if chat is valid by validating the uuid or not and sets up the socket connection
        if (this.socketService.validateChatId(chatid)) {
          this.chatid = chatid;
          this.loadingMsg = 'Establishing connection to server..';
          this.socketService.setupSocketConnection();
          this.socketService.joinChat(chatid, (status: boolean) => {
            if (status) {
              this.loadingMsg = 'Generating encryption keys..';
              this.crypto
                .generateRsaKeys()
                .then((keypair) => {
                  console.log('Generated Keypair');

                  this.Keypair = keypair;

                  this.isKeypairGenerated = true;

                  this.loadingMsg = 'Waiting for the client..';

                  const keypairPem = this.crypto.convertPublickeyToPem(
                    this.Keypair.publicKey
                  );
                  this.socketService.sendPublicKey(keypairPem, this.chatid);

                  this.socketService.requestPublicKey(this.chatid);

                  this.socketService
                    .reciveMessage(this.Keypair.privateKey)
                    .subscribe((data) => {
                      this.messages =
                        this.messages +
                        `
            <div class="flex items-end">
             <div class="flex flex-col space-y-2 max-w-xs mx-2 order-1 items-start">
                <div><span class="px-4 py-2 rounded-lg inline-block bg-gray-300 text-gray-600">${data}</span></div>
             </div>
          </div>

            `;
                    });
                })
                .catch((err) => {
                  console.log(err);
                  this.isLoading = true;
                  this.loadingMsg = 'Key generation failed please retry';
                });
            } else {
              this.loadingMsg = 'Max Client limit exceeded';
            }
          });
        } else {
          this.loadingMsg = 'Chat id is not valid try again';
        }
      },
      error: (error) => {
        console.log('error' + error.message);
      },
    });

    this.socketService.recivePublicKey().subscribe((publicKeyPem) => {
      console.log('Recived client publickey ');
      sessionStorage.setItem('ClientPublicKeyPem', publicKeyPem);
      this.haveClientPublicKey = true;
      this.isLoading = false;
    });

    this.socketService.userJoined().subscribe((data) => {
      this.loadingMsg = 'Client conncted waiting for client publicKey..';
      this.isConnected = true;
      this.socketService.iamOnline(this.chatid);
      if (this.isKeypairGenerated) {
        const keypairPem = this.crypto.convertPublickeyToPem(
          this.Keypair.publicKey
        );
        this.socketService.sendPublicKey(keypairPem, this.chatid);
      }
      this.socketService.requestPublicKey(this.chatid);
    });

    this.socketService.ispublicKeyNeeded().subscribe((data) => {
      if (this.isKeypairGenerated) {
        const keypairPem = this.crypto.convertPublickeyToPem(
          this.Keypair.publicKey
        );
        this.socketService.sendPublicKey(keypairPem, this.chatid);
      }
    });

    this.socketService.isOnline().subscribe((data) => {
      this.isConnected = data;
      if (!data) {
        this.isLoading = true;
        this.haveClientPublicKey = false;
        this.loadingMsg = 'Client disconncted waiting for clinet..';
      }
    });
  }

  sent(chat: NgForm) {
    if (
      chat.value.message != null &&
      chat.value.message != '' &&
      this.isConnected
    ) {
      this.socketService.sentMessage(
        this.chatid,
        chat.value.message,
        this.Keypair
      );
      this.messages =
        this.messages +
        `
      <div class="chat-message">
      <div class="flex items-end justify-end">
         <div class="flex flex-col space-y-2  max-w-xs mx-2 order-2 items-end">
            <div><span class="px-4 py-2 rounded-lg inline-block rounded-br-none bg-blue-600 ">${chat.value.message}</span></div>
         </div>
      </div>
   </div>
    `;

      chat.resetForm();
    }
  }
}
