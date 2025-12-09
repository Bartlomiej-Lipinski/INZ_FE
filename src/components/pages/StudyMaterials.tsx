"use client";

import React, {useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Menu,
    MenuItem,
    Typography,
} from '@mui/material';
import {Edit2, FileText, Menu as MenuIcon, Notebook, Plus, Trash2} from 'lucide-react';
import {FileCategoryResponseDto, StoredFileResponseDto} from '@/lib/types/study-material';
import FileFilters from "@/components/pages/StudyMaterialsFilters";
import CategoriesManager from './CategoriesManager';
import FileList from './FileList';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import GroupMenu from "@/components/common/GroupMenu";
import {API_ROUTES} from '@/lib/api/api-routes-endpoints';
import {fetchWithAuth} from '@/lib/api/fetch-with-auth';

interface StudyMaterialsPageProps {
    files: StoredFileResponseDto[];
    categories: FileCategoryResponseDto[];
    userId: string;
    isAdmin: boolean;
    groupData?: { id: string; name: string; color?: string } | null;
    onFilesChange: (files: StoredFileResponseDto[]) => void;
    onCategoriesChange: (categories: FileCategoryResponseDto[]) => void;
    onRefreshMaterials?: (categoryId?: string, uploadedById?: string) => Promise<void>;
    onRefreshCategories?: () => Promise<void>;
}

