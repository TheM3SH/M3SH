use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("YOUR_PROGRAM_ID");

#[program]
pub mod m3sh_agent {
    use super::*;

    pub fn create_agent(
        ctx: Context<CreateAgent>,
        learning_algorithm: String,
        data_inputs: Vec<String>,
        output_format: String,
    ) -> ProgramResult {
        let agent = &mut ctx.accounts.agent;
        agent.owner = *ctx.accounts.owner.key;
        agent.learning_algorithm = learning_algorithm;
        agent.data_inputs = data_inputs;
        agent.output_format = output_format;
        Ok(())
    }

    pub fn update_agent(
        ctx: Context<UpdateAgent>,
        learning_algorithm: String,
        data_inputs: Vec<String>,
        output_format: String,
    ) -> ProgramResult {
        let agent = &mut ctx.accounts.agent;
        agent.learning_algorithm = learning_algorithm;
        agent.data_inputs = data_inputs;
        agent.output_format = output_format;
        Ok(())
    }
}

#[account]
pub struct Agent {
    pub owner: Pubkey,
    pub learning_algorithm: String,
    pub data_inputs: Vec<String>,
    pub output_format: String,
}

#[derive(Accounts)]
pub struct CreateAgent<'info> {
    #[account(init, payer = owner, space = 8 + 32 + 8 + 320 + 8)]
    pub agent: Account<'info, Agent>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateAgent<'info> {
    #[account(mut, has_one = owner)]
    pub agent: Account<'info, Agent>,
    pub owner: Signer<'info>,
}
