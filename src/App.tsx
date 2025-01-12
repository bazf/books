import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './components/providers';
import { BookReader } from './components/BookReader';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <BookReader />
      </Router>
    </ThemeProvider>
  );
}

export default App;