import * as web3 from "@solana/web3.js";
import bs58 from "bs58";

let connection;
let keypair;

function main() {
    setStateOfConnection(false);
    createConnectionEventHandler(
        document.getElementById("connect"),
        document.getElementById("disconnect"),
    );
}

function createConnectionEventHandler(formConnect, buttonDisconnect) {
    const errorElement = formConnect.querySelector(".error");
    const publicKeyElement = document.getElementById("public-key");

    formConnect.addEventListener("submit", async (event) => {
        event.preventDefault();              

        const data = Object.fromEntries(new FormData(formConnect));

        try {
            connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
            keypair = web3.Keypair.fromSecretKey(bs58.decode(data["private-key"]));

            publicKeyElement.innerText = keypair.publicKey.toString();
            errorElement.innerText = "";

            formConnect.reset();
            setStateOfConnection(true);
        } catch (error) {
            errorElement.innerText = `Invalid key! ${error.toString()}`;
            buttonDisconnect.click();
        }
    });

    buttonDisconnect.addEventListener("click", () => {
        publicKeyElement.innerText = "";
        connection = null;
        keypair = null;

        setStateOfConnection(false);
    });
}

function setStateOfConnection(isConnected) {
    document.querySelectorAll(".is-connected").forEach(element => {
        element.style.display = isConnected ? "inline-block" : "none";
    });

    document.querySelectorAll(".is-not-connected").forEach(element => {
        element.style.display = isConnected ? "none" : "inline-block";
    });
}

main();
