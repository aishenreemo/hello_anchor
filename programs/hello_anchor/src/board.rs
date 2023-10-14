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
    pub const WINNING_POSITIONS: [[u8; 3]; 8] = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    pub const MAX_SIZE: usize = (1 + 32) * 5 + 2 + (1 * 9) + 1 + 8;

    pub fn new(bump: u8) -> Board {
        let mut board = Board::default();
        board.bump = bump;
        board
    }

    pub fn start(&mut self, owner: Pubkey) -> Result<()> {
        self.players = [Player::None; 5];
        self.players[0] = Player::Robot;
        self.players[1] = Player::Human { pubkey: owner };

        self.state = BoardState::Active;
        self.tiles = [Sign::N; 9];
        self.turn = 1;

        Ok(())
    }

    pub fn make_player_move(
        &mut self,
        participant: Pubkey,
        index: usize,
        key: Sign,
    ) -> Result<()> {
        require!(index < 9, BoardError::TictactoeIndexOutOfBounds);

        // player move
        self.tiles[index] = key;
        self.turn += 1;
        self.add_participant(participant)?;
        if let Ok(_) = self.try_win(key, false) {
            return Ok(());
        }

        // robot move
        self.make_robot_move(key.opposite())?;
        let _ = self.try_win(key.opposite(), true);

        Ok(())
    }

    fn try_win(&mut self, key: Sign, is_robot: bool) -> Result<()> {
        for &winning_pos in Board::WINNING_POSITIONS.iter() {
            if winning_pos.iter().all(|&i| self.tiles[i as usize] == key) {
                self.complete(is_robot)?;
                return Ok(());
            }
        }

        err!(BoardError::Unknown)
    }

    fn complete(&mut self, is_robot_winner: bool) -> Result<()> {
        require!(self.state == BoardState::Active, BoardError::GameAlreadyCompleted);

        self.state = BoardState::Completed { is_robot_winner };
        self.turn = 0;

        Ok(())
    }

    fn add_participant(&mut self, participant: Pubkey) -> Result<()> {
        let is_existing_participant = self.players.iter().any(|player| match player {
            Player::Human { pubkey } => pubkey == &participant,
            Player::Robot | Player::None => false,
        });

        if is_existing_participant {
            return Ok(());
        }

        for player in self.players.iter_mut() {
            if player == &Player::None {
                *player = Player::Human { pubkey: participant };
                break;
            }
        }

        Ok(())
    }

    fn make_robot_move(
        &mut self,
        key: Sign,
        ) -> Result<()> {
        let possible_moves = self.possible_moves();

        require!(possible_moves.len() > 0, BoardError::TictactoeNoAvailableMoves);

        let clock = Clock::get()?;
        let index = clock.unix_timestamp as usize % possible_moves.len();
        let tile_index = possible_moves[index];

        self.tiles[tile_index] = key;
        self.turn += 1;

        Ok(())
    }

    fn possible_moves(&self) -> Vec<usize> {
        let mut output = vec![];

        for (i, tile) in self.tiles.iter().enumerate() {
            if *tile == Sign::N {
                output.push(i);
            }
        }

        return output;
    }
}

impl Sign {
    fn opposite(&self) -> Sign {
        match *self {
            Sign::N => Sign::N,
            Sign::X => Sign::O,
            Sign::O => Sign::X,
        }
    }
}
