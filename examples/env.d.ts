declare module "*.css";
declare module "*?inline" { const url: string; export default url; }
declare module "*?raw" { const text: string; export default text; }
