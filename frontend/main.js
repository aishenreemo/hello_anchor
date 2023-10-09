import * as anchor from "@coral-xyz/anchor";
import buffer from "buffer";

import board from "./board.js";
import utils from "./utils.js";

const PROGRAM_ID = "vGsRgLSQh24Jb2BjJkR6TFQGcmq2q9JBwv81qQZoQ4h";

async function main() {
    const walletProvider = utils.getProvider();
    const anchorProgram = await getProgram();

    await createEvents(anchorProgram);
    await walletProvider.connect({ onlyIfTrusted: true })
        .catch(() => utils.syncDisplayOnConnection());
}

async function createEvents(anchorProgram) {
    const errorElement = document.getElementById("error");
    const walletProvider = utils.getProvider();

    const toggleConnectButton = document.getElementById("connect-wallet");
    toggleConnectButton.addEventListener("click", async () => walletProvider.isConnected
        ? await walletProvider.disconnect()
        : await walletProvider.connect()
    );

    walletProvider.on("connect", async () => {
        const balanceElement = document.getElementById("sol-balance");
        const balance = await anchorProgram.provider.connection
            .getBalance(walletProvider.publicKey);

        balanceElement.innerText = `${balance / anchor.web3.LAMPORTS_PER_SOL} SOL`;
        toggleConnectButton.innerText = "Disconnect Wallet";
        errorElement.innerText = "";

        utils.syncDisplayOnConnection();
        await board.fetchBoards(anchorProgram);
    });

    walletProvider.on("disconnect", () => {
        utils.syncDisplayOnConnection();
        toggleConnectButton.innerText = "Connect Wallet";
        errorElement.innerText = "";
    });

    const createBoardButton = document.getElementById("create-your-board");
    createBoardButton.addEventListener("click", () => board.createBoard(anchorProgram));
}

async function getProgram() {
    window.Buffer = buffer.Buffer;

    const walletProvider = utils.getProvider();
    const options = anchor.AnchorProvider.defaultOptions();
    const connection = new anchor.web3.Connection(anchor.web3.clusterApiUrl("devnet"), "confirmed");
    const anchorProvider = new anchor.AnchorProvider(connection, walletProvider, options);

    return new anchor.Program(
        await anchor.Program.fetchIdl(PROGRAM_ID, anchorProvider),
        new anchor.web3.PublicKey(PROGRAM_ID),
        anchorProvider
    );
}

main();
