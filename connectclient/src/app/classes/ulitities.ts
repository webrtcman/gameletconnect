import { VideoResolution } from './enums';
import { Vector2 } from 'src/app/classes/vector2';
export class Utilities {

    public static getResolutionFromEnum(videoResolution: VideoResolution): Vector2 {
        let resolution: Vector2;
        switch(videoResolution){
            case(VideoResolution.FullHD):
                resolution = new Vector2(1920, 1080);
                break;
            case(VideoResolution.HD):
                resolution = new Vector2(1280, 720);
                break;
            case(VideoResolution.SD):
                resolution = new Vector2(1024, 576);
                break;
        }
        console.log(resolution.toString(), resolution.toMediaConstraint())
        return resolution;
    }
}