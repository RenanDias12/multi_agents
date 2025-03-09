import { MemorySaver } from "@langchain/langgraph";

export interface GraphOptions {
    checkpointSaver: MemorySaver
}