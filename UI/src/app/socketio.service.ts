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
    const observable = new Observable<any>((observer) => {
      this.socket.on('connected', (data: string) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });

    return observable;
  }

  async sentMessage(roomid: string, plainTextMessage: string, keypair: any) {
    try {
      const clinetPublicKey = this.crypto.convertPemToPublickey(
        sessionStorage.getItem('ClientPublicKeyPem')
      );

      const data = await this.crypto.encryptAes(plainTextMessage);
      const messageCipher = data.encrypted;
      const aesKeyCipher = await this.crypto.encryptRsa(
        data.passPhrase,
        clinetPublicKey
      );
      const signature = await this.crypto.signMessage(
        messageCipher,
        keypair.privateKey
      );
      const message = new Message(messageCipher, aesKeyCipher, signature);
      this.socket.emit('message', { roomid: roomid, message: message });
    } catch (err) {
      console.log(err);
    }
  }

  reciveMessage(privateKey: any) {
    const observable = new Observable<any>((observer) => {
      this.socket.on('message', async (data: any) => {
        console.log('Recived message');

        try {
          const signature = data.signature;
          const messageCipher = data.messasgeCipher;
          const aesKeyCipher = data.aesKeyCipher;
          const clinetPublicKey = this.crypto.convertPemToPublickey(
            sessionStorage.getItem('ClientPublicKeyPem')
          );

          const isValidMessage = await this.crypto.verifyMessage(
            messageCipher,
            clinetPublicKey,
            signature
          );

          if (isValidMessage) {
            console.log('Message signature Verified');

            const aeskey = await this.crypto.decryptRsa(
              aesKeyCipher,
              privateKey
            );

            console.log('Message Aes key decrypted');

            const message = await this.crypto.decryptAes(messageCipher, aeskey);

            console.log('Message decrypted');

            observer.next(message);
          }
        } catch (err) {
          console.log(err);
        }
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
    const observable = new Observable<any>((observer) => {
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
    const observable = new Observable<any>((observer) => {
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
    const observable = new Observable<any>((observer) => {
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
