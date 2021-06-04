export class Message {
  private messasgeCipher: string;
  private aesKeyCipher: string;
  private signature: string;

  constructor(messageCipher: string, aesKeyCipher: string, signature: string) {
    this.messasgeCipher = messageCipher;
    this.aesKeyCipher = aesKeyCipher;
    this.signature = signature;
  }
}
