use anchor_lang::prelude::*;

declare_id!("HphBSRZUiKWettW3AMXZSpm4nB7SH4pjRqRvTHTJdgvs");

#[program]
pub mod hello_anchor {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, msg: String) -> Result<()> {
        let data = &mut ctx.accounts.data;
        data.message = msg;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer=signer, space=std::mem::size_of::<Data>()+8)]
    pub data: Account<'info, Data>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Data {
    pub message: String,
}
