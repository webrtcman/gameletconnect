import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron'

@Injectable({
  providedIn: 'root'
})
export class ElectronService {

  private ipc: IpcRenderer | undefined;

  constructor() {
    if(window.require) {
      try {
        this.ipc = window.require('electron').ipcRenderer;
      }catch(e) { console.error(e); }
    }
    else{
      console.warn('Electron IPC Service could not be loaded.');
    }
   }

   public on(channel: string, listener): void {
    if (!this.ipc) {
      return;
    }
    this.ipc.on(channel, listener);
  }

   public connectToServer(): void {
     this.ipc.send('client::connect');
   }

   public setName(name: string): void {
     this.ipc.send('client::setname', name);
   }

   public getLobbies(): void {
     this.ipc.send('client::getlobbies');
   }

   public createLobby(lobbyName: string): void {
     this.ipc.send('client::createlobby', lobbyName);
   }

   public joinLobby(lobbyId: number): void {
     this.ipc.send('client::joinlobby', lobbyId);
   }
}