export function StudyMaterialsPage({
                                       userId,
                                       files,
                                       categories,
                                       isAdmin,
                                       groupData,
                                       onFilesChange,
                                       onCategoriesChange,
                                   }: StudyMaterialsPageProps) {
    const groupColor = groupData?.color || '#9042fb';
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
    const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; fileId: string } | null>(null);
    const [categoryMenuAnchor, setCategoryMenuAnchor] = useState<{ el: HTMLElement; categoryId: string } | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadCategory, setUploadCategory] = useState<string>('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<FileCategoryResponseDto | null>(null);
    const [editCategoryName, setEditCategoryName] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadFile(file);
        }
    };

    const handleUploadFile = async () => {
        if (!uploadFile || !groupData?.id) return;

        try {
            if (!userId) {
                alert('Nie znaleziono danych użytkownika. Zaloguj się ponownie.');
                return;
            }
            const formData = new FormData();
            formData.append('file', uploadFile);
            const entityType = 'Material';
            const entityId = uploadCategory || groupData.id;
            if (uploadCategory) {
                formData.append('categoryId', uploadCategory);
            }
            const response = await fetchWithAuth(`${API_ROUTES.POST_FILE}?groupId=${groupData.id}&entityType=${entityType}&entityId=${entityId}`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Błąd podczas przesyłania pliku:', errorData);
                throw new Error(errorData.message || 'Błąd podczas przesyłania pliku');
            }

            const newFile: StoredFileResponseDto = await response.json();

            onFilesChange([newFile, ...files]);

            setUploadDialogOpen(false);
            setUploadFile(null);
            setUploadCategory('');

            alert('Plik został przesłany pomyślnie!');
        } catch (error) {
            console.error('Błąd podczas przesyłania pliku:', error);
            alert('Nie udało się przesłać pliku. Spróbuj ponownie.');
        }
    };

    const handleDownload = (file: StoredFileResponseDto) => {
        alert(`Pobieranie pliku: ${file.fileName}`);
    };

    const handleDeleteFile = async () => {
        if (!menuAnchor || !groupData?.id) return;

        const fileId = menuAnchor.fileId;
        const fileToDelete = files.find(f => f.id === fileId);
        if (!fileToDelete) {
            alert('Nie znaleziono pliku do usunięcia.');
            handleCloseMenu();
            return;
        }
        if (!isAdmin && fileToDelete.uploadedById !== userId) {
            alert('Nie masz uprawnień do usunięcia tego pliku.');
            handleCloseMenu();
            return;
        }
        if (!confirm(`Czy na pewno chcesz usunąć plik "${fileToDelete.fileName}"?`)) {
            handleCloseMenu();
            return;
        }
        try {
            const response = await fetchWithAuth(
                `${API_ROUTES.DELETE_FILE}?groupId=${groupData.id}&id=${fileId}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            );
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Błąd podczas usuwania pliku:', errorText);
                throw new Error(`Błąd ${response.status}: ${errorText}`);
            }
            onFilesChange(files.filter(f => f.id !== fileId));
            handleCloseMenu();
            alert('Plik został usunięty pomyślnie.');
        } catch (error) {
            console.error('Błąd podczas usuwania pliku:', error);
            alert(`Nie udało się usunąć pliku: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
            handleCloseMenu();
        }
    };

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, fileId: string) => {
        setMenuAnchor({el: event.currentTarget, fileId});
    };

    const handleCloseMenu = () => {
        setMenuAnchor(null);
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim() || !groupData?.id) return;

        try {
            const response = await fetchWithAuth(
                `${API_ROUTES.POST_CATEGORY}?groupId=${groupData.id}`,
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    credentials: 'include',
                    body: JSON.stringify({newCategoryName}),
                }
            );

            if (!response.ok) {
                throw new Error('Błąd podczas tworzenia kategorii');
            }

            const newCategory: FileCategoryResponseDto = await response.json();
            onCategoriesChange([...categories, newCategory]);
            setCategoryDialogOpen(false);
            setNewCategoryName('');
        } catch (error) {
            console.error('Błąd podczas dodawania kategorii:', error);
            alert('Nie udało się dodać kategorii. Spróbuj ponownie.');
        }
    };

    const handleOpenCategoryMenu = (event: React.MouseEvent<HTMLElement>, categoryId: string) => {
        setCategoryMenuAnchor({el: event.currentTarget, categoryId});
    };

    const handleCloseCategoryMenu = () => {
        setCategoryMenuAnchor(null);
    };

    const handleEditCategory = () => {
        const category = categories.find(c => c.id === categoryMenuAnchor?.categoryId);
        if (category) {
            setEditingCategory(category);
            setEditCategoryName(category.name);
            setEditCategoryDialogOpen(true);
            handleCloseCategoryMenu();
        }
    };

    const handleSaveEditCategory = () => {
        if (!editingCategory || !editCategoryName.trim()) return;

        onCategoriesChange(categories.map(c =>
            c.id === editingCategory.id
                ? {...c, name: editCategoryName}
                : c
        ));

        onFilesChange(files.map(f =>
            f.fileCategory?.id === editingCategory.id
                ? {...f, fileCategory: {...f.fileCategory, name: editCategoryName}}
                : f
        ));

        setEditCategoryDialogOpen(false);
        setEditingCategory(null);
        setEditCategoryName('');
    };

    const handleDeleteCategory = () => {
        if (!categoryMenuAnchor) return;

        const categoryId = categoryMenuAnchor.categoryId;
        const hasFiles = files.some(f => f.fileCategory?.id === categoryId);

        if (hasFiles) {
            alert('Nie można usunąć kategorii, która zawiera pliki. Najpierw usuń lub przenieś pliki.');
            handleCloseCategoryMenu();
            return;
        }

        onCategoriesChange(categories.filter(c => c.id !== categoryId));
        handleCloseCategoryMenu();
    };

    // Unikalni autorzy
    const uniqueAuthors = Array.from(new Set(files.map(f => f.uploadedByName || 'Nieznany')));

    // Filtrowanie
    const filteredFiles = files.filter(file => {
        const matchesSearch = file.fileName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || file.fileCategory?.id === selectedCategory;
        const matchesAuthor = selectedAuthor === 'all' || file.uploadedByName === selectedAuthor;
        return matchesSearch && matchesCategory && matchesAuthor;
    });

    const canDelete = (file: StoredFileResponseDto) => {
        return isAdmin || file.uploadedById === userId;
    };

    const hasFilters: boolean = !!(searchQuery || selectedCategory !== 'all' || selectedAuthor !== 'all');

    return (
        <Box sx={{width: '100%', minHeight: '100vh', px: {xs: 2, sm: 3}, py: {xs: 3, sm: 4}}}>
            <Box sx={{maxWidth: 1200, mx: 'auto'}}>
                {/* Nagłówek */}
                <Box sx={{display: 'flex', alignItems: 'center', mb: 4}}>
                    <IconButton
                        onClick={() => setDrawerOpen(true)}
                        sx={{
                            bgcolor: '#8D8C8C',
                            '&:hover': {bgcolor: '#666666'},
                            mr: 1,
                        }}
                    >
                        <MenuIcon/>
                    </IconButton>

                    <Typography
                        variant="h4"
                        sx={{
                            textAlign: 'center',
                            flex: 1,
                            fontWeight: 600,
                            fontSize: {xs: '1.75rem', sm: '2rem'},
                        }}
                    >
                        <Notebook size={32}/> {'Materiały Edukacyjne'}
                    </Typography>
                </Box>

                <GroupMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} groupId={groupData!.id}
                           groupName={groupData!.name} groupColor={groupData!.color || '#ffffff'}/>

                {/* Przycisk dodawania */}
                <Button
                    variant="contained"
                    startIcon={<Plus size={20}/>}
                    onClick={() => setUploadDialogOpen(true)}
                    fullWidth
                    sx={{
                        bgcolor: groupColor,
                        py: 1.5,
                        mb: 3,
                        '&:hover': {
                            bgcolor: groupColor,
                            opacity: 0.85,
                        },
                    }}
                >
                    Prześlij materiał
                </Button>

                {/* Filtry */}
                <FileFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    selectedAuthor={selectedAuthor}
                    onAuthorChange={setSelectedAuthor}
                    categories={categories}
                    uniqueAuthors={uniqueAuthors}
                    onAddCategory={() => setCategoryDialogOpen(true)}
                />

                {/* Zarządzanie kategoriami */}
                <CategoriesManager
                    categories={categories}
                    files={files}
                    isAdmin={isAdmin}
                    onOpenMenu={handleOpenCategoryMenu}
                />

                {/* Lista plików */}
                <FileList
                    files={filteredFiles}
                    hasFilters={hasFilters}
                    canDeleteFile={canDelete}
                    onOpenMenu={handleOpenMenu}
                    onDownload={handleDownload}
                    groupColor={groupColor}
                />

                {/* Menu pliku */}
                <Menu
                    anchorEl={menuAnchor?.el}
                    open={Boolean(menuAnchor)}
                    onClose={handleCloseMenu}
                >
                    <MenuItem onClick={handleDeleteFile} sx={{color: 'error.main'}}>
                        <Trash2 size={18} style={{marginRight: 8}}/>
                        Usuń
                    </MenuItem>
                </Menu>

                {/* Menu kategorii */}
                <Menu
                    anchorEl={categoryMenuAnchor?.el}
                    open={Boolean(categoryMenuAnchor)}
                    onClose={handleCloseCategoryMenu}
                >
                    <MenuItem onClick={handleEditCategory}>
                        <Edit2 size={18} style={{marginRight: 8}}/>
                        Edytuj
                    </MenuItem>
                    <MenuItem onClick={handleDeleteCategory} sx={{color: 'error.main'}}>
                        <Trash2 size={18} style={{marginRight: 8}}/>
                        Usuń
                    </MenuItem>
                </Menu>

                {/* Dialog przesyłania pliku */}
                <Dialog
                    open={uploadDialogOpen}
                    onClose={() => setUploadDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Prześlij materiał</DialogTitle>
                    <DialogContent>
                        <Box sx={{mt: 2}}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                startIcon={<FileText/>}
                                sx={{mb: 2, py: 2}}
                            >
                                {uploadFile ? uploadFile.name : 'Wybierz plik'}
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleFileSelect}
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                                />
                            </Button>

                            {uploadFile && (
                                <Alert severity="success" sx={{mb: 2}}>
                                    Wybrano: {uploadFile.name}
                                </Alert>
                            )}

                            <FormControl fullWidth>
                                <InputLabel>Kategoria (opcjonalna)</InputLabel>
                                <Select
                                    value={uploadCategory}
                                    label="Kategoria (opcjonalna)"
                                    onChange={(e) => setUploadCategory(e.target.value)}
                                >
                                    <MenuItem value="">Brak</MenuItem>
                                    {categories.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{px: 3, pb: 2}}>
                        <Button onClick={() => setUploadDialogOpen(false)}>Anuluj</Button>
                        <Button
                            variant="contained"
                            onClick={handleUploadFile}
                            disabled={!uploadFile}
                            sx={{bgcolor: groupColor, '&:hover': {bgcolor: groupColor, opacity: 0.85}}}
                        >
                            Prześlij
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog dodawania kategorii */}
                <Dialog
                    open={categoryDialogOpen}
                    onClose={() => setCategoryDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Dodaj kategorię</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Nazwa kategorii"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            sx={{mt: 2}}
                        />
                    </DialogContent>
                    <DialogActions sx={{px: 3, pb: 2}}>
                        <Button onClick={() => setCategoryDialogOpen(false)}>Anuluj</Button>
                        <Button
                            variant="contained"
                            onClick={handleAddCategory}
                            disabled={!newCategoryName.trim()}
                            sx={{bgcolor: groupColor, '&:hover': {bgcolor: groupColor, opacity: 0.85}}}
                        >
                            Dodaj
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog edycji kategorii */}
                <Dialog
                    open={editCategoryDialogOpen}
                    onClose={() => setEditCategoryDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Edytuj kategorię</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Nazwa kategorii"
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            sx={{mt: 2}}
                        />
                    </DialogContent>
                    <DialogActions sx={{px: 3, pb: 2}}>
                        <Button onClick={() => setEditCategoryDialogOpen(false)}>Anuluj</Button>
                        <Button
                            variant="contained"
                            onClick={handleSaveEditCategory}
                            disabled={!editCategoryName.trim()}
                            sx={{bgcolor: groupColor, '&:hover': {bgcolor: groupColor, opacity: 0.85}}}
                        >
                            Zapisz
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}
