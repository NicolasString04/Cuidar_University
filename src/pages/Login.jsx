import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [tipoAcesso, setTipoAcesso] = useState("aluno");
  const [modoAluno, setModoAluno] = useState("login");

  // LOGIN NORMAL
  const [matriculaLogin, setMatriculaLogin] = useState("");
  const [senhaLogin, setSenhaLogin] = useState("");

  // PRIMEIRO ACESSO
  const [matricula, setMatricula] = useState("");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");

  const [alunoValidado, setAlunoValidado] = useState(null);

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");


  // ==================================
  // PEGAR ALUNOS CADASTRADOS
  // ==================================

  function carregarAlunos() {
    const dados = localStorage.getItem("alunos");

    return dados ? JSON.parse(dados) : [];
  }


  // ==================================
  // VERIFICAR PRAZO
  // ==================================

  function acessoExpirado(dataFinal) {
    if (!dataFinal) {
      return true;
    }

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    const limite = new Date(
      `${dataFinal}T23:59:59`
    );

    return hoje > limite;
  }


  // ==================================
  // FORMATAR DATA
  // ==================================

  function formatarData(data) {
    if (!data) {
      return "Não informada";
    }

    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;
  }


  // ==================================
  // VALIDAR PRIMEIRO ACESSO
  // ==================================

  function validarPrimeiroAcesso(event) {
    event.preventDefault();

    setErro("");
    setMensagem("");
    setAlunoValidado(null);

    const alunos = carregarAlunos();

    const aluno = alunos.find(
      (item) =>
        item.matricula.trim() === matricula.trim() &&
        item.email.toLowerCase().trim() ===
          email.toLowerCase().trim() &&
        item.chave.toUpperCase().trim() ===
          codigo.toUpperCase().trim()
    );

    if (!aluno) {
      setErro(
        "Matrícula, e-mail ou código de acesso inválidos."
      );

      return;
    }

    if (!aluno.ativo) {
      setErro(
        "O acesso deste aluno está bloqueado."
      );

      return;
    }

    if (aluno.chaveUtilizada) {
      setErro(
        "Esta chave já foi utilizada. Entre pela opção 'Já sou cadastrado'."
      );

      return;
    }

    if (acessoExpirado(aluno.acessoAte)) {
      setErro(
        "O período de acesso autorizado já expirou."
      );

      return;
    }

    setAlunoValidado(aluno);

    setMensagem(
      "Dados validados. Agora crie sua senha."
    );
  }


  // ==================================
  // ATIVAR CONTA
  // ==================================

  function ativarConta(event) {
    event.preventDefault();

    setErro("");
    setMensagem("");

    if (!alunoValidado) {
      setErro(
        "Primeiro valide seus dados."
      );

      return;
    }

    if (novaSenha.length < 6) {
      setErro(
        "A senha precisa ter pelo menos 6 caracteres."
      );

      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro(
        "As senhas não são iguais."
      );

      return;
    }

    const alunos = carregarAlunos();

    const alunosAtualizados = alunos.map(
      (aluno) => {

        if (aluno.id === alunoValidado.id) {

          return {
            ...aluno,

            senha: novaSenha,

            contaAtivada: true,

            chaveUtilizada: true,

            ativadoEm: new Date().toISOString(),
          };
        }

        return aluno;
      }
    );

    localStorage.setItem(
      "alunos",
      JSON.stringify(alunosAtualizados)
    );


    // SIMULA USUÁRIO LOGADO
    const usuarioLogado = {
      id: alunoValidado.id,
      nome: alunoValidado.nome,
      matricula: alunoValidado.matricula,
      email: alunoValidado.email,

      tipo: "aluno",

      acessoAte: alunoValidado.acessoAte,
    };

    localStorage.setItem(
      "usuarioLogado",
      JSON.stringify(usuarioLogado)
    );

    navigate("/dashboard");
  }


  // ==================================
  // LOGIN ALUNO
  // ==================================

  function loginAluno(event) {
    event.preventDefault();

    setErro("");
    setMensagem("");

    const alunos = carregarAlunos();

    const aluno = alunos.find(
      (item) =>
        item.matricula.trim() ===
          matriculaLogin.trim() &&
        item.senha === senhaLogin
    );

    if (!aluno) {
      setErro(
        "Matrícula ou senha inválidas."
      );

      return;
    }

    if (!aluno.contaAtivada) {
      setErro(
        "Esta conta ainda não foi ativada."
      );

      return;
    }

    if (!aluno.ativo) {
      setErro(
        "Seu acesso está bloqueado."
      );

      return;
    }

    if (acessoExpirado(aluno.acessoAte)) {
      setErro(
        "Seu período de acesso expirou."
      );

      return;
    }

    const usuarioLogado = {
      id: aluno.id,
      nome: aluno.nome,
      matricula: aluno.matricula,
      email: aluno.email,

      tipo: "aluno",

      acessoAte: aluno.acessoAte,
    };

    localStorage.setItem(
      "usuarioLogado",
      JSON.stringify(usuarioLogado)
    );

    navigate("/dashboard");
  }


  return (
    <div className="login-page">

      <div className="login-box">

        <div className="login-logo">
          Ψ
        </div>

        <h1>
          Cuidar
        </h1>

        <p className="login-subtitulo">
          Sistema de Supervisão Psicológica
        </p>


        {/* ESCOLHER PERFIL */}

        <div className="tipo-acesso">

          <button
            className={
              tipoAcesso === "aluno"
                ? "tipo-button ativo"
                : "tipo-button"
            }
            onClick={() => {
              setTipoAcesso("aluno");
              setErro("");
            }}
          >
            Aluno
          </button>

          <button
            className={
              tipoAcesso === "supervisor"
                ? "tipo-button ativo"
                : "tipo-button"
            }
            onClick={() => {
              setTipoAcesso("supervisor");
              setErro("");
            }}
          >
            Supervisor
          </button>

        </div>


        {/* ============================
            ALUNO
        ============================ */}

        {tipoAcesso === "aluno" && (

          <div className="login-area">

            <div className="modo-aluno">

              <button
                className={
                  modoAluno === "login"
                    ? "modo-button ativo"
                    : "modo-button"
                }
                onClick={() => {
                  setModoAluno("login");
                  setAlunoValidado(null);
                  setErro("");
                  setMensagem("");
                }}
              >
                Já sou cadastrado
              </button>


              <button
                className={
                  modoAluno === "cadastro"
                    ? "modo-button ativo"
                    : "modo-button"
                }
                onClick={() => {
                  setModoAluno("cadastro");
                  setAlunoValidado(null);
                  setErro("");
                  setMensagem("");
                }}
              >
                Primeiro acesso
              </button>

            </div>


            {/* LOGIN NORMAL */}

            {modoAluno === "login" && (

              <form
                onSubmit={loginAluno}
                className="login-form"
              >

                <div className="form-group">

                  <label>
                    Matrícula
                  </label>

                  <input
                    type="text"
                    value={matriculaLogin}
                    onChange={(event) =>
                      setMatriculaLogin(
                        event.target.value
                      )
                    }
                    placeholder="Digite sua matrícula"
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Senha
                  </label>

                  <input
                    type="password"
                    value={senhaLogin}
                    onChange={(event) =>
                      setSenhaLogin(
                        event.target.value
                      )
                    }
                    placeholder="Digite sua senha"
                    required
                  />

                </div>


                <button
                  className="login-principal"
                  type="submit"
                >
                  Entrar
                </button>

              </form>

            )}


            {/* PRIMEIRO ACESSO */}

            {modoAluno === "cadastro" && (

              <>

                {!alunoValidado ? (

                  <form
                    onSubmit={validarPrimeiroAcesso}
                    className="login-form"
                  >

                    <div className="form-group">

                      <label>
                        Matrícula
                      </label>

                      <input
                        type="text"
                        value={matricula}
                        onChange={(event) =>
                          setMatricula(
                            event.target.value
                          )
                        }
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
                          setEmail(
                            event.target.value
                          )
                        }
                        required
                      />

                    </div>


                    <div className="form-group">

                      <label>
                        Código fornecido pelo supervisor
                      </label>

                      <input
                        type="text"
                        value={codigo}
                        onChange={(event) =>
                          setCodigo(
                            event.target.value
                              .toUpperCase()
                          )
                        }
                        placeholder="PSI-XXXX-XXXX"
                        required
                      />

                    </div>


                    <button
                      className="login-principal"
                      type="submit"
                    >
                      Validar acesso
                    </button>

                  </form>

                ) : (

                  <form
                    onSubmit={ativarConta}
                    className="login-form"
                  >

                    <div className="acesso-validado">

                      <span>
                        Acesso localizado
                      </span>

                      <strong>
                        {alunoValidado.nome}
                      </strong>

                      <small>
                        Matrícula:{" "}
                        {alunoValidado.matricula}
                      </small>

                      <small>
                        Acesso autorizado até:{" "}
                        {formatarData(
                          alunoValidado.acessoAte
                        )}
                      </small>

                    </div>


                    <div className="form-group">

                      <label>
                        Criar senha
                      </label>

                      <input
                        type="password"
                        value={novaSenha}
                        onChange={(event) =>
                          setNovaSenha(
                            event.target.value
                          )
                        }
                        minLength="6"
                        required
                      />

                    </div>


                    <div className="form-group">

                      <label>
                        Confirmar senha
                      </label>

                      <input
                        type="password"
                        value={confirmarSenha}
                        onChange={(event) =>
                          setConfirmarSenha(
                            event.target.value
                          )
                        }
                        minLength="6"
                        required
                      />

                    </div>


                    <button
                      className="login-principal"
                      type="submit"
                    >
                      Ativar minha conta
                    </button>

                  </form>

                )}

              </>

            )}

          </div>

        )}


        {/* ============================
            SUPERVISOR
        ============================ */}

        {tipoAcesso === "supervisor" && (

          <div className="supervisor-em-breve">

            <div className="supervisor-icon">
              ◎
            </div>

            <h2>
              Acesso do Supervisor
            </h2>

            <p>
              O login institucional do supervisor
              será implementado posteriormente.
            </p>

          </div>

        )}


        {erro && (

          <div className="login-erro">
            {erro}
          </div>

        )}


        {mensagem && (

          <div className="login-sucesso">
            {mensagem}
          </div>

        )}

      </div>

    </div>
  );
}

export default Login;