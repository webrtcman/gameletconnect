export enum MediaType {
  audio = 'audio',
  video = 'video',
  screen = 'screen',
  screenAudio = 'screenAudio',
}

export enum SettingsTab {
  General = 0,
  Media = 1,
  Appearance = 2,
  About = 3
}

export enum WindowType {
  Info = 'info',
  Warning = 'warning',
  Danger = 'danger'
}

export enum LobbyType {
  Base = 'Base',
  Room = 'Room'
}

export enum Background {
  StarField = 'StarField',
  ColorOrbs = 'ColorOrbs',
  Simple = 'Simple'
}

export enum Buttons {
  Microphone = 0,
  Camera = 1,
  ScreenCapture = 2,
  Chat = 3,
  LeaveRoom = 4
}

export enum PopupTemplate {
  userAuth = 0,
  chat = 1,
  roomCreation = 2,
  screenCapturePicker = 3,
  settingsGeneral = 4,
  settingsMedia = 5,
  settingsAppearance = 6
}