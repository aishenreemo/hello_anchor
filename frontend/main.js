import * as anchor from "@coral-xyz/anchor";
import buffer from "buffer";

import board from "./board.js";
import utils from "./utils.js";

const PROGRAM_ID = "vGsRgLSQh24Jb2BjJkR6TFQGcmq2q9JBwv81qQZoQ4h";

async function main() {
    utils.showLoader();
    const walletProvider = utils.getProvider();
    const anchorProgram = await getProgram();

    await createEvents(anchorProgram);
    await walletProvider.connect({ onlyIfTrusted: true })
        .catch(() => utils.syncDisplayOnConnection());
    utils.hideLoader();
}

async function createEvents(anchorProgram) {
    const walletProvider = utils.getProvider();

    const toggleConnectButton = document.getElementById("connect-wallet");
    toggleConnectButton.addEventListener("click", async () => walletProvider.isConnected
        ? await walletProvider.disconnect()
        : await walletProvider.connect()
    );

    walletProvider.on("connect", async () => {
        utils.showLoader();
        const balanceElement = document.getElementById("sol-balance");
        const balance = await anchorProgram.provider.connection
            .getBalance(walletProvider.publicKey);

        balanceElement.innerText = `${balance / anchor.web3.LAMPORTS_PER_SOL} SOL`;
        toggleConnectButton.innerText = "Disconnect Wallet";
        utils.setErrorMessage("");

        utils.syncDisplayOnConnection();
        await board.fetchBoards(anchorProgram);
        utils.hideLoader();
    });

    walletProvider.on("disconnect", () => {
        utils.showLoader();
        utils.syncDisplayOnConnection();
        toggleConnectButton.innerText = "Connect Wallet";
        utils.setErrorMessage("");
        utils.hideLoader();
    });

    const createBoardButton = document.getElementById("create-your-board");
    const cooldownCreateBoard = utils.cooldown(
        board.createBoard,
        "Creating board button is on cooldown!",
        20000,
    );

    createBoardButton.addEventListener("click", () => cooldownCreateBoard(anchorProgram));
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
