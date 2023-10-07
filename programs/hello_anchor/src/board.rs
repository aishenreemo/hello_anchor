use num_derive::FromPrimitive;
use num_derive::ToPrimitive;
use anchor_lang::prelude::*;

use super::errors::BoardError;

#[account]
#[derive(Default)]
pub struct Board {
    players: [Player; 5],
    state: BoardState,
    tiles: [Sign; 9],
    turn: u8,
    bump: u8,
}

#[derive(
    AnchorSerialize,
    AnchorDeserialize,
    Clone,
    PartialEq,
    Eq,
    Debug,
    Default
)]
pub enum BoardState {
    #[default]
    Active,
    Tie,
    Completed { is_robot_winner: bool },
}

#[derive(AnchorSerialize, AnchorDeserialize, Copy, Clone, PartialEq, Eq, Debug, Default)]
pub enum Player {
    #[default]
    None,
    Robot,
    Human { pubkey: Pubkey },
}

#[derive(
    AnchorSerialize,
    AnchorDeserialize,
    FromPrimitive,
    ToPrimitive,
    Copy,
    Clone,
    PartialEq,
    Eq,
    Debug,
    Default,
)]
pub enum Sign {
    #[default]
    N,
    X,
    O,
}

impl Board {
    pub const MAX_SIZE: usize = (1 + 32) * 5 + 2 + (1 * 9) + 1 + 8;

    pub fn new(bump: u8) -> Board {
        let mut board = Board::default();
        board.bump = bump;
        board
    }

    pub fn start(&mut self, owner: Pubkey) -> Result<()> {
        require!(self.turn == 0, BoardError::GameAlreadyStarted);

        self.players = [Player::None; 5];
        self.players[0] = Player::Robot;
        self.players[1] = Player::Human { pubkey: owner };

        self.state = BoardState::Active;
        self.tiles = [Sign::N; 9];
        self.turn = 1;

        Ok(())
    }

    pub fn complete(&mut self) -> Result<()> {
        require!(self.state == BoardState::Active, BoardError::GameAlreadyCompleted);

        self.state = BoardState::Completed { is_robot_winner: false };
        self.turn = 0;

        Ok(())
    }
}
