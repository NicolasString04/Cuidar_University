import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Supervisao() {
  const [alunos, setAlunos] = useState(() => {
    const dados = localStorage.getItem("alunos");

    return dados ? JSON.parse(dados) : [];
  });

  const [proximoId, setProximoId] = useState(() => {
    const id = localStorage.getItem("proximoIdAluno");

    return id ? Number(id) : 1;
  });

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [matricula, setMatricula] = useState("");
  const [acessoAte, setAcessoAte] = useState("");

  // =========================
  // LOCAL STORAGE
  // =========================

  useEffect(() => {
    localStorage.setItem(
      "alunos",
      JSON.stringify(alunos)
    );
  }, [alunos]);

  useEffect(() => {
    localStorage.setItem(
      "proximoIdAluno",
      proximoId.toString()
    );
  }, [proximoId]);

  // =========================
  // GERAR CHAVE
  // =========================

  function gerarChave() {
    const caracteres =
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let chave = "";

    for (let i = 0; i < 8; i++) {
      chave += caracteres.charAt(
        Math.floor(
          Math.random() * caracteres.length
        )
      );
    }

    return `PSI-${chave.slice(0, 4)}-${chave.slice(4)}`;
  }

  // =========================
  // CADASTRAR ALUNO
  // =========================

  function cadastrarAluno(event) {
    event.preventDefault();

    const novoAluno = {
      id: proximoId,

      nome,
      email,
      matricula,

      acessoAte,

      ativo: true,

      chave: gerarChave(),

      chaveUtilizada: false,

      criadoEm: new Date().toISOString(),
    };

    setAlunos([
      ...alunos,
      novoAluno
    ]);

    setProximoId(proximoId + 1);

    setNome("");
    setEmail("");
    setMatricula("");
    setAcessoAte("");
  }

  // =========================
  // BLOQUEAR
  // =========================

  function bloquearAluno(id) {
    const atualizados = alunos.map((aluno) => {
      if (aluno.id === id) {
        return {
          ...aluno,
          ativo: false,
        };
      }

      return aluno;
    });

    setAlunos(atualizados);
  }

  // =========================
  // REATIVAR
  // =========================

  function reativarAluno(id) {
    const atualizados = alunos.map((aluno) => {
      if (aluno.id === id) {
        return {
          ...aluno,
          ativo: true,
        };
      }

      return aluno;
    });

    setAlunos(atualizados);
  }

  // =========================
  // NOVA CHAVE
  // =========================

  function renovarChave(id) {
    const confirmar = window.confirm(
      "Deseja realmente gerar uma nova chave para este aluno?"
    );

    if (!confirmar) {
      return;
    }

    const atualizados = alunos.map((aluno) => {
      if (aluno.id === id) {
        return {
          ...aluno,

          chave: gerarChave(),

          chaveUtilizada: false,
        };
      }

      return aluno;
    });

    setAlunos(atualizados);
  }

  // =========================
  // EXCLUIR
  // =========================

  function excluirAluno(id) {
    const aluno = alunos.find(
      (aluno) => aluno.id === id
    );

    if (!aluno) {
      return;
    }

    const confirmar = window.confirm(
      `Deseja realmente excluir o aluno "${aluno.nome}"?\n\nEssa ação removerá o cadastro deste protótipo.`
    );

    if (!confirmar) {
      return;
    }

    const novaLista = alunos.filter(
      (aluno) => aluno.id !== id
    );

    setAlunos(novaLista);
  }

  // =========================
  // FORMATAR DATA
  // =========================

  function formatarData(data) {
    if (!data) {
      return "Não definida";
    }

    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;
  }

  return (
    <div className="supervisao-page">

      {/* TÍTULO */}

      <div className="page-title">

        <div>
          <h1>Supervisão</h1>

          <p>
            Gerencie alunos, prazos e chaves de acesso.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="voltar-button"
        >
          ← Voltar
        </Link>

      </div>


      <div className="supervisao-container">


        {/* CADASTRAR ALUNO */}

        <section className="supervisao-form-card">

          <h2>
            Cadastrar aluno
          </h2>

          <form onSubmit={cadastrarAluno}>

            <div className="form-group">

              <label>
                Nome completo
              </label>

              <input
                type="text"
                value={nome}
                onChange={(event) =>
                  setNome(event.target.value)
                }
                placeholder="Digite o nome do aluno"
                required
              />

            </div>


            <div className="form-group">

              <label>
                E-mail
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="aluno@faculdade.edu.br"
                required
              />

            </div>


            <div className="form-group">

              <label>
                Matrícula
              </label>

              <input
                type="text"
                value={matricula}
                onChange={(event) =>
                  setMatricula(event.target.value)
                }
                placeholder="Digite a matrícula"
                required
              />

            </div>


            <div className="form-group">

              <label>
                Acesso permitido até
              </label>

              <input
                type="date"
                value={acessoAte}
                onChange={(event) =>
                  setAcessoAte(
                    event.target.value
                  )
                }
                required
              />

            </div>


            <button
              type="submit"
              className="cadastrar-button"
            >
              Cadastrar e gerar chave
            </button>

          </form>

        </section>


        {/* LISTAGEM */}

        <section className="supervisao-lista-card">

          <div className="lista-header">

            <h2>
              Alunos supervisionados
            </h2>

            <span className="contador-pessoas">
              {alunos.length}
            </span>

          </div>


          {alunos.length === 0 ? (

            <div className="lista-vazia">
              Nenhum aluno cadastrado.
            </div>

          ) : (

            <div className="alunos-lista">

              {alunos.map((aluno) => (

                <div
                  className="aluno-item"
                  key={aluno.id}
                >

                  {/* DADOS PRINCIPAIS */}

                  <div className="aluno-topo">

                    <div>

                      <strong>
                        {aluno.nome}
                      </strong>

                      <span>
                        Matrícula: {aluno.matricula}
                      </span>

                      <span>
                        {aluno.email}
                      </span>

                    </div>


                    <span
                      className={
                        aluno.ativo
                          ? "status-aluno ativo"
                          : "status-aluno bloqueado"
                      }
                    >

                      {aluno.ativo
                        ? "Ativo"
                        : "Bloqueado"}

                    </span>

                  </div>


                  {/* ID E PRAZO */}

                  <div className="aluno-dados">

                    <span>
                      Identificador: {aluno.id}
                    </span>

                    <span>
                      Acesso até:{" "}
                      {formatarData(
                        aluno.acessoAte
                      )}
                    </span>

                  </div>


                  {/* CHAVE */}

                  <div className="chave-card">

                    <span>
                      Chave de ativação
                    </span>

                    <strong>
                      {aluno.chave}
                    </strong>

                    <small>

                      {aluno.chaveUtilizada
                        ? "Chave já utilizada"
                        : "Aguardando ativação"}

                    </small>

                  </div>


                  {/* AÇÕES */}

                  <div className="aluno-acoes">

                    <button
                      type="button"
                      className="editar-button"
                      onClick={() =>
                        renovarChave(aluno.id)
                      }
                    >
                      Nova chave
                    </button>


                    {aluno.ativo ? (

                      <button
                        type="button"
                        className="bloquear-button"
                        onClick={() =>
                          bloquearAluno(
                            aluno.id
                          )
                        }
                      >
                        Bloquear
                      </button>

                    ) : (

                      <button
                        type="button"
                        className="reativar-button"
                        onClick={() =>
                          reativarAluno(
                            aluno.id
                          )
                        }
                      >
                        Reativar
                      </button>

                    )}


                    <button
                      type="button"
                      className="excluir-button"
                      onClick={() =>
                        excluirAluno(aluno.id)
                      }
                    >
                      Excluir
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </div>

    </div>
  );
}

export default Supervisao;