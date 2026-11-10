// Catálogos iniciales por defecto
let catalogos = JSON.parse(localStorage.getItem('bitacora_catalogos')) || {
    tipo: ['VOCEO', 'LLAMADA'],
    subtipo: ['FAMILIAR', 'EXTERNA', 'RESIDENTE']
};

// Directorio telefónico inicial por defecto
let directorio = JSON.parse(localStorage.getItem('bitacora_directorio')) || [
    { area: 'INFORMES', ext: '7245' },
    { area: 'URGENCIAS', ext: '7112' },
    { area: 'CONMUTADOR', ext: '0' }
];

// Registros guardados de la bitácora
let registros = JSON.parse(localStorage.getItem('bitacora_registros')) || [];

// Al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    renderCatalogs();
    renderDropdowns();
    renderTable();
    
    // Inicializar Directorio Telefónico
    renderDirectory();
    renderAdminDirectory();
    
    // NUEVO: Inicializar las sugerencias de autocompletado
    renderAutocompletes();
    
    // Forzar que inicie cerrado al cargar la página por primera vez
    document.getElementById('dir-results-details').removeAttribute('open');

    // Listener del Formulario de Captura
    document.getElementById('capture-form').addEventListener('submit', (e) => {
        e.preventDefault();
        captureData();
    });

    // Listeners para los Filtros de la Tabla
    document.getElementById('filter-search').addEventListener('input', renderTable);
    document.getElementById('filter-date').addEventListener('input', renderTable);
    document.getElementById('filter-tipo').addEventListener('change', renderTable);

    // Listener para el Buscador del Directorio Telefónico
    document.getElementById('dir-search').addEventListener('input', renderDirectory);
});


// =========================================================================
// LÓGICA DEL DIRECTORIO TELEFÓNICO
// =========================================================================

// Renderiza los resultados de búsqueda del directorio en tiempo real
function renderDirectory() {
    const list = document.getElementById('dir-results-list');
    list.innerHTML = '';
    
    const searchVal = document.getElementById('dir-search').value.toLowerCase().trim();

    // Filtrar el directorio según lo escrito
    const extensionesFiltradas = directorio.filter(item => {
        return item.area.toLowerCase().includes(searchVal) || item.ext.includes(searchVal);
    });

    extensionesFiltradas.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="area">${item.area}</span>
            <span class="ext">${item.ext}</span>
        `;
        list.appendChild(li);
    });
}

// Renderiza la lista interna dentro de "Gestionar Directorio" para poder borrarlas
function renderAdminDirectory() {
    const ul = document.getElementById('admin-dir-list');
    ul.innerHTML = '';
    
    directorio.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${item.area}</strong> - Ext: ${item.ext}</span>
            <button class="btn-delete" onclick="deleteExtension(${index})">❌</button>
        `;
        ul.appendChild(li);
    });
}

// Agregar una nueva extensión al directorio
function addExtension() {
    const areaInput = document.getElementById('new-dir-area');
    const extInput = document.getElementById('new-dir-ext');
    
    const areaVal = areaInput.value.trim().toUpperCase();
    const extVal = extInput.value.trim();

    if (areaVal && extVal) {
        // Evitar duplicados exactos
        const existe = directorio.some(item => item.area === areaVal && item.ext === extVal);
        
        if (!existe) {
            directorio.push({ area: areaVal, ext: extVal });
            localStorage.setItem('bitacora_directorio', JSON.stringify(directorio));
            
            // Limpiar inputs
            areaInput.value = '';
            extInput.value = '';
            
            // Actualizar vistas
            renderDirectory();
            renderAdminDirectory();
        } else {
            alert('Esta extensión para esa área ya se encuentra registrada.');
        }
    } else {
        alert('Por favor, completa ambos campos (Área y Extensión).');
    }
}

// Eliminar una extensión del directorio
function deleteExtension(index) {
    if (confirm('¿Seguro que deseas eliminar esta extensión del directorio?')) {
        directorio.splice(index, 1);
        localStorage.setItem('bitacora_directorio', JSON.stringify(directorio));
        renderDirectory();
        renderAdminDirectory();
    }
}


