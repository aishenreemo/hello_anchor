pub mod board;
pub mod errors;

use anchor_lang::prelude::*;
use board::Board;

declare_id!("vGsRgLSQh24Jb2BjJkR6TFQGcmq2q9JBwv81qQZoQ4h");

#[program]
pub mod hello_anchor {
    use super::*;

    pub fn create_board(ctx: Context<CreateBoard>, bump: u8) -> Result<()> {
        ctx.accounts.board.set_inner(Board::new(bump));
        Ok(())
    }

    pub fn start_board(ctx: Context<MutateBoard>) -> Result<()> {
        ctx.accounts.board.start(ctx.accounts.owner.key())
    }

    pub fn complete_board(ctx: Context<MutateBoard>) -> Result<()> {
        ctx.accounts.board.complete()
    }
}

#[derive(Accounts)]
pub struct CreateBoard<'info> {
    #[account(
        init,
        payer=owner,
        space=Board::MAX_SIZE+8,
        seeds=[b"tictactoe-board", owner.key.as_ref()],
        bump,
    )]
    pub board: Account<'info, Board>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MutateBoard<'info> {
    #[account(mut, seeds=[b"tictactoe-board", owner.key.as_ref()], bump)]
    pub board: Account<'info, Board>,
    pub owner: Signer<'info>,
}
