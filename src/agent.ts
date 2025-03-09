import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

import { ChatGroq } from '@langchain/groq';
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { ResearcherAgent } from './agents/researcher.js';

// Define the tools for the agent to use
const agentModel = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    modelName: 'llama-3.2-3b-preview',
});

// Initialize memory to persist state between graph runs
const agentCheckpointer = new MemorySaver();
const researcher = new ResearcherAgent();
// const msg = new HumanMessage('Qual a ultima versão do Node.js?');
// const response = await researcher.invoke(
// { messages: [msg] },
// { checkpointSaver: agentCheckpointer }
// );
// console.log(response)

await researcher.drawGraph()