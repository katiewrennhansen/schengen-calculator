import { Calculator } from "./components/Calculator.tsx";
import { Disclaimer } from "./components/Disclaimer.tsx";
import { Header } from "./components/Header.tsx";

export default function App() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Header />

      <div className="mx-auto flex min-h-[calc(100vh-0px)] w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-10 sm:px-6">
        <Calculator />
        <Disclaimer />
      </div>
    </main>
  );
}
