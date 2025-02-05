import { BaseAgent } from "../factory/base-agent.js";
import { AIMessage } from "@langchain/core/messages";
import { State } from "../states/state.js";

export class Recearcher extends BaseAgent {
    prompt: { role: string; content: string; };

    constructor() {
        super('Recearcher');
        this.prompt = {
            role: 'System',
            // content: 'You are a researcher, use your tool and return a response.'
            content: 'You are a researcher, return a response.'
        };
    }

    async invoke(state: State): Promise<AIMessage> {
        const message = [
            this.prompt,
            state.messages[state.messages.length - 1]
        ];
        let response = await this.llm.invoke(message);

        return response;
    }
}