function setupCounter(element) {
    let counter = 0;

    element.innerHTML = `count is 0`;
    element.addEventListener("click", () => {
        counter += 1;
        element.innerHTML = `count is ${counter}`;
    });
}

function main() {
    setupCounter(document.querySelector("#counter"))
}

main();
