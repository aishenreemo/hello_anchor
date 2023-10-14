use anchor_lang::prelude::error_code;

#[error_code]
pub enum BoardError {
    #[msg("Tictactoe board already completed.")]
    GameAlreadyCompleted,
    #[msg("Provided index argument is out of bounds.")]
    TictactoeIndexOutOfBounds,
    #[msg("Tictactoe board has no available moves left.")]
    TictactoeNoAvailableMoves,
    #[msg("Board unknown error.")]
    Unknown,
}
