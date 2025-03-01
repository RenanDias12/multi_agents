import { AIMessage } from "@langchain/core/messages";
import { BaseToolkit } from "@langchain/core/tools";
import { ChatGroq } from '@langchain/groq';
import { ChatOpenAI } from "@langchain/openai";
import { State } from "../states/state.js";

export abstract class BaseAgent {
    name: string;
    llm!: ChatGroq | ChatOpenAI;
    tools: Record<string, any>;

    constructor(name: string) {
        this.name = name;
        this.tools = {};

        if (!process.env.LLM || !process.env.LLM_TEMPERATURE) {
            throw new Error('LLM is not defined');
        }

        const GROQ_LLMS = ['llama', 'deepseek']
        if (GROQ_LLMS.some(llm => process.env.LLM?.includes(llm))) {
            this.llm = new ChatGroq({
                apiKey: process.env.GROQ_API_KEY,
                modelName: process.env.LLM,
                temperature: parseFloat(process.env.LLM_TEMPERATURE)
            });
        }
        else if (process.env.LLM.includes('gpt')) {
            this.llm = new ChatOpenAI({
                apiKey: process.env.OPENAI_API_KEY,
                modelName: process.env.LLM,
                temperature: parseFloat(process.env.LLM_TEMPERATURE)
            });
        }
    }

    abstract initGraph(): void;

    abstract invoke(state: State): Promise<State>;
}