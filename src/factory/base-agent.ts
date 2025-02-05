import { AIMessage } from "@langchain/core/messages";
import { BaseToolkit } from "@langchain/core/tools";
import { ChatGroq } from '@langchain/groq';
import { ChatOpenAI } from "@langchain/openai";
import { State } from "../states/state.js";

export abstract class BaseAgent {
    name: string;
    llm!: ChatGroq | ChatOpenAI;
    tools: Array<any>;

    constructor(name: string) {
        this.name = name;
        this.tools = new Array();

        if (!process.env.LLM) {
            throw new Error('LLM is not defined');
        }

        if (process.env.LLM.includes('llama')) {
            this.llm = new ChatGroq({
                apiKey: process.env.GROQ_API_KEY,
                modelName: process.env.LLM,
            });
        }
        else if (process.env.LLM.includes('gpt')) {
            this.llm = new ChatOpenAI({
                apiKey: process.env.OPENAI_API_KEY,
                modelName: process.env.LLM,
            });
        }
    }

    bindTools(tools: Array<BaseToolkit>) {
        this.tools = tools;
        this.tools.forEach(tool => {
            this.llm.bind(tool);
        });
    }

    abstract invoke(state: State): Promise<AIMessage>;
}