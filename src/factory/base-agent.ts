import { AIMessage } from "@langchain/core/messages";
import { BaseToolkit } from "@langchain/core/tools";

export abstract class BaseAgent {
    name: string;
    private llm: any;
    tools: Array<any>;

    constructor(name: string) {
        this.name = name;
        this.llm = process.env.LLM;
        this.tools = new Array();
    }

    bindTools(tools: Array<BaseToolkit>) {
        this.tools = tools;
        this.tools.forEach(tool => {
            this.llm.bind(tool);
        });
    }

    abstract invoke(): AIMessage;
}