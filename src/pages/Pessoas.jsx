import {
  useEffect,
  useMemo,
  useState
} from "react";

import { Link } from "react-router-dom";

function Pessoas() {

  // ==========================================
  // CONFIGURAÇÕES
  // ==========================================

  const ITENS_POR_PAGINA = 10;
  const ATENDIMENTOS_POR_PAGINA = 10;


  // ==========================================
  // PESSOAS
  // ==========================================

  const [pessoas, setPessoas] = useState(() => {
    const pessoasSalvas =
      localStorage.getItem("pessoas");

    return pessoasSalvas
      ? JSON.parse(pessoasSalvas)
      : [];
  });


  // ==========================================
  // ATENDIMENTOS
  // ==========================================

  const [atendimentos] = useState(() => {
    const atendimentosSalvos =
      localStorage.getItem("atendimentos");

    return atendimentosSalvos
      ? JSON.parse(atendimentosSalvos)
      : [];
  });


  // ==========================================
  // PRÓXIMO ID
  // ==========================================

  const [proximoId, setProximoId] = useState(() => {
    const idSalvo =
      localStorage.getItem(
        "proximoIdPessoa"
      );

    if (idSalvo) {
      return Number(idSalvo);
    }

    const pessoasSalvas =
      localStorage.getItem("pessoas");

    if (pessoasSalvas) {
      const lista =
        JSON.parse(pessoasSalvas);

      if (lista.length > 0) {
        const maiorId = Math.max(
          ...lista
            .map(
              (pessoa) =>
                Number(pessoa.id)
            )
            .filter(
              (id) =>
                !Number.isNaN(id)
            )
        );

        if (maiorId > 0) {
          return maiorId + 1;
        }
      }
    }

    return 1;
  });


  // ==========================================
  // FORMULÁRIO
  // ==========================================

  const [nome, setNome] =
    useState("");

  const [
    dataNascimento,
    setDataNascimento
  ] = useState("");

  const [telefone, setTelefone] =
    useState("");

  const [
    pessoaEditando,
    setPessoaEditando
  ] = useState(null);


  // ==========================================
  // BUSCA
  // ==========================================

  const [
    filtroBusca,
    setFiltroBusca
  ] = useState("nome");

  const [
    termoBusca,
    setTermoBusca
  ] = useState("");


  // ==========================================
  // PAGINAÇÃO DE PESSOAS
  // ==========================================

  const [
    paginaAtual,
    setPaginaAtual
  ] = useState(1);


  // ==========================================
  // MODAL DA PESSOA
  // ==========================================

  const [
    pessoaSelecionada,
    setPessoaSelecionada
  ] = useState(null);

  const [
    abaPessoaAtiva,
    setAbaPessoaAtiva
  ] = useState("cadastro");


  // ==========================================
  // PAGINAÇÃO DO HISTÓRICO
  // ==========================================

  const [
    paginaHistorico,
    setPaginaHistorico
  ] = useState(1);


  // ==========================================
  // MODAL DO ATENDIMENTO
  // ==========================================

  const [
    atendimentoVisualizando,
    setAtendimentoVisualizando
  ] = useState(null);


  // ==========================================
  // LOCAL STORAGE
  // ==========================================

  useEffect(() => {
    localStorage.setItem(
      "pessoas",
      JSON.stringify(pessoas)
    );
  }, [pessoas]);


  useEffect(() => {
    localStorage.setItem(
      "proximoIdPessoa",
      proximoId.toString()
    );
  }, [proximoId]);


  // ==========================================
  // FUNÇÕES AUXILIARES
  // ==========================================

  function formatarData(data) {
    if (!data) {
      return "Não informada";
    }

    const partes =
      data.split("-");

    if (partes.length !== 3) {
      return data;
    }

    const [ano, mes, dia] =
      partes;

    return `${dia}/${mes}/${ano}`;
  }


  function normalizarTexto(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .toLowerCase()
      .trim();
  }


  function somenteNumeros(texto) {
    return String(texto || "")
      .replace(/\D/g, "");
  }


  // ==========================================
  // FILTRAR PESSOAS
  // ==========================================

  const pessoasFiltradas =
    useMemo(() => {

      const termo =
        termoBusca.trim();

      if (!termo) {
        return pessoas;
      }

      return pessoas.filter(
        (pessoa) => {

          // NOME

          if (
            filtroBusca === "nome"
          ) {
            return normalizarTexto(
              pessoa.nome
            ).includes(
              normalizarTexto(
                termo
              )
            );
          }


          // ID

          if (
            filtroBusca === "id"
          ) {
            return String(
              pessoa.id
            ) === termo;
          }


          // DATA DE NASCIMENTO

          if (
            filtroBusca ===
            "dataNascimento"
          ) {
            const dataOriginal =
              String(
                pessoa.dataNascimento ||
                ""
              );

            const dataFormatada =
              formatarData(
                pessoa.dataNascimento
              );

            return (
              normalizarTexto(
                dataOriginal
              ).includes(
                normalizarTexto(
                  termo
                )
              ) ||

              normalizarTexto(
                dataFormatada
              ).includes(
                normalizarTexto(
                  termo
                )
              )
            );
          }


          // TELEFONE

          if (
            filtroBusca === "telefone"
          ) {
            return somenteNumeros(
              pessoa.telefone
            ).includes(
              somenteNumeros(
                termo
              )
            );
          }

          return true;
        }
      );

    }, [
      pessoas,
      filtroBusca,
      termoBusca
    ]);


  // ==========================================
  // PAGINAÇÃO DA LISTA
  // ==========================================

  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        pessoasFiltradas.length /
        ITENS_POR_PAGINA
      )
    );


  useEffect(() => {
    if (
      paginaAtual > totalPaginas
    ) {
      setPaginaAtual(
        totalPaginas
      );
    }
  }, [
    paginaAtual,
    totalPaginas
  ]);


  const indiceInicial =
    (
      paginaAtual - 1
    ) * ITENS_POR_PAGINA;


  const indiceFinal =
    indiceInicial +
    ITENS_POR_PAGINA;


  const pessoasDaPagina =
    pessoasFiltradas.slice(
      indiceInicial,
      indiceFinal
    );


  const primeiroItem =
    pessoasFiltradas.length === 0
      ? 0
      : indiceInicial + 1;


  const ultimoItem =
    Math.min(
      indiceFinal,
      pessoasFiltradas.length
    );


  // ==========================================
  // HISTÓRICO DA PESSOA SELECIONADA
  // ==========================================

  const historicoPessoaSelecionada =
    useMemo(() => {

      if (!pessoaSelecionada) {
        return [];
      }

      return atendimentos
        .filter(
          (atendimento) =>
            Number(
              atendimento.pessoaId
            ) ===
            Number(
              pessoaSelecionada.id
            )
        )
        .sort((a, b) => {

          const dataA =
            new Date(
              `${a.data}T${
                a.hora || "00:00"
              }`
            );

          const dataB =
            new Date(
              `${b.data}T${
                b.hora || "00:00"
              }`
            );

          return dataB - dataA;
        });

    }, [
      atendimentos,
      pessoaSelecionada
    ]);


  // ==========================================
  // MÉTRICAS DO HISTÓRICO
  // ==========================================

  const totalAtendimentos =
    historicoPessoaSelecionada.length;


  const ultimoAtendimento =
    historicoPessoaSelecionada.length > 0
      ? historicoPessoaSelecionada[0]
      : null;


  const totalProfissionais =
    useMemo(() => {

      const profissionais =
        new Set();

      historicoPessoaSelecionada
        .forEach(
          (atendimento) => {

            const identificador =
              atendimento.profissionalId ??
              atendimento.profissionalNome;

            if (
              identificador !== null &&
              identificador !== undefined
            ) {
              profissionais.add(
                identificador
              );
            }
          }
        );

      return profissionais.size;

    }, [
      historicoPessoaSelecionada
    ]);


  // ==========================================
  // PAGINAÇÃO DO HISTÓRICO
  // ==========================================

  const totalPaginasHistorico =
    Math.max(
      1,
      Math.ceil(
        historicoPessoaSelecionada.length /
        ATENDIMENTOS_POR_PAGINA
      )
    );


  useEffect(() => {

    if (
      paginaHistorico >
      totalPaginasHistorico
    ) {
      setPaginaHistorico(
        totalPaginasHistorico
      );
    }

  }, [
    paginaHistorico,
    totalPaginasHistorico
  ]);


  const inicioHistorico =
    (
      paginaHistorico - 1
    ) * ATENDIMENTOS_POR_PAGINA;


  const fimHistorico =
    inicioHistorico +
    ATENDIMENTOS_POR_PAGINA;


  const atendimentosDaPagina =
    historicoPessoaSelecionada.slice(
      inicioHistorico,
      fimHistorico
    );


  const primeiroAtendimento =
    historicoPessoaSelecionada.length === 0
      ? 0
      : inicioHistorico + 1;


  const ultimoAtendimentoPagina =
    Math.min(
      fimHistorico,
      historicoPessoaSelecionada.length
    );


  // ==========================================
  // CADASTRAR / EDITAR PESSOA
  // ==========================================

  function cadastrarPessoa(event) {
    event.preventDefault();

    // EDITANDO

    if (
      pessoaEditando !== null
    ) {
      const pessoasAtualizadas =
        pessoas.map(
          (pessoa) => {

            if (
              pessoa.id ===
              pessoaEditando
            ) {
              return {
                ...pessoa,

                nome,
                dataNascimento,
                telefone,
              };
            }

            return pessoa;
          }
        );

      setPessoas(
        pessoasAtualizadas
      );

      setPessoaEditando(null);
    }

    // CADASTRANDO

    else {
      const novaPessoa = {
        id: proximoId,

        nome,

        dataNascimento,

        telefone,

        ativo: true,
      };

      setPessoas([
        ...pessoas,
        novaPessoa
      ]);

      setProximoId(
        proximoId + 1
      );
    }

    limparFormulario();
  }


  // ==========================================
  // EDITAR
  // ==========================================

  function editarPessoa(pessoa) {
    setPessoaEditando(
      pessoa.id
    );

    setNome(
      pessoa.nome
    );

    setDataNascimento(
      pessoa.dataNascimento
    );

    setTelefone(
      pessoa.telefone
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  // ==========================================
  // CANCELAR EDIÇÃO
  // ==========================================

  function cancelarEdicao() {
    setPessoaEditando(null);

    limparFormulario();
  }


  // ==========================================
  // EXCLUIR
  // ==========================================

  function excluirPessoa(id) {
    const confirmar =
      window.confirm(
        "Deseja realmente excluir esta pessoa?"
      );

    if (!confirmar) {
      return;
    }

    const novaLista =
      pessoas.filter(
        (pessoa) =>
          pessoa.id !== id
      );

    setPessoas(
      novaLista
    );

    if (
      pessoaEditando === id
    ) {
      cancelarEdicao();
    }

    if (
      pessoaSelecionada?.id === id
    ) {
      fecharVisualizacaoPessoa();
    }
  }


  // ==========================================
  // LIMPAR FORMULÁRIO
  // ==========================================

  function limparFormulario() {
    setNome("");
    setDataNascimento("");
    setTelefone("");
  }


  // ==========================================
  // BUSCA
  // ==========================================

  function alterarFiltro(event) {
    setFiltroBusca(
      event.target.value
    );

    setTermoBusca("");

    setPaginaAtual(1);
  }


  function alterarBusca(event) {
    setTermoBusca(
      event.target.value
    );

    setPaginaAtual(1);
  }


  function limparBusca() {
    setTermoBusca("");

    setPaginaAtual(1);
  }


  function placeholderBusca() {
    if (
      filtroBusca === "nome"
    ) {
      return "Digite o nome da pessoa...";
    }

    if (
      filtroBusca === "id"
    ) {
      return "Digite o identificador...";
    }

    if (
      filtroBusca ===
      "dataNascimento"
    ) {
      return "Ex.: 21/02/2007";
    }

    if (
      filtroBusca ===
      "telefone"
    ) {
      return "Digite o telefone...";
    }

    return "Buscar...";
  }


  // ==========================================
  // VISUALIZAR PESSOA
  // ==========================================

  function visualizarPessoa(pessoa) {
    setPessoaSelecionada(
      pessoa
    );

    setAbaPessoaAtiva(
      "cadastro"
    );

    setPaginaHistorico(1);

    setAtendimentoVisualizando(
      null
    );
  }


  function fecharVisualizacaoPessoa() {
    setPessoaSelecionada(
      null
    );

    setAtendimentoVisualizando(
      null
    );

    setAbaPessoaAtiva(
      "cadastro"
    );

    setPaginaHistorico(1);
  }


  // ==========================================
  // VISUALIZAR ATENDIMENTO
  // ==========================================

  function visualizarAtendimento(
    atendimento
  ) {
    setAtendimentoVisualizando(
      atendimento
    );
  }


  function fecharAtendimento() {
    setAtendimentoVisualizando(
      null
    );
  }


  return (
    <div className="pessoas-page">

      {/* =====================================
          TÍTULO
      ===================================== */}

      <div className="page-title">

        <div>

          <h1>
            Pessoas
          </h1>

          <p>
            Cadastre e consulte as
            pessoas atendidas.
          </p>

        </div>


        <Link
          to="/dashboard"
          className="voltar-button"
        >
          ← Voltar
        </Link>

      </div>


      <div className="pessoas-container">

        {/* =====================================
            FORMULÁRIO
        ===================================== */}

        <section className="pessoas-form-card">

          <h2>
            {pessoaEditando !== null
              ? "Editar pessoa"
              : "Nova pessoa"}
          </h2>


          <form
            onSubmit={cadastrarPessoa}
          >

            <div className="form-group">

              <label>
                Nome completo
              </label>

              <input
                type="text"
                value={nome}
                onChange={(event) =>
                  setNome(
                    event.target.value
                  )
                }
                placeholder="Digite o nome"
                required
              />

            </div>


            <div className="form-group">

              <label>
                Data de nascimento
              </label>

              <input
                type="date"
                value={dataNascimento}
                onChange={(event) =>
                  setDataNascimento(
                    event.target.value
                  )
                }
                required
              />

            </div>


            <div className="form-group">

              <label>
                Telefone
              </label>

              <input
                type="text"
                value={telefone}
                onChange={(event) =>
                  setTelefone(
                    event.target.value
                  )
                }
                placeholder="(47) 99999-9999"
              />

            </div>


            <button
              type="submit"
              className="cadastrar-button"
            >
              {pessoaEditando !== null
                ? "Salvar alterações"
                : "Cadastrar pessoa"}
            </button>


            {pessoaEditando !== null && (

              <button
                type="button"
                className="editar-button"
                onClick={cancelarEdicao}
              >
                Cancelar edição
              </button>

            )}

          </form>

        </section>


        {/* =====================================
            LISTAGEM
        ===================================== */}

        <section className="pessoas-lista-card">

          <div className="lista-header">

            <div>

              <h2>
                Pessoas cadastradas
              </h2>

              <span className="lista-total-texto">

                {pessoas.length === 1
                  ? "1 pessoa cadastrada"
                  : `${pessoas.length} pessoas cadastradas`}

              </span>

            </div>


            <span className="contador-pessoas">
              {pessoas.length}
            </span>

          </div>


          {/* =================================
              BUSCA
          ================================= */}

          <div className="pessoas-busca-area">

            <select
              className="pessoas-filtro-select"
              value={filtroBusca}
              onChange={alterarFiltro}
            >

              <option value="nome">
                Nome
              </option>

              <option value="id">
                ID
              </option>

              <option value="dataNascimento">
                Data de nascimento
              </option>

              <option value="telefone">
                Telefone
              </option>

            </select>


            <div className="pessoas-busca-input-area">

              <svg
                className="pessoas-busca-icone"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >

                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />

                <line
                  x1="16.5"
                  y1="16.5"
                  x2="21"
                  y2="21"
                />

              </svg>


              <input
                type="text"
                value={termoBusca}
                onChange={alterarBusca}
                placeholder={
                  placeholderBusca()
                }
              />


              {termoBusca && (

                <button
                  type="button"
                  className="pessoas-busca-limpar"
                  onClick={limparBusca}
                  title="Limpar busca"
                >
                  ×
                </button>

              )}

            </div>

          </div>


          {termoBusca && (

            <div className="pessoas-resultado-busca">

              {pessoasFiltradas.length === 1
                ? "1 resultado encontrado"
                : `${pessoasFiltradas.length} resultados encontrados`}

            </div>

          )}


          {/* =================================
              LISTAGEM
          ================================= */}

          {pessoas.length === 0 ? (

            <div className="lista-vazia">
              Nenhuma pessoa cadastrada.
            </div>

          ) : pessoasFiltradas.length === 0 ? (

            <div className="lista-vazia">
              Nenhuma pessoa encontrada
              com esse filtro.
            </div>

          ) : (

            <>

              <div className="pessoas-lista">

                {pessoasDaPagina.map(
                  (pessoa) => (

                    <div
                      className="pessoa-item"
                      key={pessoa.id}
                    >

                      <div className="pessoa-avatar">

                        {pessoa.nome
                          .charAt(0)
                          .toUpperCase()}

                      </div>


                      <div className="pessoa-informacoes">

                        <strong>
                          {pessoa.nome}
                        </strong>

                        <span>
                          Identificador: {pessoa.id}
                        </span>

                        <span>
                          Data de nascimento:{" "}
                          {formatarData(
                            pessoa.dataNascimento
                          )}
                        </span>

                        <span>
                          Telefone:{" "}
                          {pessoa.telefone ||
                            "Não informado"}
                        </span>

                      </div>


                      <div className="pessoa-acoes">

                        <button
                          type="button"
                          className="visualizar-button"
                          onClick={() =>
                            visualizarPessoa(
                              pessoa
                            )
                          }
                        >
                          Visualizar
                        </button>


                        <button
                          type="button"
                          className="editar-button"
                          onClick={() =>
                            editarPessoa(
                              pessoa
                            )
                          }
                        >
                          Editar
                        </button>


                        <button
                          type="button"
                          className="excluir-button"
                          onClick={() =>
                            excluirPessoa(
                              pessoa.id
                            )
                          }
                        >
                          Excluir
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>


              {/* =================================
                  PAGINAÇÃO
              ================================= */}

              <div className="pessoas-paginacao">

                <div className="paginacao-informacoes">

                  <span>

                    Mostrando{" "}

                    <strong>
                      {primeiroItem}
                    </strong>

                    {"–"}

                    <strong>
                      {ultimoItem}
                    </strong>

                    {" de "}

                    <strong>
                      {pessoasFiltradas.length}
                    </strong>

                  </span>


                  <span className="paginacao-pagina">

                    Página{" "}

                    <strong>
                      {paginaAtual}
                    </strong>

                    {" de "}

                    <strong>
                      {totalPaginas}
                    </strong>

                  </span>

                </div>


                <div className="paginacao-botoes">

                  <button
                    type="button"
                    disabled={
                      paginaAtual === 1
                    }
                    onClick={() =>
                      setPaginaAtual(
                        (pagina) =>
                          pagina - 1
                      )
                    }
                  >
                    ← Anterior
                  </button>


                  <button
                    type="button"
                    disabled={
                      paginaAtual ===
                      totalPaginas
                    }
                    onClick={() =>
                      setPaginaAtual(
                        (pagina) =>
                          pagina + 1
                      )
                    }
                  >
                    Próxima →
                  </button>

                </div>

              </div>

            </>

          )}

        </section>

      </div>


      {/* =====================================
          MODAL DA PESSOA
      ===================================== */}

      {pessoaSelecionada && (

        <div
          className="pessoa-modal-overlay"
          onClick={
            fecharVisualizacaoPessoa
          }
        >

          <div
            className="pessoa-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CABEÇALHO */}

            <div className="pessoa-modal-header">

              <div>

                <span>
                  Pessoa cadastrada
                </span>

                <h2>
                  #{pessoaSelecionada.id}
                  {" - "}
                  {pessoaSelecionada.nome}
                </h2>

              </div>


              <button
                type="button"
                className="pessoa-modal-fechar"
                onClick={
                  fecharVisualizacaoPessoa
                }
              >
                ×
              </button>

            </div>


            {/* =================================
                ABAS
            ================================= */}

            <div className="pessoa-modal-tabs">

              <button
                type="button"
                className={
                  abaPessoaAtiva === "cadastro"
                    ? "pessoa-modal-tab ativa"
                    : "pessoa-modal-tab"
                }
                onClick={() =>
                  setAbaPessoaAtiva(
                    "cadastro"
                  )
                }
              >
                Informações de cadastro
              </button>


              <button
                type="button"
                className={
                  abaPessoaAtiva === "historico"
                    ? "pessoa-modal-tab ativa"
                    : "pessoa-modal-tab"
                }
                onClick={() => {
                  setAbaPessoaAtiva(
                    "historico"
                  );

                  setPaginaHistorico(1);
                }}
              >
                Histórico de atendimentos
              </button>

            </div>


            {/* =================================
                INFORMAÇÕES DE CADASTRO
            ================================= */}

            {abaPessoaAtiva === "cadastro" && (

              <div className="pessoa-modal-conteudo">

                <div className="pessoa-dados-grid">

                  <div>

                    <label>
                      Nome completo
                    </label>

                    <span>
                      {pessoaSelecionada.nome}
                    </span>

                  </div>


                  <div>

                    <label>
                      Identificador
                    </label>

                    <span>
                      #{pessoaSelecionada.id}
                    </span>

                  </div>


                  <div>

                    <label>
                      Data de nascimento
                    </label>

                    <span>
                      {formatarData(
                        pessoaSelecionada
                          .dataNascimento
                      )}
                    </span>

                  </div>


                  <div>

                    <label>
                      Telefone
                    </label>

                    <span>
                      {pessoaSelecionada.telefone ||
                        "Não informado"}
                    </span>

                  </div>

                </div>

              </div>

            )}


            {/* =================================
                HISTÓRICO
            ================================= */}

            {abaPessoaAtiva === "historico" && (

              <div className="pessoa-modal-conteudo">

                {/* MÉTRICAS */}

                <div className="pessoa-historico-metricas">

                  <div className="pessoa-metrica-card">

                    <span>
                      Atendimentos
                    </span>

                    <strong>
                      {totalAtendimentos}
                    </strong>

                  </div>


                  <div className="pessoa-metrica-card">

                    <span>
                      Último atendimento
                    </span>

                    <strong>

                      {ultimoAtendimento
                        ? formatarData(
                            ultimoAtendimento.data
                          )
                        : "—"}

                    </strong>

                  </div>


                  <div className="pessoa-metrica-card">

                    <span>
                      Profissionais
                    </span>

                    <strong>
                      {totalProfissionais}
                    </strong>

                  </div>

                </div>


                {/* SEM HISTÓRICO */}

                {historicoPessoaSelecionada.length === 0 ? (

                  <div className="pessoa-historico-vazio">
                    Nenhum atendimento registrado
                    para esta pessoa.
                  </div>

                ) : (

                  <>

                    {/* LISTA */}

                    <div className="pessoa-historico-lista">

                      {atendimentosDaPagina.map(
                        (atendimento) => (

                          <div
                            className="pessoa-historico-item"
                            key={
                              atendimento.id
                            }
                          >

                            <div className="pessoa-historico-info">

                              <strong>
                                Atendimento #
                                {atendimento.id}
                              </strong>

                              <span>
                                {formatarData(
                                  atendimento.data
                                )}
                                {" às "}
                                {atendimento.hora}
                              </span>

                              <span>
                                Profissional:{" "}
                                {atendimento.profissionalNome ||
                                  "Não informado"}
                              </span>

                            </div>


                            <div className="pessoa-historico-acoes">

                              <span className="status-atendimento">
                                {atendimento.status}
                              </span>


                              <button
                                type="button"
                                className="visualizar-atendimento-button"
                                onClick={() =>
                                  visualizarAtendimento(
                                    atendimento
                                  )
                                }
                              >
                                Visualizar
                              </button>

                            </div>

                          </div>

                        )
                      )}

                    </div>


                    {/* PAGINAÇÃO */}

                    <div className="pessoa-historico-paginacao">

                      <div>

                        Mostrando{" "}

                        <strong>
                          {primeiroAtendimento}
                        </strong>

                        {"–"}

                        <strong>
                          {ultimoAtendimentoPagina}
                        </strong>

                        {" de "}

                        <strong>
                          {historicoPessoaSelecionada.length}
                        </strong>


                        <span>
                          Página{" "}
                          <strong>
                            {paginaHistorico}
                          </strong>
                          {" de "}
                          <strong>
                            {totalPaginasHistorico}
                          </strong>
                        </span>

                      </div>


                      <div>

                        <button
                          type="button"
                          disabled={
                            paginaHistorico === 1
                          }
                          onClick={() =>
                            setPaginaHistorico(
                              (pagina) =>
                                pagina - 1
                            )
                          }
                        >
                          ← Anterior
                        </button>


                        <button
                          type="button"
                          disabled={
                            paginaHistorico ===
                            totalPaginasHistorico
                          }
                          onClick={() =>
                            setPaginaHistorico(
                              (pagina) =>
                                pagina + 1
                            )
                          }
                        >
                          Próxima →
                        </button>

                      </div>

                    </div>

                  </>

                )}

              </div>

            )}


            {/* RODAPÉ */}

            <div className="pessoa-modal-footer">

              <button
                type="button"
                className="cancelar-registro"
                onClick={
                  fecharVisualizacaoPessoa
                }
              >
                Fechar
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================================
          MODAL DO ATENDIMENTO
      ===================================== */}

      {atendimentoVisualizando && (

        <div
          className="pessoa-atendimento-overlay"
          onClick={fecharAtendimento}
        >

          <div
            className="pessoa-atendimento-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="pessoa-atendimento-header">

              <div>

                <span>
                  Registro de atendimento
                </span>

                <h2>
                  Atendimento #
                  {atendimentoVisualizando.id}
                </h2>

              </div>


              <button
                type="button"
                className="pessoa-modal-fechar"
                onClick={
                  fecharAtendimento
                }
              >
                ×
              </button>

            </div>


            <div className="pessoa-atendimento-grid">

              <div>

                <label>
                  Pessoa
                </label>

                <span>
                  {pessoaSelecionada?.nome ||
                    "Não localizada"}
                </span>

              </div>


              <div>

                <label>
                  Profissional
                </label>

                <span>
                  {atendimentoVisualizando.profissionalNome ||
                    "Não informado"}
                </span>

              </div>


              <div>

                <label>
                  Supervisor
                </label>

                <span>
                  {atendimentoVisualizando.supervisorNome ||
                    "Não informado"}
                </span>

              </div>


              <div>

                <label>
                  Data
                </label>

                <span>
                  {formatarData(
                    atendimentoVisualizando.data
                  )}
                </span>

              </div>


              <div>

                <label>
                  Horário
                </label>

                <span>
                  {atendimentoVisualizando.hora ||
                    "Não informado"}
                </span>

              </div>


              <div>

                <label>
                  Modalidade
                </label>

                <span>
                  {atendimentoVisualizando.modalidade ||
                    "Não informada"}
                </span>

              </div>


              <div>

                <label>
                  Status
                </label>

                <span>
                  {atendimentoVisualizando.status ||
                    "Não informado"}
                </span>

              </div>

            </div>


            <div className="pessoa-atendimento-anotacoes">

              <label>
                Anotações do atendimento
              </label>

              <div>
                {atendimentoVisualizando.anotacoes ||
                  "Nenhuma anotação registrada."}
              </div>

            </div>


            <div className="pessoa-modal-footer">

              <button
                type="button"
                className="cancelar-registro"
                onClick={
                  fecharAtendimento
                }
              >
                Fechar
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Pessoas;