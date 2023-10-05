import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HelloAnchor } from "../target/types/hello_anchor";

describe("hello_anchor", () => {
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.HelloAnchor as Program<HelloAnchor>;
    const keypair = anchor.web3.Keypair.generate();
    const provider = anchor.getProvider();

    it("increments!", async () => {
        const initializeOptions = {
            data: keypair.publicKey,
            signer: provider.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        };

        await program
            .methods
            .initialize()
            .accounts(initializeOptions)
            .signers([keypair])
            .rpc();

        await program
            .methods
            .increment()
            .accounts({ data: keypair.publicKey })
            .rpc();

        await program
            .methods
            .increment()
            .accounts({ data: keypair.publicKey })
            .rpc();
    });
});
