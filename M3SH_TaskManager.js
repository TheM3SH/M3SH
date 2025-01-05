import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Program, Wallet, AnchorProvider } from '@project-serum/anchor';
import idl from './m3sh_tasks_idl.json'; // Assume you have an IDL file for your program

// Simulate AI-driven matching system
async function matchTaskToAgents(task, agents, performanceHistory) {
    // This function simulates AI analysis for agent suitability
    // In reality, you'd use a machine learning model or complex algorithm
    return agents.sort((a, b) => {
        const scoreA = calculateSuitabilityScore(a, task, performanceHistory[a.publicKey.toString()]);
        const scoreB = calculateSuitabilityScore(b, task, performanceHistory[b.publicKey.toString()]);
        return scoreB - scoreA; // Sort by score descending
    }).slice(0, 3); // Return top 3 agents
}

// Simulate calculating suitability score based on skill set, performance, and availability
function calculateSuitabilityScore(agent, task, performance) {
    let score = 0;
    for (let skill of task.required_skills) {
        if (agent.skills.includes(skill)) score += 5;
    }
    score += (performance.successRate * 3) || 0; // Assuming 0-100 success rate
    score -= (performance.currentTasks * 2) || 0; // Penalize for being busy
    return score;
}

// Post a new task
async function postTask(taskDescription, requiredSkills) {
    const connection = new Connection("devnet");
    const wallet = new Wallet(window.solana);
    const provider = new AnchorProvider(connection, wallet, {});
    const program = new Program(idl, new PublicKey("YOUR_PROGRAM_ID"), provider);

    const [taskPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("m3sh_task"), wallet.publicKey.toBuffer()],
        program.programId
    );

    try {
        const tx = await program.methods
            .postTask(taskDescription, requiredSkills)
            .accounts({
                task: taskPDA,
                owner: wallet.publicKey,
                systemProgram: web3.SystemProgram.programId,
            })
            .transaction();
        
        const signature = await provider.sendAndConfirm(tx);
        console.log('Task posted with signature:', signature);
        return taskPDA;
    } catch (error) {
        console.error('Failed to post task:', error);
    }
}

// Assign task to the best-fit agent
async function assignTask(taskAddress, agent) {
    const connection = new Connection("devnet");
    const wallet = new Wallet(window.solana);
    const provider = new AnchorProvider(connection, wallet, {});
    const program = new Program(idl, new PublicKey("YOUR_PROGRAM_ID"), provider);

    try {
        const tx = await program.methods
            .assignTask(agent.publicKey)
            .accounts({
                task: taskAddress,
                owner: wallet.publicKey,
            })
            .transaction();

        const signature = await provider.sendAndConfirm(tx);
        console.log('Task assigned with signature:', signature);
    } catch (error) {
        console.error('Failed to assign task:', error);
    }
}

// Example usage
const task = {
    description: "Analyze weather data for anomaly detection",
    required_skills: ["data_analysis", "weather_modeling"]
};

const agents = [
    { publicKey: new PublicKey("..."), skills: ["data_analysis", "weather_modeling"], currentTasks: 2 },
    { publicKey: new PublicKey("..."), skills: ["data_analysis"], currentTasks: 0 },
    // More agents...
];

const performanceHistory = {
    "agentPublicKey1": { successRate: 90, currentTasks: 2 },
    "agentPublicKey2": { successRate: 85, currentTasks: 0 },
    // More performance data...
};

postTask(task.description, task.required_skills).then(taskAddress => {
    matchTaskToAgents(task, agents, performanceHistory).then(bestAgents => {
        if (bestAgents.length > 0) {
            assignTask(taskAddress, bestAgents[0]); // Assign to the highest scoring agent
        } else {
            console.log('No suitable agents found');
        }
    });
});

// Simulate agent submitting a solution
async function submitSolution(taskAddress, solution) {
    // This would be called by the agent's client after processing the task
    // Here, it's simulated for the example
    const connection = new Connection("devnet");
    const agentWallet = new Wallet(window.solana); // Assume the agent's wallet
    const provider = new AnchorProvider(connection, agentWallet, {});
    const program = new Program(idl, new PublicKey("YOUR_PROGRAM_ID"), provider);

    try {
        const tx = await program.methods
            .submitSolution(solution)
            .accounts({
                task: taskAddress,
                assigned_agent: agentWallet.publicKey,
            })
            .transaction();

        const signature = await provider.sendAndConfirm(tx);
        console.log('Solution submitted with signature:', signature);
    } catch (error) {
        console.error('Failed to submit solution:', error);
    }
}

// Example of submitting a solution
submitSolution(taskAddress, "Solution data here");
