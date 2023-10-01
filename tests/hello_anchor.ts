import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HelloAnchor } from "../target/types/hello_anchor";

describe("hello_anchor", () => {
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.HelloAnchor as Program<HelloAnchor>;
    const keypair = anchor.web3.Keypair.generate();
    const provider = anchor.getProvider();

    it("is initialized", async () => {
        const options = {
            data: keypair.publicKey,
            signer: provider.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        }

        const tx = await program
            .methods
            .initialize("hello")
            .accounts(options)
            .signers([keypair])
            .rpc();

        console.log("Your transaction signature", tx);
    });
});
