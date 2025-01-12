import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BookList } from './components/BookList'
import { BookReader } from './components/BookReader'
import { Settings } from './components/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BookList />} />
        <Route path="/book/:id" element={<BookReader />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  )
}