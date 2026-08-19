import { useState } from "react";
import { Link } from "react-router-dom";

function Usuario() {

  // =============================
  // USUÁRIO LOGADO
  // =============================

  const [usuario, setUsuario] = useState(() => {
    const dados = localStorage.getItem("usuarioLogado");

    return dados ? JSON.parse(dados) : null;
  });


  const [nome, setNome] = useState(
    usuario?.nome || ""
  );

  const [email, setEmail] = useState(
    usuario?.email || ""
  );


  // =============================
  // ALTERAÇÃO DE SENHA
  // =============================

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");


  // =============================
  // FORMATAR DATA
  // =============================

  function formatarData(data) {

    if (!data) {
      return "Não definida";
    }

    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;
  }


  // =============================
  // SALVAR DADOS
  // =============================

  function salvarDados(event) {

    event.preventDefault();

    setMensagem("");
    setErro("");

    if (!nome.trim()) {
      setErro("O nome não pode ficar vazio.");
      return;
    }

    if (!email.trim()) {
      setErro("O e-mail não pode ficar vazio.");
      return;
    }


    const usuarioAtualizado = {
      ...usuario,

      nome: nome.trim(),
      email: email.trim(),
    };


    // Atualiza usuário atualmente logado
    localStorage.setItem(
      "usuarioLogado",
      JSON.stringify(usuarioAtualizado)
    );


    // Se for aluno, atualiza também
    // o cadastro principal em "alunos"
    if (usuario.tipo === "aluno") {

      const dadosAlunos =
        localStorage.getItem("alunos");

      const alunos = dadosAlunos
        ? JSON.parse(dadosAlunos)
        : [];


      const alunosAtualizados = alunos.map(
        (aluno) => {

          if (aluno.id === usuario.id) {

            return {
              ...aluno,

              nome: nome.trim(),
              email: email.trim(),
            };
          }

          return aluno;
        }
      );


      localStorage.setItem(
        "alunos",
        JSON.stringify(alunosAtualizados)
      );
    }


    setUsuario(usuarioAtualizado);

    setMensagem(
      "Dados atualizados com sucesso."
    );
  }


  // =============================
  // ALTERAR SENHA
  // =============================

  function alterarSenha(event) {

    event.preventDefault();

    setMensagem("");
    setErro("");


    if (usuario.tipo !== "aluno") {

      setErro(
        "Alteração de senha do supervisor ainda não implementada."
      );

      return;
    }


    const dadosAlunos =
      localStorage.getItem("alunos");

    const alunos = dadosAlunos
      ? JSON.parse(dadosAlunos)
      : [];


    const aluno = alunos.find(
      (item) =>
        item.id === usuario.id
    );


    if (!aluno) {

      setErro(
        "Não foi possível localizar seu cadastro."
      );

      return;
    }


    if (aluno.senha !== senhaAtual) {

      setErro(
        "A senha atual está incorreta."
      );

      return;
    }


    if (novaSenha.length < 6) {

      setErro(
        "A nova senha precisa ter pelo menos 6 caracteres."
      );

      return;
    }


    if (novaSenha !== confirmarSenha) {

      setErro(
        "A confirmação da nova senha não confere."
      );

      return;
    }


    const alunosAtualizados = alunos.map(
      (item) => {

        if (item.id === usuario.id) {

          return {
            ...item,
            senha: novaSenha,
          };
        }

        return item;
      }
    );


    localStorage.setItem(
      "alunos",
      JSON.stringify(alunosAtualizados)
    );


    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");


    setMensagem(
      "Senha alterada com sucesso."
    );
  }


  // =============================
  // SEM LOGIN
  // =============================

  if (!usuario) {

    return (

      <div className="usuario-page">

        <div className="usuario-sem-login">

          <h1>
            Nenhum usuário logado
          </h1>

          <Link
            to="/login"
            className="login-principal"
          >
            Ir para o login
          </Link>

        </div>

      </div>

    );
  }


  return (

    <div className="usuario-page">


      {/* CABEÇALHO */}

      <div className="page-title">

        <div>

          <h1>
            Usuário
          </h1>

          <p>
            Consulte e atualize seus dados pessoais.
          </p>

        </div>


        <Link
          to="/dashboard"
          className="voltar-button"
        >
          ← Voltar
        </Link>

      </div>


      <div className="usuario-container">


        {/* DADOS DO USUÁRIO */}

        <section className="usuario-card">

          <div className="usuario-card-header">

            <div className="usuario-avatar">

              {usuario.nome
                ?.charAt(0)
                .toUpperCase()}

            </div>


            <div>

              <h2>
                {usuario.nome}
              </h2>

              <span>
                {usuario.tipo === "aluno"
                  ? "Aluno"
                  : "Supervisor"}
              </span>

            </div>

          </div>


          <form
            onSubmit={salvarDados}
            className="usuario-form"
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
                Matrícula
              </label>

              <input
                type="text"
                value={usuario.matricula || ""}
                disabled
              />

            </div>


            <div className="form-group">

              <label>
                Perfil
              </label>

              <input
                type="text"
                value={
                  usuario.tipo === "aluno"
                    ? "Aluno"
                    : "Supervisor"
                }
                disabled
              />

            </div>


            {usuario.tipo === "aluno" && (

              <div className="form-group">

                <label>
                  Acesso autorizado até
                </label>

                <input
                  type="text"
                  value={formatarData(
                    usuario.acessoAte
                  )}
                  disabled
                />

              </div>

            )}


            <button
              type="submit"
              className="cadastrar-button"
            >
              Salvar alterações
            </button>

          </form>

        </section>


        {/* SENHA */}

        <section className="usuario-card">

          <h2>
            Segurança
          </h2>

          <p className="usuario-card-descricao">
            Altere a senha utilizada para acessar sua conta.
          </p>


          <form
            onSubmit={alterarSenha}
            className="usuario-form"
          >


            <div className="form-group">

              <label>
                Senha atual
              </label>

              <input
                type="password"
                value={senhaAtual}
                onChange={(event) =>
                  setSenhaAtual(
                    event.target.value
                  )
                }
                required
              />

            </div>


            <div className="form-group">

              <label>
                Nova senha
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
                Confirmar nova senha
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
              type="submit"
              className="alterar-senha-button"
            >
              Alterar senha
            </button>

          </form>

        </section>

      </div>


      {/* MENSAGENS */}

      {mensagem && (

        <div className="usuario-mensagem sucesso">
          {mensagem}
        </div>

      )}


      {erro && (

        <div className="usuario-mensagem erro">
          {erro}
        </div>

      )}

    </div>

  );
}

export default Usuario;