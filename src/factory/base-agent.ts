import * as fs from 'fs';
import * as path from 'path';

import { ChatGroq } from '@langchain/groq';
import { ChatOpenAI } from "@langchain/openai";
import { State } from "../states/state.js";
import { GraphOptions } from '../interfaces/graph-options.js';
import { CompiledStateGraph, StateDefinition } from '@langchain/langgraph';


export abstract class BaseAgent {
    name: string;
    tools: Record<string, any>;
    llm!: ChatGroq | ChatOpenAI;
    graph!: CompiledStateGraph<State, any, "__start__", any, any, StateDefinition>;

    constructor(name: string) {
        this.name = name;
        this.tools = {};

        if (!process.env.LLM || !process.env.LLM_TEMPERATURE) {
            throw new Error('LLM is not defined');
        }

        const GROQ_LLMS = ['llama', 'deepseek', 'gemma']
        if (GROQ_LLMS.some(llm => process.env.LLM?.includes(llm))) {
            this.llm = new ChatGroq({
                apiKey: process.env.GROQ_API_KEY,
                modelName: process.env.LLM,
                temperature: parseFloat(process.env.LLM_TEMPERATURE),
                cache: false
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

    async drawGraph(saveDir?: string) {
        const graph = await this.graph.getGraphAsync()
        const imageBuffer = await graph.drawMermaidPng();
        const graphDir = saveDir ?? 'src/graph';
        if (!fs.existsSync(graphDir)) {
            fs.mkdirSync(graphDir);
        }
        const imagePath = path.join(graphDir, `${this.name}.png`);
        fs.writeFileSync(imagePath, Buffer.from(await imageBuffer.bytes()));
    }

    abstract initGraph(): void;

    abstract invoke(state: State, options?: GraphOptions): Promise<State>;
}