import "../App.css";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Dashboard() {
  const navigate = useNavigate();

  const [modalSairAberto, setModalSairAberto] =
    useState(false);

  const usuarioLogado = JSON.parse(
    localStorage.getItem("usuarioLogado")
  );

  // ==========================================
  // LOGOUT
  // ==========================================

  function confirmarSaida() {
    // Remove somente a sessão atual.
    // Pessoas, atendimentos e alunos permanecem salvos.
    localStorage.removeItem("usuarioLogado");

    navigate("/login");
  }

  return (
    <div className="app">

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside className="sidebar">

        {/* LOGO */}

        <div className="logo">
          Ψ
        </div>


        {/* NAVEGAÇÃO */}

        <nav className="sidebar-nav">

          {/* DASHBOARD */}

          <Link
            to="/dashboard"
            className="sidebar-item ativo"
            aria-label="Dashboard"
          >

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M3 11.5L12 4l9 7.5" />
              <path d="M5 10.5V20h14v-9.5" />
            </svg>

            <span className="sidebar-tooltip">
              Dashboard
            </span>

          </Link>


          {/* ATENDIMENTOS */}

          <Link
            to="/atendimentos"
            className="sidebar-item"
            aria-label="Atendimentos"
          >

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <rect
                x="5"
                y="4"
                width="14"
                height="16"
                rx="2"
              />

              <path d="M9 8h6" />
              <path d="M9 12h6" />
              <path d="M9 16h4" />
            </svg>

            <span className="sidebar-tooltip">
              Atendimentos
            </span>

          </Link>


          {/* PESSOAS */}

          <Link
            to="/pessoas"
            className="sidebar-item"
            aria-label="Pessoas"
          >

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="9"
                cy="8"
                r="3"
              />

              <circle
                cx="17"
                cy="9"
                r="2.5"
              />

              <path d="M3.5 19c.5-4 2.5-6 5.5-6s5 2 5.5 6" />

              <path d="M14 14c3-.4 5.5 1.3 6.5 4.5" />
            </svg>

            <span className="sidebar-tooltip">
              Pessoas
            </span>

          </Link>


          {/* USUÁRIO */}

          <Link
            to="/usuario"
            className="sidebar-item"
            aria-label="Usuário"
          >

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="8"
                r="4"
              />

              <path d="M4 21c.7-4.5 3.5-7 8-7s7.3 2.5 8 7" />
            </svg>

            <span className="sidebar-tooltip">
              Usuário
            </span>

          </Link>

        </nav>


        {/* =====================================
            SAIR
        ===================================== */}

        <div className="sidebar-footer">

          <button
            type="button"
            className="sidebar-item sidebar-sair"
            aria-label="Sair"
            onClick={() =>
              setModalSairAberto(true)
            }
          >

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M10 4H5v16h5" />

              <path d="M14 8l4 4-4 4" />

              <path d="M18 12H9" />
            </svg>

            <span className="sidebar-tooltip">
              Sair
            </span>

          </button>

        </div>

      </aside>


      {/* =====================================
          ÁREA PRINCIPAL
      ===================================== */}

      <main className="main">

        <header className="header">

          <div>

            <h2>
              Cuidar
            </h2>

            <span>
              Atendimento Psicológico
            </span>

          </div>


          {/* USUÁRIO LOGADO */}

          <div className="user">

            <div className="user-info">

              <strong>
                {usuarioLogado?.nome || "Usuário"}
              </strong>

              <span>
                {usuarioLogado?.tipo === "aluno"
                  ? "Aluno"
                  : "Supervisor"}
              </span>

            </div>


            <div className="user-avatar">

              {usuarioLogado?.nome
                ?.charAt(0)
                .toUpperCase() || "U"}

            </div>

          </div>

        </header>


        {/* =====================================
            CONTEÚDO
        ===================================== */}

        <section className="content">

          {/* ÍCONE DE FUNDO */}

          <div className="background-icon">
            Ψ
          </div>


          <h1>
            Bem-vindo(a),{" "}
            {usuarioLogado?.nome?.split(" ")[0] ||
              "Usuário"}
          </h1>


          <p>
            Acesse rapidamente as principais
            funcionalidades do sistema.
          </p>


          {/* CARDS */}

          <div className="cards">

            <Link
              to="/atendimentos"
              className="card green"
            >

              <span className="icon">
                ▤
              </span>

              <strong>
                Registros de Atendimentos
              </strong>

            </Link>


            <Link
              to="/usuario"
              className="card blue"
            >

              <span className="icon">
                ●
              </span>

              <strong>
                Usuário
              </strong>

            </Link>


            <Link
              to="/pessoas"
              className="card purple"
            >

              <span className="icon">
                ♟
              </span>

              <strong>
                Pessoas
              </strong>

            </Link>

          </div>

        </section>

      </main>


      {/* =====================================
          MODAL DE SAÍDA
      ===================================== */}

      {modalSairAberto && (

        <div
          className="logout-modal-overlay"
          onClick={() =>
            setModalSairAberto(false)
          }
        >

          <div
            className="logout-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CABEÇALHO */}

            <div className="logout-modal-header">

              <div>

                <span className="logout-modal-icon">

                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M10 4H5v16h5" />
                    <path d="M14 8l4 4-4 4" />
                    <path d="M18 12H9" />
                  </svg>

                </span>


                <div>

                  <h2>
                    Sair da conta
                  </h2>

                  <span>
                    Encerrar sessão
                  </span>

                </div>

              </div>


              <button
                type="button"
                className="logout-modal-fechar"
                onClick={() =>
                  setModalSairAberto(false)
                }
              >
                ×
              </button>

            </div>


            {/* CONTEÚDO */}

            <div className="logout-modal-conteudo">

              <p>
                Você está conectado como{" "}
                <strong>
                  {usuarioLogado?.nome || "Usuário"}
                </strong>
                .
              </p>


              <p className="logout-modal-pergunta">
                Deseja realmente sair do sistema?
              </p>

            </div>


            {/* BOTÕES */}

            <div className="logout-modal-acoes">

              <button
                type="button"
                className="logout-cancelar"
                onClick={() =>
                  setModalSairAberto(false)
                }
              >
                Cancelar
              </button>


              <button
                type="button"
                className="logout-confirmar"
                onClick={confirmarSaida}
              >
                Sair
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Dashboard;