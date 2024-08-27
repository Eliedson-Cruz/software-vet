let registros = [];
let editIndex = -1;

// Função para salvar dados no localStorage
function salvarNoLocalStorage() {
    localStorage.setItem('registros', JSON.stringify(registros));
}

// Função para carregar dados do localStorage
function carregarDoLocalStorage() {
    const dados = localStorage.getItem('registros');
    if (dados) {
        registros = JSON.parse(dados);
    }
}

// Função para atualizar a tabela
function atualizarTabela() {
    const tabelaBody = document.querySelector('#tabela tbody');
    tabelaBody.innerHTML = '';

    registros.forEach((registro, index) => {
        const row = document.createElement('tr');
        row.dataset.index = index;
        row.innerHTML = `
            <td>${registro.nomeAnimal}</td>
            <td>${registro.codigo}</td>
            <td>${registro.nomeTutor}</td>
            <td>${registro.laboratorio}</td>
            <td>${registro.exame}</td>
            <td>${registro.data}</td>
            <td>
                <button class="edit" onclick="editarRegistro(${index})">Editar</button>
                <button class="delete" onclick="excluirRegistro(${index})">Excluir</button>
            </td>
        `;
        tabelaBody.appendChild(row);
    });

    salvarNoLocalStorage();
}

// Função para adicionar ou atualizar um exame
function adicionarExame(event) {
    event.preventDefault();

    const nomeAnimal = document.querySelector('#nomeAnimal').value;
    const codigo = document.querySelector('#codigo').value;
    const nomeTutor = document.querySelector('#nomeTutor').value;
    const laboratorio = document.querySelector('#laboratorio').value;
    const exame = document.querySelector('#exame').value;
    const data = document.querySelector('#data').value;

    if (editIndex >= 0) {
        registros[editIndex] = { nomeAnimal, codigo, nomeTutor, laboratorio, exame, data };
        editIndex = -1;
        document.querySelector('#btnEditar').style.display = 'none';
    } else {
        registros.push({ nomeAnimal, codigo, nomeTutor, laboratorio, exame, data });
    }

    document.querySelector('#formulario').reset();
    atualizarTabela();
}

// Função para editar um registro
function editarRegistro(index) {
    const registro = registros[index];

    document.querySelector('#nomeAnimal').value = registro.nomeAnimal;
    document.querySelector('#codigo').value = registro.codigo;
    document.querySelector('#nomeTutor').value = registro.nomeTutor;
    document.querySelector('#laboratorio').value = registro.laboratorio;
    document.querySelector('#exame').value = registro.exame;
    document.querySelector('#data').value = registro.data;

    editIndex = index;
    document.querySelector('#btnEditar').style.display = 'inline-block';
    
    // Rola a página para o formulário
    document.querySelector('#formulario').scrollIntoView({ behavior: 'smooth' });
}

// Função para excluir um registro
function excluirRegistro(index) {
    registros.splice(index, 1);
    atualizarTabela();
}

// Função para ordenar os registros
function ordenarRegistros() {
    const criterio = document.querySelector('#sortSelect').value;
    registros.sort((a, b) => {
        if (criterio === 'codigo') {
            return a.codigo.localeCompare(b.codigo);
        } else if (criterio === 'data') {
            return new Date(a.data) - new Date(b.data);
        }
    });
    atualizarTabela();
}

// Função para pesquisar registros
function pesquisarRegistros() {
    const termo = document.querySelector('#searchInput').value.toLowerCase();
    const filtrados = registros.filter(registro =>
        registro.codigo.toLowerCase().includes(termo) ||
        registro.nomeAnimal.toLowerCase().includes(termo) ||
        registro.nomeTutor.toLowerCase().includes(termo)
    );
    const tabelaBody = document.querySelector('#tabela tbody');
    tabelaBody.innerHTML = '';

    filtrados.forEach((registro, index) => {
        const row = document.createElement('tr');
        row.dataset.index = index;
        row.innerHTML = `
            <td>${registro.nomeAnimal}</td>
            <td>${registro.codigo}</td>
            <td>${registro.nomeTutor}</td>
            <td>${registro.laboratorio}</td>
            <td>${registro.exame}</td>
            <td>${registro.data}</td>
            <td>
                <button class="edit" onclick="editarRegistro(${index})">Editar</button>
                <button class="delete" onclick="excluirRegistro(${index})">Excluir</button>
            </td>
        `;
        tabelaBody.appendChild(row);
    });
}

