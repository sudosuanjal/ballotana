use anchor_lang::prelude::*;

declare_id!("91oNEpN75rjQ7aX1SusupVU7qjZASEH3wkEXnC5Hcjbf");

#[program]
pub mod ballotana {
    use super::*;
   
    pub fn initialize_poll(ctx: Context<InitializePool>, poll_id: u64) -> Result<()> {
        Ok(())
    }
   
}


#[derive(Accounts)]
#[instruction(poll_id:u64)]
pub struct InitializePool<'info>{
    #[account(mut)]
    pub signer :Signer<'info>,
    #[account(
        init,
        payer=signer,
        space=8+Poll::INIT_SPACE,
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,
    pub system_program: Program<'info, System>
}

#[account]
#[derive(InitSpace)]
pub struct Poll{
    pub poll_id:u64,
    #[max_len(280)]
    pub description:String,
    pub poll_start:u64,
    pub poll_end:u64,
    pub candidate_amount:u64
}