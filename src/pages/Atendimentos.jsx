import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function Atendimentos() {
  // ==========================================
  // DATA E HORA
  // ==========================================

  function pegarDataAtual() {
    const agora = new Date();

    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  }

  function pegarHoraAtual() {
    const agora = new Date();

    const hora = String(agora.getHours()).padStart(2, "0");
    const minuto = String(agora.getMinutes()).padStart(2, "0");

    return `${hora}:${minuto}`;
  }

  function formatarData(dataOriginal) {
    if (!dataOriginal) {
      return "Não informada";
    }

    const [ano, mes, dia] = dataOriginal.split("-");

    return `${dia}/${mes}/${ano}`;
  }

  // ==========================================
  // PESSOAS
  // ==========================================

  const [pessoas] = useState(() => {
    const dados = localStorage.getItem("pessoas");

    return dados ? JSON.parse(dados) : [];
  });

  // ==========================================
  // USUÁRIO LOGADO
  // ==========================================

  const usuarioAtual = useMemo(() => {
    const dados = localStorage.getItem("usuarioLogado");

    if (dados) {
      return JSON.parse(dados);
    }

    return {
      id: null,
      nome: "Usuário não identificado",
      tipo: "aluno",
    };
  }, []);

  // ==========================================
  // SUPERVISOR
  // ==========================================

  const supervisorAtual =
    usuarioAtual.supervisorNome ||
    usuarioAtual.supervisor ||
    "Supervisor responsável";

  const supervisorAtualId =
    usuarioAtual.supervisorId ?? null;

  // ==========================================
  // ATENDIMENTOS
  // ==========================================

  const [atendimentos, setAtendimentos] = useState(() => {
    const dados = localStorage.getItem("atendimentos");

    return dados ? JSON.parse(dados) : [];
  });

  // ==========================================
  // PRÓXIMO ID
  // ==========================================

  const [proximoId, setProximoId] = useState(() => {
    const idSalvo = localStorage.getItem(
      "proximoIdAtendimento"
    );

    if (idSalvo) {
      return Number(idSalvo);
    }

    const dados = localStorage.getItem("atendimentos");

    if (dados) {
      const lista = JSON.parse(dados);

      if (lista.length > 0) {
        const maiorId = Math.max(
          ...lista.map((atendimento) =>
            Number(atendimento.id)
          )
        );

        return maiorId + 1;
      }
    }

    return 1;
  });

  // ==========================================
  // FORMULÁRIO
  // ==========================================

  const [pessoaId, setPessoaId] = useState("");

  const [data, setData] = useState(
    pegarDataAtual()
  );

  const [hora, setHora] = useState(
    pegarHoraAtual()
  );

  const [modalidade, setModalidade] =
    useState("Presencial");

  const [status, setStatus] =
    useState("Rascunho");

  const [anotacoes, setAnotacoes] =
    useState("");

  const [abaAtiva, setAbaAtiva] =
    useState("anotacoes");

  // ==========================================
  // BUSCA DE PESSOA
  // ==========================================

  const [
    buscaPessoaAberta,
    setBuscaPessoaAberta
  ] = useState(false);

  const [buscaPessoa, setBuscaPessoa] =
    useState("");

  // ==========================================
  // EDIÇÃO
  // ==========================================

  const [
    atendimentoEditando,
    setAtendimentoEditando,
  ] = useState(null);

  // ==========================================
  // MODAL
  // ==========================================

  const [
    atendimentoSelecionado,
    setAtendimentoSelecionado,
  ] = useState(null);

  // ==========================================
  // MENSAGENS
  // ==========================================

  const [mensagem, setMensagem] =
    useState("");

  const [erro, setErro] =
    useState("");

  // ==========================================
  // LOCAL STORAGE
  // ==========================================

  useEffect(() => {
    localStorage.setItem(
      "atendimentos",
      JSON.stringify(atendimentos)
    );
  }, [atendimentos]);

  useEffect(() => {
    localStorage.setItem(
      "proximoIdAtendimento",
      proximoId.toString()
    );
  }, [proximoId]);

  // ==========================================
  // PERMISSÃO DE EDIÇÃO
  // ==========================================

  function podeEditarAtendimento(atendimento) {
    if (
      !atendimento ||
      usuarioAtual.id === null ||
      usuarioAtual.id === undefined
    ) {
      return false;
    }

    // Autor do atendimento
    const ehAutor =
      Number(atendimento.profissionalId) ===
      Number(usuarioAtual.id);

    // Supervisor responsável
    const tipoUsuario = String(
      usuarioAtual.tipo || ""
    ).toLowerCase();

    const usuarioEhSupervisor =
      tipoUsuario === "supervisor" ||
      tipoUsuario === "professor";

    const atendimentoTemSupervisor =
      atendimento.supervisorId !== null &&
      atendimento.supervisorId !== undefined;

    const ehSupervisorResponsavel =
      usuarioEhSupervisor &&
      atendimentoTemSupervisor &&
      Number(atendimento.supervisorId) ===
        Number(usuarioAtual.id);

    return ehAutor || ehSupervisorResponsavel;
  }

  // ==========================================
  // BUSCA POR NOME
  // ==========================================

  function normalizarTexto(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  const pessoasFiltradas = useMemo(() => {
    if (!buscaPessoa.trim()) {
      return [];
    }

    const termo = normalizarTexto(
      buscaPessoa.trim()
    );

    return pessoas.filter((pessoa) => {
      const nome = normalizarTexto(
        pessoa.nome
      );

      return nome.includes(termo);
    });
  }, [pessoas, buscaPessoa]);

  // ==========================================
  // 10 PESSOAS MAIS RECENTES
  // ==========================================

  const pessoasRecentes = useMemo(() => {
    return [...pessoas]
      .sort(
        (a, b) =>
          Number(b.id) - Number(a.id)
      )
      .slice(0, 10);
  }, [pessoas]);

  // ==========================================
  // PESSOAS EXIBIDAS NO SELECT
  // ==========================================

  /*
    Normalmente mostra somente as 10 mais recentes.

    Porém, se uma pessoa antiga for escolhida
    pela lupa ou carregada durante uma edição,
    ela também precisa aparecer no select.

    Caso contrário, o select ficaria visualmente
    vazio porque o ID selecionado não estaria
    entre as opções recentes.
  */

  const pessoasDoSelect = useMemo(() => {
    if (!pessoaId) {
      return pessoasRecentes;
    }

    const pessoaAtual = pessoas.find(
      (pessoa) =>
        Number(pessoa.id) ===
        Number(pessoaId)
    );

    if (!pessoaAtual) {
      return pessoasRecentes;
    }

    const jaEstaNasRecentes =
      pessoasRecentes.some(
        (pessoa) =>
          Number(pessoa.id) ===
          Number(pessoaAtual.id)
      );

    if (jaEstaNasRecentes) {
      return pessoasRecentes;
    }

    return [
      pessoaAtual,
      ...pessoasRecentes,
    ];
  }, [
    pessoas,
    pessoasRecentes,
    pessoaId,
  ]);

  function selecionarPessoaBusca(pessoa) {
    setPessoaId(
      pessoa.id.toString()
    );

    setBuscaPessoa("");
    setBuscaPessoaAberta(false);

    setMensagem("");
    setErro("");
  }

  function alternarBuscaPessoa() {
    setBuscaPessoaAberta(
      (aberta) => !aberta
    );

    setBuscaPessoa("");

    setMensagem("");
    setErro("");
  }

  // ==========================================
  // ATENDIMENTO EM EDIÇÃO
  // ==========================================

  const atendimentoEmEdicao =
    atendimentoEditando !== null
      ? atendimentos.find(
          (atendimento) =>
            atendimento.id ===
            atendimentoEditando
        )
      : null;

  // ==========================================
  // PROFISSIONAL / SUPERVISOR EXIBIDOS
  // ==========================================

  const profissionalExibido =
    atendimentoEmEdicao?.profissionalNome ||
    usuarioAtual.nome;

  const supervisorExibido =
    atendimentoEmEdicao?.supervisorNome ||
    supervisorAtual;

  // ==========================================
  // PESSOA SELECIONADA
  // ==========================================

  const pessoaSelecionada = useMemo(() => {
    if (!pessoaId) {
      return null;
    }

    return pessoas.find(
      (pessoa) =>
        Number(pessoa.id) ===
        Number(pessoaId)
    );
  }, [pessoas, pessoaId]);

  // ==========================================
  // HISTÓRICO DA PESSOA
  // ==========================================

  const historicoPessoa = useMemo(() => {
    if (!pessoaId) {
      return [];
    }

    return atendimentos
      .filter(
        (atendimento) =>
          Number(atendimento.pessoaId) ===
          Number(pessoaId)
      )
      .sort((a, b) => {
        const dataA = new Date(
          `${a.data}T${a.hora || "00:00"}`
        );

        const dataB = new Date(
          `${b.data}T${b.hora || "00:00"}`
        );

        return dataB - dataA;
      });
  }, [atendimentos, pessoaId]);

  // ==========================================
  // SALVAR ATENDIMENTO
  // ==========================================

  function salvarAtendimento(event) {
    event.preventDefault();

    setMensagem("");
    setErro("");

    if (!pessoaId) {
      setErro(
        "Selecione a pessoa atendida."
      );

      return;
    }

    if (!anotacoes.trim()) {
      setErro(
        "Preencha as anotações do atendimento."
      );

      setAbaAtiva("anotacoes");

      return;
    }

    // ======================================
    // EDITAR
    // ======================================

    if (atendimentoEditando !== null) {
      const atendimentoOriginal =
        atendimentos.find(
          (atendimento) =>
            atendimento.id ===
            atendimentoEditando
        );

      if (!atendimentoOriginal) {
        setErro(
          "Atendimento não localizado."
        );

        setAtendimentoEditando(null);

        return;
      }

      if (
        !podeEditarAtendimento(
          atendimentoOriginal
        )
      ) {
        setErro(
          "Você não possui permissão para editar este atendimento."
        );

        setAtendimentoEditando(null);

        limparFormulario(true);

        return;
      }

      const atualizados =
        atendimentos.map(
          (atendimento) => {
            if (
              atendimento.id ===
              atendimentoEditando
            ) {
              return {
                ...atendimento,

                pessoaId:
                  Number(pessoaId),

                data,
                hora,

                modalidade,
                status,

                anotacoes:
                  anotacoes.trim(),

                atualizadoEm:
                  new Date().toISOString(),

                atualizadoPorId:
                  usuarioAtual.id,

                atualizadoPorNome:
                  usuarioAtual.nome,
              };
            }

            return atendimento;
          }
        );

      setAtendimentos(atualizados);

      setMensagem(
        `Atendimento #${atendimentoEditando} atualizado com sucesso.`
      );

      setAtendimentoEditando(null);
    }

    // ======================================
    // NOVO
    // ======================================

    else {
      const novoAtendimento = {
        id: proximoId,

        pessoaId:
          Number(pessoaId),

        profissionalId:
          usuarioAtual.id,

        profissionalNome:
          usuarioAtual.nome,

        profissionalTipo:
          usuarioAtual.tipo,

        supervisorId:
          supervisorAtualId,

        supervisorNome:
          supervisorAtual,

        data,
        hora,

        modalidade,
        status,

        anotacoes:
          anotacoes.trim(),

        criadoEm:
          new Date().toISOString(),
      };

      setAtendimentos([
        ...atendimentos,
        novoAtendimento,
      ]);

      setMensagem(
        `Atendimento #${proximoId} registrado com sucesso.`
      );

      setProximoId(
        proximoId + 1
      );
    }

    limparFormulario(true);
  }

  // ==========================================
  // LIMPAR FORMULÁRIO
  // ==========================================

  function limparFormulario(
    manterPessoa = false
  ) {
    if (!manterPessoa) {
      setPessoaId("");
    }

    setData(
      pegarDataAtual()
    );

    setHora(
      pegarHoraAtual()
    );

    setModalidade(
      "Presencial"
    );

    setStatus(
      "Rascunho"
    );

    setAnotacoes("");
  }

  // ==========================================
  // CANCELAR EDIÇÃO
  // ==========================================

  function cancelarEdicao() {
    setAtendimentoEditando(null);

    setErro("");
    setMensagem("");

    limparFormulario(true);
  }

  // ==========================================
  // BUSCAR PESSOA PELO ID
  // ==========================================

  function buscarPessoa(id) {
    return pessoas.find(
      (pessoa) =>
        Number(pessoa.id) ===
        Number(id)
    );
  }

  // ==========================================
  // VISUALIZAR ATENDIMENTO
  // ==========================================

  function visualizarAtendimento(
    atendimento
  ) {
    setAtendimentoSelecionado(
      atendimento
    );
  }

  // ==========================================
  // FECHAR MODAL
  // ==========================================

  function fecharModal() {
    setAtendimentoSelecionado(
      null
    );
  }

  // ==========================================
  // EDITAR ATENDIMENTO
  // ==========================================

  function editarAtendimento(
    atendimento
  ) {
    setErro("");
    setMensagem("");

    if (
      !podeEditarAtendimento(
        atendimento
      )
    ) {
      setAtendimentoSelecionado(
        null
      );

      setErro(
        "Este atendimento somente pode ser editado pelo profissional responsável ou pelo supervisor responsável."
      );

      return;
    }

    setAtendimentoEditando(
      atendimento.id
    );

    setPessoaId(
      atendimento.pessoaId.toString()
    );

    setData(
      atendimento.data
    );

    setHora(
      atendimento.hora
    );

    setModalidade(
      atendimento.modalidade
    );

    setStatus(
      atendimento.status
    );

    setAnotacoes(
      atendimento.anotacoes
    );

    setAbaAtiva(
      "anotacoes"
    );

    setAtendimentoSelecionado(
      null
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div className="registro-page">

      {/* =================================
          CABEÇALHO
      ================================= */}

      <div className="registro-titulo">
        <div>
          <h1>
            Registro de Atendimento
          </h1>

          <p>
            Registro e acompanhamento dos
            atendimentos realizados.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="voltar-button"
        >
          ← Voltar
        </Link>
      </div>


      <form
        onSubmit={salvarAtendimento}
      >

        {/* =================================
            INFORMAÇÕES DO ATENDIMENTO
        ================================= */}

        <section className="registro-info-card">

          <div className="registro-section-title">
            Informações do Atendimento
          </div>


          <div className="registro-info-grid">

            {/* =============================
                ESQUERDA
            ============================= */}

            <div className="registro-info-coluna">

              {/* =================================
                  PESSOA + BUSCA
              ================================= */}

              <div className="registro-linha">

                <label>
                  Pessoa
                </label>


                <div className="pessoa-selecao-area">

                  <div className="pessoa-selecao-principal">

                    <select
                      value={pessoaId}
                      onChange={(event) => {
                        setPessoaId(
                          event.target.value
                        );

                        setMensagem("");
                        setErro("");
                      }}
                      required
                    >

                      <option value="">
                        Selecione uma pessoa recente...
                      </option>


                      {pessoasDoSelect.map(
                        (pessoa) => (
                          <option
                            key={pessoa.id}
                            value={pessoa.id}
                          >
                            #{pessoa.id} - {pessoa.nome}
                          </option>
                        )
                      )}

                    </select>


                    <button
                      type="button"
                      className={
                        buscaPessoaAberta
                          ? "buscar-pessoa-button ativo"
                          : "buscar-pessoa-button"
                      }
                      title="Buscar pessoa pelo nome"
                      aria-label="Buscar pessoa pelo nome"
                      onClick={alternarBuscaPessoa}
                    >

                      <svg
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

                    </button>

                  </div>


                  {/* =================================
                      CAIXA DE PESQUISA
                  ================================= */}

                  {buscaPessoaAberta && (

                    <div className="busca-pessoa-box">

                      <input
                        type="text"
                        autoFocus
                        placeholder="Digite o nome da pessoa..."
                        value={buscaPessoa}
                        onChange={(event) =>
                          setBuscaPessoa(
                            event.target.value
                          )
                        }
                      />


                      {buscaPessoa.trim() && (

                        <div className="busca-pessoa-resultados">

                          {pessoasFiltradas.length > 0 ? (

                            pessoasFiltradas.map(
                              (pessoa) => (

                                <button
                                  type="button"
                                  className="busca-pessoa-item"
                                  key={pessoa.id}
                                  onClick={() =>
                                    selecionarPessoaBusca(
                                      pessoa
                                    )
                                  }
                                >

                                  <span className="busca-pessoa-id">
                                    #{pessoa.id}
                                  </span>

                                  <strong>
                                    {pessoa.nome}
                                  </strong>

                                </button>

                              )
                            )

                          ) : (

                            <div className="busca-pessoa-vazia">
                              Nenhuma pessoa encontrada.
                            </div>

                          )}

                        </div>

                      )}

                    </div>

                  )}

                </div>

              </div>


              {/* PROFISSIONAL */}

              <div className="registro-linha">

                <label>
                  Profissional
                </label>

                <div className="campo-bloqueado">
                  {profissionalExibido}
                </div>

              </div>


              {/* SUPERVISOR */}

              <div className="registro-linha">

                <label>
                  Supervisor
                </label>

                <div className="campo-bloqueado">
                  {supervisorExibido}
                </div>

              </div>

            </div>


            {/* =============================
                DIREITA
            ============================= */}

            <div className="registro-info-coluna">

              <div className="registro-linha-dupla">

                <div>

                  <label>
                    Data
                  </label>

                  <input
                    type="date"
                    value={data}
                    onChange={(event) =>
                      setData(
                        event.target.value
                      )
                    }
                    required
                  />

                </div>


                <div>

                  <label>
                    Horário
                  </label>

                  <input
                    type="time"
                    value={hora}
                    onChange={(event) =>
                      setHora(
                        event.target.value
                      )
                    }
                    required
                  />

                </div>

              </div>


              <div className="registro-linha">

                <label>
                  Modalidade
                </label>

                <select
                  value={modalidade}
                  onChange={(event) =>
                    setModalidade(
                      event.target.value
                    )
                  }
                >
                  <option>
                    Presencial
                  </option>

                  <option>
                    Online
                  </option>
                </select>

              </div>


              <div className="registro-linha">

                <label>
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value
                    )
                  }
                >
                  <option>
                    Rascunho
                  </option>

                  <option>
                    Enviado para supervisão
                  </option>

                  <option>
                    Revisado
                  </option>

                  <option>
                    Concluído
                  </option>
                </select>

              </div>

            </div>

          </div>

        </section>


        {/* =================================
            CONTEÚDO
        ================================= */}

        <section className="registro-conteudo-card">

          {/* ABAS */}

          <div className="registro-tabs">

            <button
              type="button"
              className={
                abaAtiva === "anotacoes"
                  ? "tab ativa"
                  : "tab"
              }
              onClick={() =>
                setAbaAtiva("anotacoes")
              }
            >
              Anotações do Atendimento
            </button>


            <button
              type="button"
              className={
                abaAtiva === "profissionais"
                  ? "tab ativa"
                  : "tab"
              }
              onClick={() =>
                setAbaAtiva("profissionais")
              }
            >
              Profissionais
            </button>


            <button
              type="button"
              className={
                abaAtiva === "supervisao"
                  ? "tab ativa"
                  : "tab"
              }
              onClick={() =>
                setAbaAtiva("supervisao")
              }
            >
              Supervisão
            </button>


            <button
              type="button"
              className={
                abaAtiva === "historico"
                  ? "tab ativa"
                  : "tab"
              }
              onClick={() =>
                setAbaAtiva("historico")
              }
            >
              Histórico
            </button>

          </div>


          {/* =================================
              ANOTAÇÕES
          ================================= */}

          {abaAtiva === "anotacoes" && (

            <div className="registro-tab-conteudo">

              <label className="registro-orientacao">
                Registre abaixo as informações
                pertinentes ao atendimento.
              </label>

              <textarea
                className="registro-textarea"
                value={anotacoes}
                onChange={(event) =>
                  setAnotacoes(
                    event.target.value
                  )
                }
              />

            </div>

          )}


          {/* =================================
              PROFISSIONAIS
          ================================= */}

          {abaAtiva === "profissionais" && (

            <div className="registro-tab-conteudo">

              <h3>
                Profissionais vinculados
              </h3>

              <div className="profissional-card">

                <strong>
                  Responsável pelo atendimento
                </strong>

                <span>
                  {profissionalExibido}
                </span>

              </div>

              <div className="profissional-card">

                <strong>
                  Supervisor
                </strong>

                <span>
                  {supervisorExibido}
                </span>

              </div>

            </div>

          )}


          {/* =================================
              SUPERVISÃO
          ================================= */}

          {abaAtiva === "supervisao" && (

            <div className="registro-tab-conteudo">

              <h3>
                Supervisão
              </h3>

              <p className="texto-secundario">
                Nesta área ficará o parecer,
                revisão ou orientação realizada
                pelo supervisor responsável.
              </p>

            </div>

          )}


          {/* =================================
              HISTÓRICO
          ================================= */}

          {abaAtiva === "historico" && (

            <div className="registro-tab-conteudo">

              {!pessoaId ? (

                <div className="historico-vazio">

                  <h3>
                    Histórico de atendimentos
                  </h3>

                  <p>
                    Selecione uma pessoa para
                    consultar os atendimentos
                    registrados.
                  </p>

                </div>

              ) : (

                <>

                  <div className="historico-pessoa-cabecalho">

                    <div>

                      <h3>
                        Histórico de atendimentos
                      </h3>

                      <span>
                        {pessoaSelecionada
                          ? `#${pessoaSelecionada.id} - ${pessoaSelecionada.nome}`
                          : "Pessoa não localizada"}
                      </span>

                    </div>

                    <span className="historico-contador">
                      {historicoPessoa.length}
                    </span>

                  </div>


                  {historicoPessoa.length === 0 ? (

                    <div className="historico-vazio">
                      Nenhum atendimento registrado
                      para esta pessoa.
                    </div>

                  ) : (

                    <div className="historico-atendimentos-lista">

                      {historicoPessoa.map(
                        (atendimento) => (

                          <div
                            className="historico-atendimento-item"
                            key={atendimento.id}
                          >

                            <div className="historico-atendimento-principal">

                              <strong>
                                Atendimento #{atendimento.id}
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
                                {atendimento.profissionalNome}
                              </span>

                            </div>


                            <div className="historico-atendimento-lateral">

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

                  )}

                </>

              )}

            </div>

          )}

        </section>


        {/* =================================
            MENSAGENS
        ================================= */}

        {erro && (

          <div className="registro-mensagem erro">
            {erro}
          </div>

        )}

        {mensagem && (

          <div className="registro-mensagem sucesso">
            {mensagem}
          </div>

        )}


        {/* =================================
            BOTÕES
        ================================= */}

        <div className="registro-botoes">

          <button
            type="submit"
            className="confirmar-registro"
          >
            {atendimentoEditando !== null
              ? "Salvar alterações"
              : "Confirmar registro"}
          </button>


          {atendimentoEditando !== null ? (

            <button
              type="button"
              className="cancelar-registro"
              onClick={cancelarEdicao}
            >
              Cancelar edição
            </button>

          ) : (

            <Link
              to="/dashboard"
              className="cancelar-registro"
            >
              Voltar
            </Link>

          )}

        </div>

      </form>


      {/* =====================================
          MODAL
      ===================================== */}

      {atendimentoSelecionado && (

        <div
          className="atendimento-modal-overlay"
          onClick={fecharModal}
        >

          <div
            className="atendimento-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="atendimento-modal-header">

              <div>

                <span>
                  Registro de atendimento
                </span>

                <h2>
                  Atendimento #
                  {atendimentoSelecionado.id}
                </h2>

              </div>


              <button
                type="button"
                className="modal-fechar"
                onClick={fecharModal}
              >
                ×
              </button>

            </div>


            <div className="atendimento-modal-pessoa">

              <strong>
                {buscarPessoa(
                  atendimentoSelecionado.pessoaId
                )?.nome ||
                  "Pessoa não localizada"}
              </strong>

              <span>
                Identificador da pessoa: #
                {atendimentoSelecionado.pessoaId}
              </span>

            </div>


            <div className="atendimento-modal-grid">

              <div>

                <label>
                  Profissional
                </label>

                <span>
                  {
                    atendimentoSelecionado
                      .profissionalNome
                  }
                </span>

              </div>


              <div>

                <label>
                  Supervisor
                </label>

                <span>
                  {
                    atendimentoSelecionado
                      .supervisorNome
                  }
                </span>

              </div>


              <div>

                <label>
                  Data
                </label>

                <span>
                  {formatarData(
                    atendimentoSelecionado.data
                  )}
                </span>

              </div>


              <div>

                <label>
                  Horário
                </label>

                <span>
                  {atendimentoSelecionado.hora}
                </span>

              </div>


              <div>

                <label>
                  Modalidade
                </label>

                <span>
                  {
                    atendimentoSelecionado
                      .modalidade
                  }
                </span>

              </div>


              <div>

                <label>
                  Status
                </label>

                <span className="status-atendimento">
                  {atendimentoSelecionado.status}
                </span>

              </div>

            </div>


            <div className="atendimento-modal-anotacoes">

              <label>
                Anotações do atendimento
              </label>

              <div>
                {atendimentoSelecionado.anotacoes}
              </div>

            </div>


            {/* =================================
                SOMENTE LEITURA
            ================================= */}

            {!podeEditarAtendimento(
              atendimentoSelecionado
            ) && (

              <div
                style={{
                  padding: "0 22px 18px",
                  color: "#8fa0b5",
                  fontSize: "12px",
                }}
              >

                Este atendimento foi registrado por{" "}

                <strong>
                  {
                    atendimentoSelecionado
                      .profissionalNome
                  }
                </strong>

                . Somente o profissional responsável
                ou seu supervisor podem editar este
                registro.

              </div>

            )}


            <div className="atendimento-modal-acoes">

              {podeEditarAtendimento(
                atendimentoSelecionado
              ) && (

                <button
                  type="button"
                  className="editar-button"
                  onClick={() =>
                    editarAtendimento(
                      atendimentoSelecionado
                    )
                  }
                >
                  Editar atendimento
                </button>

              )}


              <button
                type="button"
                className="cancelar-registro"
                onClick={fecharModal}
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

export default Atendimentos;