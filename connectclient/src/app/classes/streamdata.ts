import { MediaType } from "./enums";

export class StreamData {
    sourceId: string;
    consumerId: string;
    stream?: MediaStream;
    streamType?: MediaType

    constructor(
        sourceId: string, 
        consumerId: string, 
        stream?: MediaStream, 
        streamType?: MediaType
    ){
        this.sourceId = sourceId;
        this.consumerId = consumerId;
        this.stream = stream;
        this.streamType = streamType;
    }
}