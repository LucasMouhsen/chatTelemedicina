async function esperar(min, max) {
    min = min * 1000; // 30 segundos
    max = max * 1000; // 45 segundos
    const sleep = Math.random() * (max - min) + min;
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, sleep);
    });
}

module.exports = {esperar}