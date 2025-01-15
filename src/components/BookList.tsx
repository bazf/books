import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useBooks } from '../hooks/useBooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Trash2 } from 'lucide-react';

export function BookList() {
    const { books, loading, addBook, deleteBook } = useBooks();
    const navigate = useNavigate();
    const [showAddDialog, setShowAddDialog] = React.useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const [bookToDelete, setBookToDelete] = React.useState<string | null>(null);
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

    const handleDeleteConfirm = async () => {
        if (bookToDelete) {
            await deleteBook(bookToDelete);
            setBookToDelete(null);
            setShowDeleteDialog(false);
        }
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setBookToDelete(id);
        setShowDeleteDialog(true);
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
                        <div
                            key={book.id}
                            className="relative flex items-center justify-between border p-4 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 cursor-pointer"
                            onClick={() => navigate(`/book/${book.id}`)}
                        >
                            <div>
                                <h3 className="text-lg font-semibold">{book.title}</h3>
                                <p className="text-sm text-gray-500">
                                    Pages: {book.pages.length}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 hover:text-red-500"
                                onClick={(e) => handleDeleteClick(book.id, e)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
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

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Book</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this book? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}