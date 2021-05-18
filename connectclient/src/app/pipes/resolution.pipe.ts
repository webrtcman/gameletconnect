import { VideoResolution } from './../classes/enums';
import { Pipe, PipeTransform } from '@angular/core';
import { Utilities } from '../classes/ulitities';

@Pipe({
  name: 'resolutionConvert'
})
export class ResolutionPipe implements PipeTransform {

  transform(resolution: VideoResolution): string {
    return `${Utilities.getResolutionFromEnum(resolution).toString()} (${resolution})` ;
  }

}
