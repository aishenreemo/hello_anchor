import * as anchor from "@coral-xyz/anchor";

async function main() {
    const walletProvider = getProvider();
    const anchorProgram = await getProgram(walletProvider);

    await walletProvider.connect({ onlyIfTrusted: true }).catch(() => {});
    await createEvents(walletProvider, anchorProgram);
}

async function createEvents(walletProvider, _anchorProgram) {
    const toggleConnectButton = document.getElementById("connect-wallet");
    const buttonText = walletProvider.isConnected ? "Disconnect" : "Connect"

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

async function getProgram(walletProvider) {
    const options = anchor.AnchorProvider.defaultOptions();
    const connection = new anchor.web3.Connection(anchor.web3.clusterApiUrl("devnet"), "confirmed");
    const anchorProvider = new anchor.AnchorProvider(connection, walletProvider, options);
    const programId = "HDYyTAVBJL1JMp3kUukxy784micPpWRMBjBZF9zJQ1cX";

    return new anchor.Program(
        await anchor.Program.fetchIdl(programId, anchorProvider),
        new anchor.web3.PublicKey(programId),
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
