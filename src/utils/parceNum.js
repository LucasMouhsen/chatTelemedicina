module.exports = parceNum = (numero) => {
    if (numero) {
        const numeros = numero.replace(/\D/g, '').slice(-10);
        const parceNum = "549" + numeros;
        return parceNum;
    }
}
