import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Program, Wallet, AnchorProvider } from '@project-serum/anchor';
import idl from './m3sh_idl.json'; // Assume you have an IDL file for your program

// Function to design a new M3SH agent
async function designAgent(config) {
    const { learningAlgorithm, dataInputs, outputFormat } = config;
    
    // Connect to Solana network
    const connection = new Connection("devnet");
    const wallet = new Wallet(window.solana);
    const provider = new AnchorProvider(connection, wallet, {});
    const program = new Program(idl, new PublicKey("YOUR_PROGRAM_ID"), provider);

    try {
        // Prepare transaction to create a new agent
        const [agentPDA] = await PublicKey.findProgramAddress(
            [Buffer.from("m3sh_agent"), wallet.publicKey.toBuffer()],
            program.programId
        );
        const tx = await program.methods
            .createAgent(learningAlgorithm, dataInputs, outputFormat)
            .accounts({
                agent: agentPDA,
                owner: wallet.publicKey,
                systemProgram: web3.SystemProgram.programId,
            })
            .transaction();

        // Send transaction to the blockchain
        const signature = await provider.sendAndConfirm(tx);
        console.log('Agent created with signature:', signature);
        return agentPDA;

    } catch (error) {
        console.error('Failed to create agent:', error);
    }
}

// Function to update an agent
async function updateAgent(agentAddress, newConfig) {
    const connection = new Connection("devnet");
    const wallet = new Wallet(window.solana);
    const provider = new AnchorProvider(connection, wallet, {});
    const program = new Program(idl, new PublicKey("YOUR_PROGRAM_ID"), provider);

    try {
        // Update the agent's configuration
        const tx = await program.methods
            .updateAgent(newConfig.learningAlgorithm, newConfig.dataInputs, newConfig.outputFormat)
            .accounts({
                agent: agentAddress,
                owner: wallet.publicKey,
            })
            .transaction();

        const signature = await provider.sendAndConfirm(tx);
        console.log('Agent updated with signature:', signature);
    } catch (error) {
        console.error('Failed to update agent:', error);
    }
}

// Example usage
const agentConfig = {
    learningAlgorithm: "neural_network",
    dataInputs: ["temperature", "humidity"],
    outputFormat: "json"
};

designAgent(agentConfig).then(agentAddress => {
    console.log('New Agent Address:', agentAddress);
    // Later, you can update this agent
    const updatedConfig = {
        learningAlgorithm: "decision_tree",
        dataInputs: ["temperature", "humidity", "pressure"],
        outputFormat: "csv"
    };
    updateAgent(agentAddress, updatedConfig);
});