// =========================================================================
// LÓGICA DE CAPTURA Y CONFIGURACIÓN GENERAL (MANTENIDA)
// =========================================================================

function renderCatalogs() {
    ['tipo', 'subtipo'].forEach(cat => {
        const ul = document.getElementById(`list-${cat}`);
        ul.innerHTML = '';
        catalogos[cat].forEach((option, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${option}</span>
                <button class="btn-delete" onclick="deleteOption('${cat}', ${index})">❌</button>
            `;
            ul.appendChild(li);
        });
    });
}

function renderDropdowns() {
    ['tipo', 'subtipo'].forEach(cat => {
        const select = document.getElementById(`form-${cat}`);
        select.innerHTML = '';
        catalogos[cat].forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            select.appendChild(opt);
        });
    });

    const filterTipo = document.getElementById('filter-tipo');
    filterTipo.innerHTML = '<option value="">TODOS</option>';
    catalogos.tipo.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        filterTipo.appendChild(opt);
    });
}

function addOption(cat) {
    const input = document.getElementById(`new-${cat}`);
    const val = input.value.trim().toUpperCase();
    
    if (val && !catalogos[cat].includes(val)) {
        catalogos[cat].push(val);
        localStorage.setItem('bitacora_catalogos', JSON.stringify(catalogos));
        input.value = '';
        renderCatalogs();
        renderDropdowns();
    } else {
        alert('Elemento vacío o ya existente.');
    }
}

function deleteOption(cat, index) {
    if (confirm(`¿Seguro que deseas eliminar esta opción de la lista de ${cat.toUpperCase()}?`)) {
        catalogos[cat].splice(index, 1);
        localStorage.setItem('bitacora_catalogos', JSON.stringify(catalogos));
        renderCatalogs();
        renderDropdowns();
    }
}

function captureData() {
    const now = new Date();
    const pad = (num) => String(num).padStart(2, '0');
    
    const fechaFormateada = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const nuevoRegistro = {
        tipo: document.getElementById('form-tipo').value,
        subtipo: document.getElementById('form-subtipo').value,
        asunto: document.getElementById('form-asunto').value.toUpperCase(),
        donde: document.getElementById('form-donde').value.toUpperCase(),
        fecha: fechaFormateada
    };

    registros.push(nuevoRegistro);
    localStorage.setItem('bitacora_registros', JSON.stringify(registros));
    
    document.getElementById('form-asunto').value = '';
    document.getElementById('form-donde').value = '';
    
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    const searchVal = document.getElementById('filter-search').value.toLowerCase().trim();
    const dateVal = document.getElementById('filter-date').value.trim();
    const tipoVal = document.getElementById('filter-tipo').value;

    const registrosFiltrados = registros.filter(reg => {
        const cumplePalabra = reg.asunto.toLowerCase().includes(searchVal) || reg.donde.toLowerCase().includes(searchVal);
        const cumpleFecha = reg.fecha.includes(dateVal);
        const cumpleTipo = tipoVal === "" || reg.tipo === tipoVal;
        return cumplePalabra && cumpleFecha && cumpleTipo;
    });

    registrosFiltrados.forEach((reg) => {
        const originalIndex = registros.indexOf(reg); 

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${reg.tipo}</td>
            <td>${reg.subtipo}</td>
            <td>${reg.asunto}</td>
            <td>${reg.donde}</td>
            <td>${reg.fecha}</td>
            <td>
                <button class="btn-delete" onclick="deleteRecord(${originalIndex})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteRecord(index) {
    if (confirm('¿Eliminar este registro de la bitácora?')) {
        registros.splice(index, 1);
        localStorage.setItem('bitacora_registros', JSON.stringify(registros));
        renderTable();
    }
}
// =========================================================================
// EXPORTACIÓN A EXCEL EN COLUMNAS REALES (FORMATO HTML-XLS)
// =========================================================================
function exportToExcel() {
    // 1. Obtener los filtros actuales para saber qué exportar
    const searchVal = document.getElementById('filter-search').value.toLowerCase().trim();
    const dateVal = document.getElementById('filter-date').value.trim();
    const tipoVal = document.getElementById('filter-tipo').value;

    // 2. Filtrar el arreglo exactamente igual que en la pantalla
    const registrosAExportar = registros.filter(reg => {
        const cumplePalabra = reg.asunto.toLowerCase().includes(searchVal) || reg.donde.toLowerCase().includes(searchVal);
        const cumpleFecha = reg.fecha.includes(dateVal);
        const cumpleTipo = tipoVal === "" || reg.tipo === tipoVal;
        return cumplePalabra && cumpleFecha && cumpleTipo;
    });

    if (registrosAExportar.length === 0) {
        alert("No hay registros en la tabla para exportar con los filtros actuales.");
        return;
    }

    // 3. Construir una estructura de tabla HTML con estilos que Excel entiende perfectamente nativo
    let excelTemplate = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://w3.org">
        <head>
            <meta charset="utf-8">
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>Bitácora</x:Name>
                            <x:WorksheetOptions>
                                <x:DisplayGridlines/>
                            </x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <style>
                th { background-color: #cccccc; font-weight: bold; border: 0.5pt solid #999999; }
                td { border: 0.5pt solid #999999; mso-number-format:"\\@"; } /* mso-number-format fuerza formato texto para no romper fechas */
            </style>
        </head>
        <body>
            <table>
                <thead>
                    <tr>
                        <th>TIPO</th>
                        <th>SUBTIPO</th>
                        <th>ASUNTO</th>
                        <th>A DONDE</th>
                        <th>FECHA DE CAPTURA</th>
                    </tr>
                </thead>
                <tbody>
    `;

    // 4. Inyectar las filas correspondientes
    registrosAExportar.forEach(reg => {
        excelTemplate += `
            <tr>
                <td>${reg.tipo}</td>
                <td>${reg.subtipo}</td>
                <td>${reg.asunto}</td>
                <td>${reg.donde}</td>
                <td>${reg.fecha}</td>
            </tr>
        `;
    });

    excelTemplate += `
                </tbody>
            </table>
        </body>
        </html>
    `;

    // 5. Crear el archivo binario simulando una hoja XLS real
    const blob = new Blob([excelTemplate], { type: "application/vnd.ms-excel;charset=utf-8;" });
    
    // 6. Ejecutar la descarga en Google Chrome
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        
        const fechaArchivo = new Date().toISOString().slice(0, 10);
        link.setAttribute("download", `Bitacora_Captura_${fechaArchivo}.xls`); // Forzamos extensión .xls
        
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
// =========================================================================
// FUNCIÓN DE AUTOCOMPLETADO (SUGERENCIAS DINÁMICAS)
// =========================================================================
function renderAutocompletes() {
    const dlAsunto = document.getElementById('asuntos-sugeridos');
    const dlDonde = document.getElementById('donde-sugeridos');
    
    // Limpiar las listas actuales
    dlAsunto.innerHTML = '';
    dlDonde.innerHTML = '';

    // Usamos Set para almacenar solo elementos únicos (evita duplicados)
    const asuntosUnicos = new Set();
    const dondeUnicos = new Set();

    // Recorrer los registros e ir guardando los textos existentes
    registros.forEach(reg => {
        if (reg.asunto && reg.asunto !== "-") asuntosUnicos.add(reg.asunto);
        if (reg.donde) dondeUnicos.add(reg.donde);
    });

    // Inyectar las opciones únicas en el datalist de ASUNTO
    asuntosUnicos.forEach(asunto => {
        const option = document.createElement('option');
        option.value = asunto;
        dlAsunto.appendChild(option);
    });

    // Inyectar las opciones únicas en el datalist de A DONDE
    dondeUnicos.forEach(donde => {
        const option = document.createElement('option');
        option.value = donde;
        dlDonde.appendChild(option);
    });
}

// MODIFICACIÓN DE CAPTURA Y BORRADO:
// Para que las sugerencias se actualicen al instante, debemos interceptar 
// cuando se guarda o se borra un dato. Reemplaza tus funciones existentes por estas:

const originalCaptureData = captureData;
captureData = function() {
    originalCaptureData();
    renderAutocompletes(); // Actualiza la lista al capturar
};

const originalDeleteRecord = deleteRecord;
deleteRecord = function(index) {
    originalDeleteRecord(index);
    renderAutocompletes(); // Actualiza la lista al eliminar
};
