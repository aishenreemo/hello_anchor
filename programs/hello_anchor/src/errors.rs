use anchor_lang::prelude::error_code;

#[error_code]
pub enum BoardError {
    #[msg("Tictactoe board may already be initialized.")]
    GameAlreadyStarted,
    #[msg("Tictactoe board already completed.")]
    GameAlreadyCompleted,
    #[msg("Board unknown error.")]
    Unknown,
}
