use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("YOUR_PROGRAM_ID");

#[program]
pub mod m3sh_mesh {
    use super::*;

    pub fn form_connection(
        ctx: Context<FormConnection>,
        task_id: u64,
        data_need: String,
    ) -> ProgramResult {
        let mesh_connection = &mut ctx.accounts.mesh_connection;
        mesh_connection.task_id = task_id;
        mesh_connection.data_need = data_need;
        mesh_connection.agent_a = *ctx.accounts.agent_a.key;
        mesh_connection.agent_b = *ctx.accounts.agent_b.key;
        mesh_connection.active = true;
        Ok(())
    }

    pub fn dissolve_connection(
        ctx: Context<DissolveConnection>,
    ) -> ProgramResult {
        let mesh_connection = &mut ctx.accounts.mesh_connection;
        mesh_connection.active = false;
        Ok(())
    }

    pub fn update_data_permissions(
        ctx: Context<UpdateDataPermissions>,
        new_permissions: String,
    ) -> ProgramResult {
        let mesh_connection = &mut ctx.accounts.mesh_connection;
        mesh_connection.data_permissions = new_permissions;
        Ok(())
    }
}

#[account]
pub struct MeshConnection {
    pub task_id: u64,
    pub data_need: String,
    pub data_permissions: String,
    pub agent_a: Pubkey,
    pub agent_b: Pubkey,
    pub active: bool,
}

#[derive(Accounts)]
pub struct FormConnection<'info> {
    #[account(init, payer = agent_a, space = 8 + 8 + 4 + 32 + 32 + 1 + 100)]
    pub mesh_connection: Account<'info, MeshConnection>,
    #[account(mut)]
    pub agent_a: Signer<'info>,
    pub agent_b: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DissolveConnection<'info> {
    #[account(mut, has_one = agent_a)]
    pub mesh_connection: Account<'info, MeshConnection>,
    pub agent_a: Signer<'info>,
    pub agent_b: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct UpdateDataPermissions<'info> {
    #[account(mut, has_one = agent_a)]
    pub mesh_connection: Account<'info, MeshConnection>,
    pub agent_a: Signer<'info>,
    pub agent_b: AccountInfo<'info>,
}
