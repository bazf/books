// src/components/BookReader/components/dialogs/AddBookmarkDialog.tsx
import React, { useState } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter 
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { useTranslation } from '../../../../hooks/useTranslation';

interface AddBookmarkDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onBookmarkAdd: (title: string, note?: string) => void;
}

export function AddBookmarkDialog({
    open,
    onOpenChange,
    onBookmarkAdd
}: AddBookmarkDialogProps) {
    const { t } = useTranslation();
    const [bookmarkTitle, setBookmarkTitle] = useState('');
    const [bookmarkNote, setBookmarkNote] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = () => {
        if (!bookmarkTitle.trim()) {
            setError(t('required'));
            return;
        }

        onBookmarkAdd(bookmarkTitle.trim(), bookmarkNote.trim());
        handleClose();
    };

    const handleClose = () => {
        setBookmarkTitle('');
        setBookmarkNote('');
        setError(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('addBookmark')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="bookmarkTitle">
                            {t('bookmarkTitle')}
                            <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            id="bookmarkTitle"
                            value={bookmarkTitle}
                            onChange={(e) => {
                                setBookmarkTitle(e.target.value);
                                if (error) setError(null);
                            }}
                            placeholder={t('bookmarkTitlePlaceholder')}
                            autoFocus
                            aria-required="true"
                            aria-invalid={error ? "true" : undefined}
                            aria-describedby={error ? "bookmarkTitle-error" : undefined}
                            error={error}
                        />
                        {error && (
                            <p 
                                id="bookmarkTitle-error" 
                                className="text-sm text-red-500 mt-1"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="bookmarkNote">
                            {t('bookmarkNote')}
                        </Label>
                        <Textarea
                            id="bookmarkNote"
                            value={bookmarkNote}
                            onChange={(e) => setBookmarkNote(e.target.value)}
                            placeholder={t('bookmarkNotePlaceholder')}
                            aria-label={t('bookmarkNote')}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button 
                        variant="outline" 
                        onClick={handleClose}
                        aria-label={t('cancel')}
                    >
                        {t('cancel')}
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        aria-label={t('save')}
                    >
                        {t('save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}