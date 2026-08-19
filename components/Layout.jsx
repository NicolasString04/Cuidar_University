import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="app">

      <aside className="sidebar">
        {/* menu */}
      </aside>

      <main className="main">

        <header className="header">
          {/* Cuidar + usuário */}
        </header>

        <Outlet />

      </main>

    </div>
  );
}

export default Layout;