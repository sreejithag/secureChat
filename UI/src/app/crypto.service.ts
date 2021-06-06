import { Injectable } from '@angular/core';
import * as forge from 'node-forge';
import * as aes from 'crypto-js/aes';
import * as cryptojs from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  constructor() {}

  generateRsaKeys(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      forge.pki.rsa.generateKeyPair(
        { bits: 2048, workers: 2 },
        (err, keypair) => {
          if (!err) {
            resolve(keypair);
          } else {
            reject(err);
          }
        }
      );
    });

    return promise;
  }

  signMessage(message: string, privatekey: any): Promise<any> {
    const promise = new Promise((resolve) => {
      let md = forge.md.sha1.create();

      md.update(message, 'utf8');

      let signature = privatekey.sign(md);

      resolve(signature);
    });
    return promise;
  }

  verifyMessage(message: string, publickey: any, signature: any): Promise<any> {
    const promise = new Promise((resolve) => {
      let md = forge.md.sha1.create();
      md.update(message, 'utf8');
      let verication = publickey.verify(md.digest().bytes(), signature);
      resolve(verication);
    });

    return promise;
  }

  encryptAes(message: string): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      let passPhrase = this.generatePassPhrase();
      let cipher = aes.encrypt(message, passPhrase);

      resolve({ encrypted: cipher.toString(), passPhrase: passPhrase });
    });

    return promise;
  }

  decryptAes(encrypted: any, passPhrase: string): Promise<any> {
    const promise = new Promise((resolve) => {
      let decrypted = aes.decrypt(encrypted, passPhrase);

      resolve(decrypted.toString(cryptojs.enc.Utf8));
    });
    return promise;
  }

  encryptRsa(data: any, publicKey: any): Promise<any> {
    const promise = new Promise((resolve) => {
      let rsaEncrypted = publicKey.encrypt(forge.util.encodeUtf8(data));

      resolve(forge.util.encode64(rsaEncrypted));
    });

    return promise;
  }

  decryptRsa(encrypted: any, privateKey: any): Promise<any> {
    const promise = new Promise((resolve) => {
      let decrypted = privateKey.decrypt(forge.util.decode64(encrypted));

      resolve(decrypted);
    });

    return promise;
  }

  convertPublickeyToPem(publicKey: any) {
    return forge.pki.publicKeyToPem(publicKey);
  }

  convertPemToPublickey(publicKeyPem: any) {
    return forge.pki.publicKeyFromPem(publicKeyPem);
  }

  generatePassPhrase() {
    let pass = '';
    let str =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
      'abcdefghijklmnopqrstuvwxyz0123456789@#$!&*%';

    for (let i = 1; i <= 15; i++) {
      var char = Math.floor(Math.random() * str.length + 1);

      pass += str.charAt(char);
    }

    return pass;
  }
}
