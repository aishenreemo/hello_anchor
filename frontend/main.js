import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import buffer from "buffer";

async function main() {
    const walletProvider = getProvider();
    const anchorProgram = await getProgram(walletProvider);

    await walletProvider.connect({ onlyIfTrusted: true });
    await createEvents(walletProvider, anchorProgram);
}

async function createEvents(walletProvider, anchorProgram) {
    const connectButton = document.getElementById("connect-wallet");
    const disconnectButton = document.getElementById("disconnect-wallet");
    const initializeNewAccountButton = document.getElementById("initialize-button");

    connectButton.addEventListener("click", async () => {
        await walletProvider.connect();
    });

    disconnectButton.addEventListener("click", async () => {
        await walletProvider.disconnect();
    });

    initializeNewAccountButton.addEventListener("click", async () => {
        const keypair = anchor.web3.Keypair.generate();
        const options = {
            data: keypair.publicKey,
            signer: walletProvider.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        }

        const tx = await anchorProgram
            .methods
            .initialize("hello")
            .accounts(options)
            .signers([keypair])
            .rpc();

        console.log("Your transaction signature", tx);
        console.log(await anchorProgram.account.data.all());
    })
}

async function getProgram(walletProvider) {
    window.Buffer = window.Buffer || buffer.Buffer;

    const options = anchor.AnchorProvider.defaultOptions();
    const connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
    const anchorProvider = new anchor.AnchorProvider(connection, walletProvider, options);

    return new anchor.Program(
        await anchor.Program.fetchIdl("HDYyTAVBJL1JMp3kUukxy784micPpWRMBjBZF9zJQ1cX", anchorProvider),
        new web3.PublicKey("HDYyTAVBJL1JMp3kUukxy784micPpWRMBjBZF9zJQ1cX"),
        anchorProvider
    );
}

function getProvider() {
    if (window?.phantom?.solana?.isPhantom) {
        return window.phantom.solana;
    }

    window.open("https://phantom.app/", "_blank");
}

main();