// Função para gerar o relatório em PDF
async function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Obtendo intervalo de datas do usuário
    const startDate = document.querySelector('#startDate').value;
    const endDate = document.querySelector('#endDate').value;
    
    if (!startDate || !endDate) {
        alert('Por favor, selecione o intervalo de datas.');
        return;
    }

    // Filtrando os registros de acordo com o intervalo de datas
    const registrosFiltrados = registros.filter(registro => {
        const dataRegistro = new Date(registro.data);
        return dataRegistro >= new Date(startDate) && dataRegistro <= new Date(endDate);
    });

    // Define a fonte e o tamanho
    doc.setFontSize(12);

    // Adiciona o título centralizado
    doc.setFontSize(18);
    doc.setFont("Helvetica", "bold");
    const title = 'Relatório de Exames';
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(title, pageWidth / 2, 20, { align: 'center' });

    // Adiciona o intervalo de datas ao PDF
    doc.setFontSize(12);
    doc.setFont("Helvetica", "normal");
    doc.text(`Data de Início: ${startDate}`, 14, 30);
    doc.text(`Data de Término: ${endDate}`, 14, 40);
    doc.text('', 14, 50); // Espaço para separar os filtros dos dados

    // Adiciona os dados dos registros
    let startY = 60;
    registrosFiltrados.forEach(registro => {
        doc.setFontSize(12);
        doc.setFont("Helvetica", "normal");

        doc.text(`Nome do Animal: ${registro.nomeAnimal}`, 14, startY);
        doc.text(`Código: ${registro.codigo}`, 14, startY + 10);
        doc.text(`Nome do Tutor: ${registro.nomeTutor}`, 14, startY + 20);
        doc.text(`Laboratório: ${registro.laboratorio}`, 14, startY + 30);
        doc.text(`Exame: ${registro.exame}`, 14, startY + 40);
        doc.text(`Data: ${registro.data}`, 14, startY + 50);
        doc.text('----------------------------------------', 14, startY + 60);

        startY += 70; // Espaço entre registros

        if (startY > 250) { // Nova página se ultrapassar o limite
            doc.addPage();
            startY = 20; // Reinicia a posição Y
        }
    });

    // Salva o PDF
    doc.save('relatorio_exames.pdf');
}

// Função para gerar o relatório em texto
function gerarRelatorioTexto() {
    const startDate = document.querySelector('#startDate').value;
    const endDate = document.querySelector('#endDate').value;
    
    if (!startDate || !endDate) {
        alert('Por favor, selecione o intervalo de datas.');
        return;
    }

    // Filtrando os registros de acordo com o intervalo de datas
    const registrosFiltrados = registros.filter(registro => {
        const dataRegistro = new Date(registro.data);
        return dataRegistro >= new Date(startDate) && dataRegistro <= new Date(endDate);
    });

    let relatorioTexto = `Relatório de Exames\n\nData de Início: ${startDate}\nData de Término: ${endDate}\n\n`;

    registrosFiltrados.forEach(registro => {
        relatorioTexto += `Nome do Animal: ${registro.nomeAnimal}\n`;
        relatorioTexto += `Código: ${registro.codigo}\n`;
        relatorioTexto += `Nome do Tutor: ${registro.nomeTutor}\n`;
        relatorioTexto += `Laboratório: ${registro.laboratorio}\n`;
        relatorioTexto += `Exame: ${registro.exame}\n`;
        relatorioTexto += `Data: ${registro.data}\n`;
        relatorioTexto += '----------------------------------------\n\n';
    });

    // Copia o texto para o clipboard
    navigator.clipboard.writeText(relatorioTexto).then(() => {
        alert('Relatório copiado para a área de transferência.');
    });
}

// Função para inicializar a aplicação
function inicializar() {
    carregarDoLocalStorage();
    atualizarTabela();
}

// Inicializa a aplicação
inicializar();

// Configura os eventos
document.querySelector('#formulario').addEventListener('submit', adicionarExame);
document.querySelector('#searchInput').addEventListener('input', pesquisarRegistros);
document.querySelector('#sortSelect').addEventListener('change', ordenarRegistros);
document.querySelector('#btnGerarPDF').addEventListener('click', gerarPDF);
document.querySelector('#btnGerarRelatorio').addEventListener('click', gerarRelatorioTexto);
