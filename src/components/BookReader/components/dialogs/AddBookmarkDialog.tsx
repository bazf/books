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

    const handleSubmit = () => {
        onBookmarkAdd(bookmarkTitle, bookmarkNote);
        setBookmarkTitle('');
        setBookmarkNote('');
    };

    const handleClose = () => {
        setBookmarkTitle('');
        setBookmarkNote('');
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
                        <Label htmlFor="bookmarkTitle">{t('bookmarkTitle')}</Label>
                        <Input
                            id="bookmarkTitle"
                            value={bookmarkTitle}
                            onChange={(e) => setBookmarkTitle(e.target.value)}
                            placeholder={t('bookmarkTitlePlaceholder')}
                            autoFocus
                        />
                    </div>
                    <div>
                        <Label htmlFor="bookmarkNote">{t('bookmarkNote')}</Label>
                        <Textarea
                            id="bookmarkNote"
                            value={bookmarkNote}
                            onChange={(e) => setBookmarkNote(e.target.value)}
                            placeholder={t('bookmarkNotePlaceholder')}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleSubmit}>
                        {t('save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}