import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Server } from '@hocuspocus/server';

@Injectable()
export class CollaborationService implements OnModuleInit, OnModuleDestroy {
  private server: Server;

  onModuleInit() {
    this.server = Server.configure({
      port: 1234,

      async onAuthenticate(data) {
        const { token, documentName } = data;
        if (!token) {
          throw new Error('Unauthorized: no token provided');
        }
        // Token will be verified in the extension; here we just pass through
        return { user: { name: `User-${token.slice(0, 6)}` } };
      },

      async onConnect(data) {
        console.log(`Client connected to document: ${data.documentName}`);
      },

      async onDisconnect(data) {
        console.log(`Client disconnected from document: ${data.documentName}`);
      },
    });

    this.server.listen();
    console.log('Hocuspocus collaboration server running on ws://localhost:1234');
  }

  onModuleDestroy() {
    this.server.destroy();
  }
}
