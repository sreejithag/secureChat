import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from '../environments/environment';
import { v4 as uuid, validate as uuidValidate } from 'uuid';
import { Observable } from 'rxjs';
import { CryptoService } from './crypto.service';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root',
})
export class SocketioService {
  socket: any;
  constructor(private crypto: CryptoService) {}

  //setup the socketio
  setupSocketConnection() {
    this.socket = io(environment.SOCKET_ENDPOINT);
  }

  // genarate a room id
  getChatId() {
    return uuid();
  }

  //method to validate the chat id
  validateChatId(chatId: string) {
    return uuidValidate(chatId);
  }

  joinChat(chatid: string, callback: (status: boolean) => void) {
    this.socket.emit('join', chatid, callback);
  }

  userJoined() {
    let observable = new Observable<any>((observer) => {
      this.socket.on('connected', (data: string) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });

    return observable;
  }

  sentMessage(roomid: string, plainTextMessage: string, keypair: any) {
    let clinetPublicKey = this.crypto.convertPemToPublickey(
      localStorage.getItem('ClientPublicKeyPem')
    );
    this.crypto.encryptAes(plainTextMessage).then((data) => {
      let messasgeCipher = data.encrypted;

      this.crypto
        .encryptRsa(data.passPhrase, clinetPublicKey)
        .then((aesKeyEncrypted) => {
          let aesKeyCipher = aesKeyEncrypted;
          this.crypto
            .signMessage(messasgeCipher, keypair.privateKey)
            .then((sign) => {
              let signature = sign;

              let message = new Message(
                messasgeCipher,
                aesKeyCipher,
                signature
              );

              this.socket.emit('message', { roomid: roomid, message: message });
            });
        });
    });
  }

  reciveMessage(privateKey: any) {
    let observable = new Observable<any>((observer) => {
      this.socket.on('message', (data: any) => {
        console.log('Recived message');
        let signature = data.signature;
        let messageCipher = data.messasgeCipher;
        let aesKeyCipher = data.aesKeyCipher;
        let clinetPublicKey = this.crypto.convertPemToPublickey(
          localStorage.getItem('ClientPublicKeyPem')
        );
        this.crypto
          .verifyMessage(messageCipher, clinetPublicKey, signature)
          .then((verified) => {
            if (verified) {
              console.log('Message signature Verified');
              this.crypto
                .decryptRsa(aesKeyCipher, privateKey)
                .then((aeskey) => {
                  console.log('Message Aes key decrypted');
                  this.crypto
                    .decryptAes(messageCipher, aeskey)
                    .then((message) => {
                      console.log('Message decrypted');
                      observer.next(message);
                    });
                })
                .catch((err) => {
                  console.log(err);
                });
            }
          });
      });
      return () => {
        this.socket.disconnect();
      };
    });

    return observable;
  }

  iamOnline(roomid: string) {
    this.socket.emit('iam online', { roomid: roomid });
  }

  isOnline() {
    let observable = new Observable<any>((observer) => {
      this.socket.on('online', (data: any) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });

    return observable;
  }

  sendPublicKey(publicKey: any, roomid: string) {
    this.socket.emit('publickeyExchange', {
      roomid: roomid,
      publicKey: publicKey,
    });
  }

  requestPublicKey(roomid: string) {
    this.socket.emit('publickeyRequest', {
      roomid: roomid,
    });
  }

  ispublicKeyNeeded() {
    let observable = new Observable<any>((observer) => {
      this.socket.on('publickeyRequest', (data: any) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });

    return observable;
  }

  recivePublicKey() {
    let observable = new Observable<any>((observer) => {
      this.socket.on('publickeyExchange', (data: any) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });

    return observable;
  }
}
