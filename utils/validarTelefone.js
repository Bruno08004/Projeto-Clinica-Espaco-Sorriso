function validarTelefone(telefone) {
    const tel = telefone.replace(/\D/g, '');

    // tamanho inválido
    if (tel.length < 10 || tel.length > 11) return false;

    if (/^(\d)\1+$/.test(tel)) return false;

    return true;
}

export default validarTelefone;