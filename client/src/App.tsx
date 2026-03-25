import AppRoutes from "./routes";
import { ThemeProvider } from "./context/theme-provider";
import Chatbot from "./components/Chatbot";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AppRoutes />
      <Chatbot />
    </ThemeProvider>
  );
}

export default App;