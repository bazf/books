import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useBooks } from '../hooks/useBooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function BookList() {
  const { books, loading, addBook } = useBooks();
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [newBookTitle, setNewBookTitle] = React.useState('');

  if (loading) {
    return (
      <div className="p-4">
        Loading...
      </div>
    );
  }

  const handleAddBook = async () => {
    if (!newBookTitle.trim()) return;
    
    const newBook = {
      id: crypto.randomUUID(),
      title: newBookTitle.trim(),
      pages: [],
      currentPage: 0,
      language: 'en',
      createdAt: Date.now()
    };

    await addBook(newBook);
    setNewBookTitle('');
    setShowAddDialog(false);
    navigate(`/book/${newBook.id}`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Books</h1>
        <div className="space-x-2">
          <Button onClick={() => setShowAddDialog(true)}>
            Add Book
          </Button>
          <Button variant="outline" onClick={() => navigate('/settings')}>
            Settings
          </Button>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">No books yet</p>
          <Button onClick={() => setShowAddDialog(true)}>
            Add Your First Book
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {books.map((book) => (
            <div key={book.id} className="flex items-center justify-between border p-4 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold">{book.title}</h3>
                <p className="text-sm text-gray-500">
                  Pages: {book.pages.length}
                </p>
              </div>
              <div className="space-x-2">
                <Button onClick={() => navigate(`/book/${book.id}`)}>
                  Open
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Book Title</Label>
              <Input
                id="title"
                value={newBookTitle}
                onChange={(e) => setNewBookTitle(e.target.value)}
                placeholder="Enter book title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBook}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}