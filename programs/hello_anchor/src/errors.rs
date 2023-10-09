use anchor_lang::prelude::error_code;

#[error_code]
pub enum BoardError {
    #[msg("Tictactoe board already completed.")]
    GameAlreadyCompleted,
    #[msg("Provided index argument is out of bounds.")]
    TictactoeIndexOutOfBounds,
    #[msg("Board unknown error.")]
    Unknown,
}
