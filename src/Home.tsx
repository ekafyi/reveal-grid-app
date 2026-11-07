import { Sparkles } from "lucide-react";

export function Home() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "4rem auto",
        padding: "0 1.5rem",
        textAlign: "center",
      }}
    >
      <Sparkles size={40} style={{ color: "#7c3aed" }} aria-hidden />
      <h1>Reveal Grid App</h1>
      <p>
        Vite + React + TypeScript + TanStack Router (client-side) + Storybook + Vitest/RTL + Biome +
        lucide-react
      </p>
    </main>
  );
}
