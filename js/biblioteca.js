// Biblioteca de alimentos - Mi Nutrición V2

let biblioteca = JSON.parse(localStorage.getItem("biblioteca")) || [];

function guardarBiblioteca() {
    localStorage.setItem("biblioteca", JSON.stringify(biblioteca));
}

function obtenerBiblioteca() {
    return biblioteca;
}

function agregarAlimento(alimento) {
    const existe = biblioteca.find(
        item => item.nombre.toLowerCase() === alimento.nombre.toLowerCase()
    );

    if (existe) {
        return false;
    }

    biblioteca.push(alimento);
    guardarBiblioteca();
    return true;
}

function vaciarBiblioteca() {
    biblioteca = [];
    guardarBiblioteca();
}