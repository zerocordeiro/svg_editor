# About
This is a SVG animation editor - currently work in progress as a side project, motivated by some recent work-related need to animate SVGs "manually" and the lack of a free online SVG editor 
The objective is to make an easy to use editor similar to video editing software, but focusing on SVGs and the use of CSS animation properties, which can be embedded in the SVG so that it can be imported in any compatible webpage or software.

The starting point for this is reading the SVG and distributing its elements properly, i.e. organizing groups and elements so that they can be displayed in a simple enough interface that the user will be able to "read" the SVG as if it is a multiplayered vector (which it is). 
Then, there should be a timeline and options that will let the user asign animations to each element of the SVG. To make this possible, when the SVG is loaded each group and element should be assinged an ID (if they don't have one already), and then they will be assigned animations.

This readme will be edited as work goes on. 

# Running project

npx i to install dependencies
npx vite (optional --host) to run server


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
