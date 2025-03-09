import { BaseAgent } from "../factory/base-agent.js";
import { AIMessage, SystemMessage } from "@langchain/core/messages";
import { StateGraph, END, START, CompiledStateGraph, StateDefinition } from "@langchain/langgraph";
import { State } from "../states/state.js";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { GraphOptions } from "../interfaces/graph-options.js";

export class ResearcherAgent extends BaseAgent {
    prompt: SystemMessage;

    constructor() {
        super('RecearcherAgent');
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
            const response = await this.llm.invoke(messages);

            return { messages: response };
        }

        const tavilyNode = async (state: State) => {
            const tool = new TavilySearchResults({ maxResults: 3 })
            const message = state['messages'][state['messages'].length - 1] as AIMessage
            if (message.tool_calls && message.tool_calls.length > 0) {
                message.tool_calls.forEach(async call => {
                    if (call.name === 'tavily_search_results_json') {
                        if (message.tool_calls) {
                            const response = await tool.invoke(message.tool_calls[0]);
                            return { messages: response };
                        }
                    }
                });
            }
            return { messages: [] };
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

    async invoke(state: State, options: GraphOptions): Promise<State> {
        if (this.graph === undefined) {
            throw Error('Graph not defined!')
        }

        return await this.graph.invoke(state, options as any);
    }
}