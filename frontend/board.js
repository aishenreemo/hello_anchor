import utils from "./utils";

async function createBoard(anchorProgram) {
    utils.showLoader();
    const walletProvider = utils.getProvider();
    const errorElement = document.getElementById("error");

    const [boardPDA, boardBump] = utils.getProgramAddress(
        walletProvider.publicKey,
        anchorProgram.programId,
    );

    const boardAccounts = {
        board: boardPDA,
        owner: walletProvider.publicKey,
    };

    const providerAccount = await anchorProgram.account.board.fetch(boardPDA);
    if (providerAccount) {
        errorElement.innerText = "Tictactoe Board may already be initialized.";
        utils.hideLoader();
        return;
    }

    await anchorProgram.methods.createBoard(boardBump).accounts(boardAccounts).rpc().catch(() => {});
    await updateBoard(anchorProgram, boardPDA);
    utils.hideLoader();
}

async function restartBoard(anchorProgram) {
    utils.showLoader();
    const walletProvider = utils.getProvider();
    const [boardPDA, _] = utils.getProgramAddress(
        walletProvider.publicKey,
        anchorProgram.programId,
    );

    const boardAccounts = {
        board: boardPDA,
        owner: walletProvider.publicKey,
    };

    await anchorProgram.methods.startBoard().accounts(boardAccounts).rpc().catch(() => {});
    await updateBoard(anchorProgram, boardPDA);
    utils.hideLoader();
}

async function makeMoveBoard(anchorProgram, ownerPublicKey, index) {
    utils.showLoader();
    const walletProvider = utils.getProvider();
    const [boardPDA, _] = utils.getProgramAddress(
        ownerPublicKey,
        anchorProgram.programId,
    );

    const boardAccounts = {
        board: boardPDA,
        owner: ownerPublicKey,
    };

    await anchorProgram
        .methods
        .makeMove(walletProvider.publicKey, index, {"x": {}})
        .accounts(boardAccounts)
        .rpc()
        .catch(() => {});

    await updateBoard(anchorProgram, boardPDA);
    utils.hideLoader();
}

async function fetchBoards(anchorProgram) {
    const container = document.getElementById("board-container");

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    const boards = await anchorProgram.account.board.all();
    let ownerDiv = null;

    for (let i = 0; i < boards.length; i++) {
        const data = boards[i].account;
        const infoDiv = createInfoDiv(anchorProgram, data);
        const boardDiv = createBoardDiv(anchorProgram, data);
        const boardWrapper = document.createElement("div");

        boardWrapper.classList.add("board-wrapper");
        boardWrapper.appendChild(boardDiv);
        boardWrapper.appendChild(infoDiv);
        boardWrapper.dataset.pubkey = data.players[1].human.pubkey.toString();

        container.appendChild(boardWrapper);

        if (infoDiv.dataset.owner) {
            ownerDiv = boardWrapper;
        }
    }

    if (ownerDiv) {
        ownerDiv.parentNode.insertBefore(ownerDiv, container.firstChild);
        ownerDiv.style.border = "1px solid var(--color-blue)";
    }
}

async function updateBoard(anchorProgram, boardPDA) {
    const container = document.getElementById("board-container");
    const data = await anchorProgram.account.board.fetch(boardPDA);
    const publicKey = data.players[1].human.pubkey.toString();

    for (let i = 0; i < container.children.length; i++) {
        const boardWrapper = container.children[i];

        if (boardWrapper.dataset.pubkey != publicKey) {
            continue;
        }

        while (boardWrapper.firstChild) {
            boardWrapper.removeChild(boardWrapper.firstChild);
        }

        const infoDiv = createInfoDiv(anchorProgram, data);
        const boardDiv = createBoardDiv(anchorProgram, data);

        boardWrapper.appendChild(boardDiv);
        boardWrapper.appendChild(infoDiv);

        container.appendChild(boardWrapper);
    }
}

function createBoardDiv(anchorProgram, data) {
    const boardDiv = document.createElement("div");
    const status = Object.keys(data.state)[0];
    boardDiv.classList.add("board");

    for (let i = 0; i < data.tiles.length; i++) {
        const tile = Object.keys(data.tiles[i])[0];
        const isCellClickable = status != "completed" && tile == "n";
        const elementType = isCellClickable ? "button" : "div";
        const cellElement = document.createElement(elementType);

        utils.setDivTile(cellElement, tile, i + 1);

        cellElement.classList.add("cell");
        boardDiv.appendChild(cellElement);

        if (!isCellClickable) {
            continue;
        }

        const pubkey = data.players[1].human.pubkey;
        cellElement.addEventListener("click", () => makeMoveBoard(anchorProgram, pubkey, i));
    }

    return boardDiv;
}

function createInfoDiv(anchorProgram, data) {
    const walletProvider = utils.getProvider();
    const infoDiv = document.createElement("div");
    const pubkeyDiv = document.createElement("div");
    const statusDiv = document.createElement("div");
    const restartButton = document.createElement("button");

    infoDiv.classList.add("info");
    pubkeyDiv.classList.add("pubkey");
    statusDiv.classList.add("status");
    restartButton.classList.add("restart");

    const pubkey = data.players[1].human.pubkey.toString();
    const status = Object.keys(data.state)[0];

    statusDiv.innerText = `Status: ${status}`;
    pubkeyDiv.innerText = pubkey;

    infoDiv.appendChild(pubkeyDiv);
    infoDiv.appendChild(statusDiv);

    if (pubkey == walletProvider.publicKey) {
        infoDiv.dataset.owner = true;

        if (data.turn > 1 || status == "completed") {
            restartButton.innerText = "Restart Game";
            infoDiv.appendChild(restartButton);
            restartButton.addEventListener("click", () => restartBoard(anchorProgram));
        }
    }

    return infoDiv;
}

export default {
    createBoard,
    fetchBoards,
    restartBoard,
}
