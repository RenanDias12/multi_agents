import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
// import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from '@langchain/groq';
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// Define the tools for the agent to use
const agentTools = [new TavilySearchResults({ maxResults: 3 })];
const agentModel = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    modelName: 'llama-3.2-3b-preview',
});

// Initialize memory to persist state between graph runs
const agentCheckpointer = new MemorySaver();
const agent = createReactAgent({
    llm: agentModel,
    tools: agentTools,
    checkpointSaver: agentCheckpointer,
});

//save the graph draw
const graph = await agent.getGraphAsync();
const imageBuffer = await graph.drawMermaidPng();
const graphDir = 'src/graph';
if (!fs.existsSync(graphDir)) {
    fs.mkdirSync(graphDir);
}
const imagePath = path.join(graphDir, 'graph.png');
fs.writeFileSync(imagePath, Buffer.from(await imageBuffer.bytes()));


// Now it's time to use!
const agentFinalState = await agent.invoke(
    { messages: [new HumanMessage("what is the current weather in sao paulo?")] },
    { configurable: { thread_id: "42" } },
);

console.log(
    agentFinalState.messages[agentFinalState.messages.length - 1].content,
);

const agentNextState = await agent.invoke(
    { messages: [new HumanMessage("what about ny")] },
    { configurable: { thread_id: "42" } },
);

console.log(
    agentNextState.messages[agentNextState.messages.length - 1].content,
);