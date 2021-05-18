import { desktopCapturer, DesktopCapturerSource, NativeImage } from "electron";

export class Utilities {

    public static async getCaptureSources() {
        return await desktopCapturer.getSources({ 
            types: ['window', 'screen'],
            thumbnailSize: {width: 250, height: 140}
          })
    }

    public static mapCaptureSources(sources: DesktopCapturerSource[]) {
        let screenSources: {id: string, thumbnail: string, name: string}[] = [];
        let windowSources: {id: string, thumbnail: string, name: string}[] = [];
        
        for (let source of sources) {
            let srcType = source.id.split(':')[0];
            
            let srcElement = {
                id: source.id, 
                name: source.name,
                thumbnail: (source.thumbnail as NativeImage).toDataURL() 
            }
            if(srcType === 'screen')
            screenSources.push(srcElement);
            else if(srcType === 'window')
            windowSources.push(srcElement);
        }
        return { screenSources, windowSources};
    }
}