use anchor_lang::prelude::*;

declare_id!("91oNEpN75rjQ7aX1SusupVU7qjZASEH3wkEXnC5Hcjbf");

#[program]
pub mod ballotana {
    use super::*;
   
    pub fn initialize_poll(ctx: Context<InitializePool>, poll_id: u64, description:String, poll_start:u64, poll_end:u64) -> Result<()> {
        ctx.accounts.poll.set_inner(Poll{
            poll_id,
            description,
            poll_start,
            poll_end,
            candidate_amount:0,
        });
        Ok(())
    }

    pub fn initialize_candidate(ctx: Context<InitializeCandidate>,candidate_name:String, _poll_id: u64)->Result<()>{
        ctx.accounts.candidate.set_inner(Candidate { candidate_name, candidate_votes:0 });
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

#[derive(Accounts)]
#[instruction(candidate_name:String, poll_id:u64)]
pub struct InitializeCandidate<'info>{
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll:Account<'info, Poll>,

    #[account(
        init,
        payer=signer,
        space=8+Candidate::INIT_SPACE,
        seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],
        bump
    )]
    pub candidate:Account<'info,Candidate>,
    pub system_program:Program<'info,System>
}

#[account]
#[derive(InitSpace)]
pub struct Candidate{
    #[max_len(32)]
    pub candidate_name:String,
    pub candidate_votes:u64
}