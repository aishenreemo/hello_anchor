pub mod board;
pub mod errors;

use anchor_lang::prelude::*;
use board::Board;

declare_id!("HphBSRZUiKWettW3AMXZSpm4nB7SH4pjRqRvTHTJdgvs");

#[program]
pub mod hello_anchor {
    use super::*;

    pub fn create_board(ctx: Context<CreateBoard>, owner: Pubkey) -> Result<()> {
        ctx.accounts.board.start(owner)
    }
}

#[derive(Accounts)]
pub struct CreateBoard<'info> {
    #[account(init, payer=owner, space=Board::MAX_SIZE+8)]
    pub board: Account<'info, Board>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}
