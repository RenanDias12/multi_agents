import { BaseAgent } from "../factory/base-agent_.js";
import { AIMessage, SystemMessage } from "@langchain/core/messages";
import { StateGraph, Command } from "@langchain/langgraph";
import { State } from "../states/state.js";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

export class Recearcher extends BaseAgent {
    prompt: SystemMessage;

    constructor() {
        super('Recearcher');
        this.prompt = new SystemMessage({
            content: 'You are a researcher, use your tool and return a response.',
        });
    }

    // async researcherNode(state: State): Command<> {
    //     const messages = [this.prompt, state.messages].flat();
    //     const response = await this.llm.invoke(messages);
    //     return new Command({
    //         update: {
    //             messages: response
    //         },
    //         goto: 'tool'
    //     })
    // }

    initGraph(): void {
        const researcherNode = async (state: State) => {
            const messages = [this.prompt, state.messages].flat();
            const response = await this.llm.invoke(messages);
            return new Command({
                update: {
                    messages: response
                },
                goto: 'tool'
            })
        }

        const tavilyNode = async (state: State) => {
            const tool = new TavilySearchResults({ maxResults: 3 })
            tool.invoke()
        }

        const graph = new StateGraph(State);
        graph.addNode('researcher', this.researcherNode);
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