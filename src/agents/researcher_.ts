import { BaseAgent } from "../factory/base-agent_.js";
import { AIMessage, SystemMessage, HumanMessage } from "@langchain/core/messages";
import { StateGraph, END, START, CompiledStateGraph, StateDefinition } from "@langchain/langgraph";
import { State } from "../states/state.js";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { Runnable } from "@langchain/core/runnables";

export class Researcher extends BaseAgent {
    prompt: SystemMessage;
    graph!: CompiledStateGraph<State, any, "__start__", any, any, StateDefinition>;
    // 'You are a researcher agent, first you will create a tool call and then when you receive a ToolMessage you will return a response'

    constructor() {
        super('Recearcher');
        const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        this.prompt = new SystemMessage(
            `You are a researcher agent, and today is ${new Date().toLocaleDateString('en-US', dateOptions)}`
        );

        this.initTools();
        this.initGraph();
    }

    initTools(): void {
        const tool = new TavilySearchResults({ maxResults: 3 })
        this.llm = this.llm.bindTools([tool]) as any;
        this.tools[tool.name] = tool
    }

    initGraph(): void {
        const researcherNode = async (state: State) => {
            const messages = [this.prompt, ...state.messages];
            console.log(messages)
            const response = await this.llm.invoke(messages);

            return { messages: response };
        }

        const tavilyNode = async (state: State) => {
            const tool = new TavilySearchResults({ maxResults: 3 })
            const message = state['messages'][state['messages'].length - 1]
            const response = tool.invoke(message)

            return { messages: response };
        }

        const shouldCallTool = (state: State) => {
            const message = state['messages'][state['messages'].length - 1] as AIMessage

            if (message.tool_calls && message.tool_calls.length > 0) {
                return message.tool_calls[0].name
            }

            return END
        }
        const graph = new StateGraph(State);

        graph.addNode('researcher', researcherNode);
        graph.addNode('tavily_search_results_json', tavilyNode);

        graph.addEdge(START, 'researcher' as any);
        graph.addEdge('tavily_search_results_json' as any, 'researcher' as any);
        graph.addConditionalEdges('researcher' as any, shouldCallTool);

        this.graph = graph.compile()
    }

    async invoke(state: State): Promise<State> {
        if (this.graph === undefined) {
            throw Error('Graph not defined!')
        }

        return await this.graph.invoke(state);
    }
}