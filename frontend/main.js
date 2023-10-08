import * as anchor from "@coral-xyz/anchor";
import buffer from "buffer";

const PROGRAM_ID = "vGsRgLSQh24Jb2BjJkR6TFQGcmq2q9JBwv81qQZoQ4h";

async function main() {
    const walletProvider = getProvider();
    const anchorProgram = await getProgram(walletProvider);
    const container = document.getElementById("board-container");

    await walletProvider.connect({ onlyIfTrusted: true })
        .then(async () => await fetchBoards(anchorProgram))
        .catch(() => container.style.display = "none");

    await createEvents(walletProvider, anchorProgram);
}

async function createEvents(walletProvider, anchorProgram) {
    const toggleConnectButton = document.getElementById("connect-wallet");
    const buttonText = walletProvider.isConnected ? "Disconnect" : "Connect";
    const container = document.getElementById("board-container");

    toggleConnectButton.innerText = `${buttonText} Wallet`;
    toggleConnectButton.addEventListener("click", async () => {
        if (walletProvider.isConnected) {
            await walletProvider.disconnect();
            toggleConnectButton.innerText = "Connect Wallet";
            container.style.display = "none";

            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }

            return;
        }

        await walletProvider.connect();
        await fetchBoards(anchorProgram);
        container.style.display = "flex";
        toggleConnectButton.innerText = "Disconnect Wallet";
    });
}

async function fetchBoards(anchorProgram) {
    const container = document.getElementById("board-container");
    const boards = await anchorProgram.account.board.all();

    for (let i = 0; i < boards.length; i++) {
        const board = boards[Math.floor(i)];
        const infoDiv = document.createElement("div");
        const boardDiv = document.createElement("div");
        const boardWrapper = document.createElement("div");
        
        infoDiv.classList.add("info");
        boardDiv.classList.add("board");
        boardWrapper.classList.add("board-wrapper");

        infoDiv.innerText = `${board.account.players[1].human.pubkey}`;

        for (let j = 0; j < board.account.tiles.length; j++) {
            const tile = Object.keys(board.account.tiles[j])[0];
            const cellDiv = document.createElement("div");

            switch (tile) {
                case "x":
                    cellDiv.innerText = "X";
                    cellDiv.style.color = "var(--color-red)";
                    break;
                case "o":
                    cellDiv.innerText = "O";
                    cellDiv.style.color = "var(--color-blue)";
                    break;
                default:
                    cellDiv.innerText = (j + 1).toString();
                    break;
            }

            cellDiv.classList.add("cell");
            boardDiv.appendChild(cellDiv);
        }

        boardWrapper.appendChild(boardDiv);
        boardWrapper.appendChild(infoDiv);
        container.appendChild(boardWrapper);
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
