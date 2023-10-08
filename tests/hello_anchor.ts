import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HelloAnchor } from "../target/types/hello_anchor";

describe("hello_anchor", () => {
    anchor.setProvider(anchor.AnchorProvider.env());

    const provider = anchor.getProvider();
    const program = anchor.workspace.HelloAnchor as Program<HelloAnchor>;
    const boardSeeds = [
        anchor.utils.bytes.utf8.encode("tictactoe-board"),
        provider.publicKey.toBuffer(),
    ];

    const [boardPDA, boardBump] = anchor
        .web3
        .PublicKey
        .findProgramAddressSync(boardSeeds, program.programId);

    const boardAccounts = {
        board: boardPDA,
        owner: provider.publicKey,
    };

    it("initializes board", async () => {
        await program
            .methods
            .createBoard(boardBump)
            .accounts(boardAccounts)
            .rpc()
            .catch((error) => console.log(`Account may be already initialized.\n${error}`));

        console.log(await program.account.board.fetch(boardPDA));
    });

    it("restarts board", async() => {
        await program
            .methods
            .startBoard()
            .accounts(boardAccounts)
            .rpc();

        console.log(await program.account.board.fetch(boardPDA));
    });

    it("makes move", async () => {
        await program
            .methods
            .makeMove(provider.publicKey, 0, {"x": {}})
            .accounts(boardAccounts)
            .rpc();

        console.log(await program.account.board.fetch(boardPDA));
    });

    it("completes board", async () => {
        await program
            .methods
            .completeBoard()
            .accounts(boardAccounts)
            .rpc();

        console.log(await program.account.board.fetch(boardPDA));
    })
});
