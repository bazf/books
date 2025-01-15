import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Label } from '../../../ui/label';
import { useTranslation } from '../../../../hooks/useTranslation';
import { Book } from '../../../../types';

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
                </div>
            </DialogContent>
        </Dialog>
    );
}