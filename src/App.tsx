
import { ThemeProvider } from '@/components/theme-provider';
import MarketingPage from './components/MarketingPage';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <MarketingPage />
    </ThemeProvider>
  );
}


export default App;
