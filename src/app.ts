require('dotenv').config();
import Main from "./classes/main";
import { app, BrowserWindow} from 'electron';

Main.main(app, BrowserWindow);
