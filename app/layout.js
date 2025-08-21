// app/layout.js
import "../styles/globals.css";
import Sidebar from "../components/Sidebar";

export const metadata = {
  title: "KT GIGA FMS",
  description: "Fleet management front-end",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <div style={{ display: "flex", height: "100vh" }}>
          <aside >
            <Sidebar />
          </aside>
          <main style={{ flex: "1", overflow: "auto", display: "flex", flexDirection: "column" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
