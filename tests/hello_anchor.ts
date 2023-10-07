import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HelloAnchor } from "../target/types/hello_anchor";

describe("hello_anchor", () => {
    anchor.setProvider(anchor.AnchorProvider.env());

    const provider = anchor.getProvider();
    const program = anchor.workspace.HelloAnchor as Program<HelloAnchor>;

    it("initializes board", async () => {
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

        // await program
        //     .methods
        //     .createBoard(boardBump)
        //     .accounts(boardAccounts)
        //     .rpc()
        //     .catch((error) => console.log(`Account may be already initialized.\n${error}`));

        // await program
        //     .methods
        //     .startBoard()
        //     .accounts(boardAccounts)
        //     .rpc();

        // await program
        //     .methods
        //     .completeBoard()
        //     .accounts(boardAccounts)
        //     .rpc();

        console.log(await program.account.board.fetch(boardPDA));
    });
});
