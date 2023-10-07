import * as anchor from "@coral-xyz/anchor";
import buffer from "buffer";

const PROGRAM_ID = "vGsRgLSQh24Jb2BjJkR6TFQGcmq2q9JBwv81qQZoQ4h";

async function main() {
    const walletProvider = getProvider();
    const anchorProgram = await getProgram(walletProvider);

    await walletProvider.connect({ onlyIfTrusted: true }).catch(() => {});
    await createEvents(walletProvider);
    await fetchAccounts(anchorProgram);
}

async function createEvents(walletProvider) {
    const toggleConnectButton = document.getElementById("connect-wallet");
    const buttonText = walletProvider.isConnected ? "Disconnect" : "Connect";

    toggleConnectButton.innerText = `${buttonText} Wallet`;
    toggleConnectButton.addEventListener("click", async () => {
        if (walletProvider.isConnected) {
            await walletProvider.disconnect();
            toggleConnectButton.innerText = "Connect Wallet";

            return;
        }

        await walletProvider.connect();
        toggleConnectButton.innerText = "Disconnect Wallet";
    });
}

async function fetchAccounts(anchorProgram) {
    console.log(anchorProgram.account);
    const dataContainer = document.getElementById("data-container");
    const dataList = await anchorProgram.account.board.all();

    for (let i = 0; i < dataList.length; i++) {
        const div = document.createElement("div");
        div.innerText = `${dataList[i].publicKey}: ${JSON.stringify(dataList[i].account)}`;

        dataContainer.appendChild(div);
        console.log(dataList[i]);
    }
}

async function getProgram(walletProvider) {
    window.Buffer = buffer.Buffer;

    const options = anchor.AnchorProvider.defaultOptions();
    const connection = new anchor.web3.Connection(anchor.web3.clusterApiUrl("devnet"), "confirmed");
    const anchorProvider = new anchor.AnchorProvider(connection, walletProvider, options);

    return new anchor.Program(
        await anchor.Program.fetchIdl(PROGRAM_ID, anchorProvider),
        new anchor.web3.PublicKey(PROGRAM_ID),
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
