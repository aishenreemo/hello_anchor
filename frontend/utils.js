import * as anchor from "@coral-xyz/anchor";

function setDivTile(cellElement, tile, index) {
    switch (tile) {
        case "x":
            cellElement.innerText = "X";
            cellElement.style.color = "var(--color-red)";
            break;
        case "o":
            cellElement.innerText = "O";
            cellElement.style.color = "var(--color-blue)";
            break;
        default:
            cellElement.innerText = index.toString();
            break;
    }
}

function syncDisplayOnConnection() {
    const walletProvider = getProvider();
    Array.from(document.getElementsByClassName("connected")).forEach(element => {
        element.style.display = walletProvider.isConnected ? element.dataset.display : "none";
    });
}

function getProvider() {
    if (window?.phantom?.solana?.isPhantom) {
        return window.phantom.solana;
    }

    window.open("https://phantom.app/", "_blank");
}

function getProgramAddress(publicKey, programId) {
    const boardSeeds = [
        anchor.utils.bytes.utf8.encode("tictactoe-board"),
        publicKey.toBuffer(),
    ];

    return anchor.web3.PublicKey.findProgramAddressSync(boardSeeds, programId);
}

function showLoader() {
    const loaderElement = document.getElementById("loader");
    loaderElement.style.display = "inline-block";
    loaderElement.dataset.active = "yes";
}

function hideLoader() {
    const loaderElement = document.getElementById("loader");
    loaderElement.style.display = "none";
    loaderElement.dataset.active = "no";
}

function isLoaderActive() {
    const loaderElement = document.getElementById("loader");
    return loaderElement.dataset.active == "yes";
}

function cooldown(func, msg = "Slow down!", timeout=1000) {
    let isOnCooldown = false;

    return async function(...args) {
        if (isOnCooldown) {
            setErrorMessage(msg);
            return;
        }

        showLoader();
        isOnCooldown = true;
        await func.apply(this, args); 
        hideLoader();

        setTimeout(() => {
            isOnCooldown = false
            setErrorMessage("");
        }, timeout);
    };
}

function setErrorMessage(msg) {
    const errorElement = document.getElementById("error");
    errorElement.innerText = msg;
}

export default {
    setDivTile,
    syncDisplayOnConnection,
    getProvider,
    getProgramAddress,
    showLoader,
    hideLoader,
    isLoaderActive,
    cooldown,
    setErrorMessage,
}
