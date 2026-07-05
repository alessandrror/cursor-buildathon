---
name: ghostline-design
description: Use this skill to generate well-branded interfaces and assets for GhostLine (app anti-estafas telefónicas), either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, shadcn/ui + Tailwind v4 integration, and UI kit components.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

- **Visual style:** direction "Guardián Sereno" — verdes profundos (Pino #1E4D3B, Salvia #8FB09B), acento Arena #E8C98E, superficies Hueso/Paper, estados semánticos cálidos. Nunca azules/violetas tipo IA. Tono cálido, humano, tranquilizador; "tú"; sin emoji; íconos Lucide.
- **Tipografía:** Schibsted Grotesk (títulos), Hanken Grotesk (UI/cuerpo), Newsreader itálica (acentos).
- **Marca:** fantasma solo con ojos en `assets/` (positivo/negativo/contorno). No redibujar a mano.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out and create static HTML files for the user to view — link `styles.css` for tokens, or use the Tailwind config pattern shown in `components/*/*.card.html`.

If working on production code with **shadcn/ui + Tailwind v4**, use the `shadcn/` folder: drop in `globals.css` (light + dark themes), copy `components/ui/*`, and read the rules here to design as an expert in this brand.

If the user invokes this skill without other guidance, ask what they want to build, ask a few questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
