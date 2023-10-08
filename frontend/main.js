import * as anchor from "@coral-xyz/anchor";
import buffer from "buffer";

const PROGRAM_ID = "vGsRgLSQh24Jb2BjJkR6TFQGcmq2q9JBwv81qQZoQ4h";

async function main() {
    const walletProvider = getProvider();
    const anchorProgram = await getProgram(walletProvider);

    await createEvents(walletProvider, anchorProgram);
    await walletProvider.connect({ onlyIfTrusted: true })
        .catch(() => syncDisplayOnConnection(false));
}

async function createEvents(walletProvider, anchorProgram) {
    const toggleConnectButton = document.getElementById("connect-wallet");
    const createBoardButton = document.getElementById("create-your-board");
    const container = document.getElementById("board-container");
    const balanceElement = document.getElementById("sol-balance");
    const errorElement = document.getElementById("error");

    walletProvider.on("connect", async () => {
        const balance = await anchorProgram
            .provider
            .connection
            .getBalance(walletProvider.publicKey);

        balanceElement.innerText = `${balance / anchor.web3.LAMPORTS_PER_SOL} SOL`;
        toggleConnectButton.innerText = "Disconnect Wallet";
        errorElement.innerText = "";

        syncDisplayOnConnection(true);
        await fetchBoards(walletProvider, anchorProgram, container);
    });

    walletProvider.on("disconnect", () => {
        syncDisplayOnConnection(false);
        toggleConnectButton.innerText = "Connect Wallet";
        errorElement.innerText = "";
    });

    toggleConnectButton.addEventListener("click", async () => {
        walletProvider.isConnected
            ? await walletProvider.disconnect()
            : await walletProvider.connect();
    });

    createBoardButton.addEventListener("click", async () => {
        if (!walletProvider.isConnected) {
            return;
        }

        const boardSeeds = [
            anchor.utils.bytes.utf8.encode("tictactoe-board"),
            walletProvider.publicKey.toBuffer(),
        ];

        const [boardPDA, boardBump] = anchor
            .web3
            .PublicKey
            .findProgramAddressSync(boardSeeds, anchorProgram.programId);

        const boardAccounts = {
            board: boardPDA,
            owner: walletProvider.publicKey,
        };

        const providerAccount = await anchorProgram.account.board.fetch(boardPDA);

        if (providerAccount) {
            errorElement.innerText = "Tictactoe Board may already be initialized.";
            return;
        }

        await anchorProgram.methods.createBoard(boardBump).accounts(boardAccounts).rpc();
        await fetchBoards(walletProvider, anchorProgram, container);
    });
}

async function fetchBoards(walletProvider, anchorProgram, container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    const boards = await anchorProgram.account.board.all();
    let providerBoardIndex = 0;

    for (let i = 0; i < boards.length; i++) {
        const board = boards[i];
        const infoDiv = document.createElement("div");
        const boardDiv = document.createElement("div");
        const boardWrapper = document.createElement("div");

        infoDiv.classList.add("info");
        boardDiv.classList.add("board");
        boardWrapper.classList.add("board-wrapper");

        const pubkey = board.account.players[1].human.pubkey.toString();
        infoDiv.innerText = pubkey;
        boardWrapper.dataset.pubkey = pubkey;

        if (pubkey.toString() == walletProvider.publicKey.toString()) {
            providerBoardIndex = i;
        }

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

        boardWrapper.dataset.index = i;
        boardWrapper.appendChild(boardDiv);
        boardWrapper.appendChild(infoDiv);
        container.appendChild(boardWrapper);
    }

    if (providerBoardIndex > 0) {
        const elementA = container.firstChild;
        const elementB = container.childNodes.item(providerBoardIndex);

        elementB.parentNode.insertBefore(elementB, elementA);
    }

    if (container.firstChild.dataset.pubkey == walletProvider.publicKey.toString()) {
        container.firstChild.style.border = "1px solid var(--color-blue)";
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

function syncDisplayOnConnection(boolean) {
    Array.from(document.getElementsByClassName("connected")).forEach(element => {
        element.style.display = boolean ? element.dataset.display : "none";
    });
}

function getProvider() {
    if (window?.phantom?.solana?.isPhantom) {
        return window.phantom.solana;
    }

    window.open("https://phantom.app/", "_blank");
}

main();
