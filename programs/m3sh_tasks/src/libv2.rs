use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("YOUR_PROGRAM_ID");

#[program]
pub mod m3sh_tasks {
    use super::*;

    pub fn post_task(
        ctx: Context<PostTask>,
        task_description: String,
        required_skills: Vec<String>,
    ) -> ProgramResult {
        let task = &mut ctx.accounts.task;
        task.owner = *ctx.accounts.owner.key;
        task.description = task_description;
        task.required_skills = required_skills;
        task.status = "Posted".to_string();
        Ok(())
    }

    pub fn assign_task(
        ctx: Context<AssignTask>,
        agent: Pubkey,
    ) -> ProgramResult {
        let task = &mut ctx.accounts.task;
        task.assigned_agent = Some(agent);
        task.status = "Assigned".to_string();
        Ok(())
    }

    pub fn submit_solution(
        ctx: Context<SubmitSolution>,
        solution: String,
    ) -> ProgramResult {
        let task = &mut ctx.accounts.task;
        task.solution = Some(solution);
        task.status = "Completed".to_string();
        Ok(())
    }
}

#[account]
pub struct Task {
    pub owner: Pubkey,
    pub description: String,
    pub required_skills: Vec<String>,
    pub assigned_agent: Option<Pubkey>,
    pub solution: Option<String>,
    pub status: String,
}

#[derive(Accounts)]
pub struct PostTask<'info> {
    #[account(init, payer = owner, space = 8 + 32 + 100 + 4 + 4 + 100 + 1)]
    pub task: Account<'info, Task>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AssignTask<'info> {
    #[account(mut, has_one = owner)]
    pub task: Account<'info, Task>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct SubmitSolution<'info> {
    #[account(mut, has_one = assigned_agent)]
    pub task: Account<'info, Task>,
    pub assigned_agent: Signer<'info>,
}
