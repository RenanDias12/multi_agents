import { BaseAgent } from "../factory/base-agent.js";
import { AIMessage } from "@langchain/core/messages";

export class Recearcher extends BaseAgent {
    constructor() {
        super('Recearcher');
    }

    invoke() {
        return new AIMessage('I am a researcher');
    }
}