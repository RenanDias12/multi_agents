import 'dotenv/config';

import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { ResearcherAgent } from './agents/researcher.js';


// Initialize memory to persist state between graph runs
const agentCheckpointer = new MemorySaver();
const researcher = new ResearcherAgent();
const msg = new HumanMessage('Qual a ultima versão do Node.js?');
const response = await researcher.invoke(
    { messages: [msg] },
    { checkpointSaver: agentCheckpointer }
);
console.log(response)

// await researcher.drawGraph()