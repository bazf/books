import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Label } from '../../../ui/label';
import { Button } from '../../../ui/button';
import { useTranslation } from '../../../../hooks/useTranslation';
import { Book } from '../../../../types';
import { exportBookToJson } from '../../../../lib/utils';
import { Download } from 'lucide-react';

interface BookSettingsDialogProps {
    book: Book;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSettingsChange: (settings: Book['settings']) => void;
}

interface Language {
    code: string;
    name: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
    { code: '', name: 'None' },
    { code: 'ukrainian', name: 'Ukrainian' },
    { code: 'spanish', name: 'Spanish' },
    { code: 'french', name: 'French' },
    { code: 'german', name: 'German' },
    { code: 'italian', name: 'Italian' },
    { code: 'portuguese', name: 'Portuguese' },
    { code: 'polish', name: 'Polish' },
];

export function BookSettingsDialog({
    book,
    open,
    onOpenChange,
    onSettingsChange
}: BookSettingsDialogProps) {
    const { t } = useTranslation();

    const handleLanguageChange = (languageCode: string) => {
        onSettingsChange({
            ...book.settings,
            translationLanguage: languageCode || null
        });
    };

    const handleExportBook = () => {
        const bookJson = exportBookToJson(book);
        const blob = new Blob([bookJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${book.title}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('bookSettings')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="translation-language">
                            {t('translationLanguage')}
                        </Label>
                        <Select
                            value={book.settings?.translationLanguage || ''}
                            onValueChange={handleLanguageChange}
                        >
                            <SelectTrigger id="translation-language">
                                <SelectValue placeholder={t('selectLanguage')} />
                            </SelectTrigger>
                            <SelectContent>
                                {SUPPORTED_LANGUAGES.map(lang => (
                                    <SelectItem key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="pt-4">
                        <Button
                            variant="outline"
                            onClick={handleExportBook}
                            className="w-full"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export Book
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}