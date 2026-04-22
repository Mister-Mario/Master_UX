class Search {

    constructor() {
        // Atributos del DOM
        this.formBusqueda = document.querySelector('form[role="search"]');
        this.inputBusqueda = document.getElementById("search-input");

        // Atributos de estado y datos
        this.rutaJson = "js/search/keywords.json";
        this.datosBusqueda = [];
        this.resultadosActuales = [];
        this.minCaracteres = 2;

        // Inicializar
        if (this.formBusqueda && this.inputBusqueda) {
            this.init();
        } else {
            console.error("Fallo construccion search");
        }
    }


    async init() {
        await this.cargarDatos();
        this.configurarEventos();
    }

    /**
     * Cargamos el fichero de keywords
     */
    async cargarDatos() {
        try {
            const respuesta = await fetch(this.rutaJson);
            if (!respuesta.ok) console.error(`No se pudo cargar el fichero ${this.rutaJson}`)
            this.datosBusqueda = await respuesta.json();
        } catch (error) {
            console.error(`Error al cargar el fichero ${this.rutaJson}, error: `, error)
        }
    }


    configurarEventos() {
        // Si se envia el formulario seleccionamos el primer resultado
        this.formBusqueda.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.resultadosActuales.length > 0) {
                const urlDestino = this.resultadosActuales[0].url;
                this.resetearBuscador();
                window.location.href = urlDestino;
            }
        });

        // Filtramos con cada tecla pulsada
        this.inputBusqueda.addEventListener('input', (e) => this.procesarEntrada(e));

        // Cerrar resultados al hacer clic fuera del buscador
        document.addEventListener('click', (e) => {
            if (!this.formBusqueda.contains(e.target)) {
                this.limpiarResultados();
            }
        });
    }

    /**
     * Lógica que se ejecuta al escribir en el input.
     * @param {Event} evento - El evento de input.
     */
    procesarEntrada(event) {
        const termino = event.target.value.toLowerCase().trim();
        this.limpiarResultados();

        if (termino.length < this.minCaracteres) return;

        this.resultadosActuales = this.filtrarPorKeywords(termino).slice(0, 3);
        this.renderizar(this.resultadosActuales);
    }

    /**
     * Filtra los datos almacenados EXCLUSIVAMENTE por sus keywords.
     * @param {string} termino - La palabra a buscar.
     * @returns {Array} Array con los objetos que coinciden.
     */
    filtrarPorKeywords(termino) {
        return this.datosBusqueda.filter(item => {
            return item.keywords.some(keyword => keyword.toLowerCase().includes(termino));
        });
    }

    /**
     * Dibuja los elementos en el DOM basándose en los resultados filtrados.
     * @param {Array} resultados - Array de datos filtrados.
     */
    renderizar(resultados) {
        let aside = this.formBusqueda.querySelector('aside');
        let contenedorResultados;

        if (!aside) {
            aside = document.createElement('aside');
            contenedorResultados = document.createElement('ul');
            contenedorResultados.setAttribute('aria-live', 'polite');
            aside.appendChild(contenedorResultados);
            this.formBusqueda.appendChild(aside);
        } else {
            contenedorResultados = aside.querySelector('ul');
        }
        contenedorResultados.innerHTML = '';

        if (resultados.length === 0) {
            contenedorResultados.innerHTML = `<li>${window.i18n.getTranslationFor("search.default")}</li>`;
            return;
        }

        resultados.forEach(res => {
            const li = document.createElement('li');
            const enlace = document.createElement('a');

            enlace.href = res.url;

            enlace.innerHTML = `
                <p>${window.i18n.getTranslationFor(res.titulo)}</p> 
                <p>${window.i18n.getTranslationFor(res.categoria)}</p>
            `;

            // Al hacer clic, limpiamos todo
            enlace.addEventListener('click', () => this.resetearBuscador());

            li.appendChild(enlace);
            contenedorResultados.appendChild(li);
        });

    }

    /**
     * Limpia solo la lista de resultados del DOM.
     */
    limpiarResultados() {
        let contenedorResultados = document.querySelector("aside")
        if (contenedorResultados)
            contenedorResultados.remove()
        this.resultadosActuales = [];
    }

    /**
     * Limpia la lista de resultados y vacía el input.
     */
    resetearBuscador() {
        this.limpiarResultados();
        this.inputBusqueda.value = '';
    }
}


new Search()