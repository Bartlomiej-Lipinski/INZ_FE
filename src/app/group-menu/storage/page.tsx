'use client';

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {DownloadCloud, FolderPlus, Image as ImageIcon, Trash2, UploadCloud} from 'lucide-react';

type FolderItem = {
    id: string;
    name: string;
    createdAt: string;
};

type AttachedFile = {
    id: string;
    file: File;
    previewUrl?: string;
    uploadedAt: string;
};

type DbImageItem = {
    id: string;
    url: string;
    title?: string;
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const size = bytes / Math.pow(1024, index);
    return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const formatDateTime = (value: string) =>
    new Date(value).toLocaleString('pl-PL', {dateStyle: 'medium', timeStyle: 'short'});

export default function StorageTestPage() {
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
    const [folderName, setFolderName] = useState('');
    const [folderError, setFolderError] = useState<string | null>(null);

    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const [selectedImage, setSelectedImage] = useState<AttachedFile | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dbImages, setDbImages] = useState<DbImageItem[]>([]);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const previewUrlsRef = useRef<string[]>([]);

    const imageAttachments = useMemo(
        () => attachedFiles.filter((item) => Boolean(item.previewUrl)),
        [attachedFiles],
    );

    useEffect(() => {
        if (!selectedImage && imageAttachments.length > 0) {
            setSelectedImage(imageAttachments[0]);
            return;
        }
        if (selectedImage && !imageAttachments.some((image) => image.id === selectedImage.id)) {
            setSelectedImage(imageAttachments[0] ?? null);
        }
    }, [imageAttachments, selectedImage]);

    useEffect(() => () => {
        previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    }, []);

    const registerFiles = (files: FileList | File[]) => {
        const nextFiles = Array.from(files);
        if (!nextFiles.length) return;

        const prepared = nextFiles.map((file) => {
            const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
            if (previewUrl) {
                previewUrlsRef.current.push(previewUrl);
            }
            return {
                id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
                file,
                previewUrl,
                uploadedAt: new Date().toISOString(),
            };
        });

        setAttachedFiles((prev) => [...prepared, ...prev]);
    };

    const handleFilesFromInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.length) {
            registerFiles(event.target.files);
            event.target.value = '';
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(false);
        if (event.dataTransfer.files?.length) {
            registerFiles(event.dataTransfer.files);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(false);
    };

    const handleRemoveFile = (id: string) => {
        setAttachedFiles((prev) => {
            const target = prev.find((file) => file.id === id);
            if (target?.previewUrl) {
                URL.revokeObjectURL(target.previewUrl);
                previewUrlsRef.current = previewUrlsRef.current.filter(
                    (url) => url !== target.previewUrl,
                );
            }
            const updated = prev.filter((file) => file.id !== id);
            if (selectedImage?.id === id) {
                setSelectedImage(updated.find((file) => file.previewUrl) ?? null);
            }
            return updated;
        });
    };

    const handleClearFiles = () => {
        previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
        previewUrlsRef.current = [];
        setAttachedFiles([]);
        setSelectedImage(null);
    };

    const handleOpenFolderDialog = () => {
        setFolderError(null);
        setFolderName('');
        setIsFolderDialogOpen(true);
    };

    const handleFolderDialogClose = () => {
        setIsFolderDialogOpen(false);
        setFolderError(null);
    };

    const handleCreateFolder = () => {
        const trimmed = folderName.trim();
        if (!trimmed) {
            setFolderError('Podaj nazwę folderu.');
            return;
        }
        const isDuplicate = folders.some(
            (folder) => folder.name.toLowerCase() === trimmed.toLowerCase(),
        );
        if (isDuplicate) {
            setFolderError('Folder o tej nazwie już istnieje.');
            return;
        }

        setFolders((prev) => [
            {
                id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
                name: trimmed,
                createdAt: new Date().toISOString(),
            },
            ...prev,
        ]);
        setIsFolderDialogOpen(false);
        setFolderName('');
        setFolderError(null);
    };

    const handleRequestFolderDeletion = (id: string) => {
        console.info('TODO: usuń kategorię', id);
    };

    const handleFetchImagesFromDb = () => {
        console.info('TODO: pobierz zdjęcia z bazy');
        setDbImages((prev) => prev);
    };

    return (
        <Box sx={{maxWidth: 1200, mx: 'auto', py: 6, px: {xs: 2, md: 4}, display: 'flex', flexDirection: 'column', gap: 4}}>
            <Box>
                <Typography variant="h4" sx={{fontWeight: 600, mb: 1}}>
                    Test zasobów grupy
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Widok pomocny przy weryfikacji uploadu plików, katalogów i podglądu zdjęć.
                </Typography>
            </Box>

            <Paper
                sx={{
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: isDragOver ? 'primary.main' : 'divider',
                    bgcolor: isDragOver ? alpha('#9042fb', 0.04) : 'background.paper',
                    transition: 'border-color 150ms ease, background-color 150ms ease',
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <Stack spacing={2} alignItems="center" textAlign="center">
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            bgcolor: alpha('#9042fb', 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <UploadCloud size={28} />
                    </Box>
                    <Box>
                        <Typography variant="h6">Dodaj pliki do testów</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Przeciągnij elementy tutaj lub użyj przycisku, aby wybrać je z dysku.
                        </Typography>
                    </Box>
                    <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                        <Button
                            variant="contained"
                            startIcon={<UploadCloud size={18} />}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Wybierz pliki
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            disabled={!attachedFiles.length}
                            onClick={handleClearFiles}
                        >
                            Wyczyść listę
                        </Button>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                        Obsługiwane dowolne rozszerzenia, podgląd dotyczy wyłącznie plików graficznych.
                    </Typography>
                </Stack>
                <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    multiple
                    onChange={handleFilesFromInput}
                />
            </Paper>

            <Stack direction={{xs: 'column', lg: 'row'}} spacing={3}>
                <Paper sx={{flex: 1, p: 3, borderRadius: 3}}>
                    <Stack
                        direction={{xs: 'column', sm: 'row'}}
                        alignItems={{xs: 'flex-start', sm: 'center'}}
                        justifyContent="space-between"
                        gap={2}
                    >
                        <Box>
                            <Typography variant="h6">Struktura folderów</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Dodawaj foldery, aby odwzorować hierarchię w pamięci grupy.
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={<FolderPlus size={18} />}
                            onClick={handleOpenFolderDialog}
                        >
                            Nowa kategoria
                        </Button>
                    </Stack>

                    <Divider sx={{my: 3}} />

                    {folders.length ? (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {xs: 'repeat(auto-fit, minmax(220px, 1fr))'},
                                gap: 2,
                            }}
                        >
                            {folders.map((folder) => (
                                <Paper
                                    key={folder.id}
                                    variant="outlined"
                                    sx={{p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 0.5}}
                                >
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <FolderPlus size={18} />
                                            <Typography fontWeight={600}>{folder.name}</Typography>
                                        </Stack>
                                        <Tooltip title="Usuń kategorię (w przygotowaniu)">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    disabled
                                                    onClick={() => handleRequestFolderDeletion(folder.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary">
                                        Utworzono: {formatDateTime(folder.createdAt)}
                                    </Typography>
                                </Paper>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            Brak kategorii. Kliknij „Nowa kategoria”, aby rozpocząć.
                        </Typography>
                    )}
                </Paper>

                <Paper sx={{flex: 1, p: 3, borderRadius: 3}}>
                    <Stack
                        direction={{xs: 'column', sm: 'row'}}
                        alignItems={{xs: 'flex-start', sm: 'center'}}
                        justifyContent="space-between"
                        gap={2}
                        sx={{mb: 2}}
                    >
                        <Box>
                            <Typography variant="h6" sx={{mb: 0.5}}>
                                Wyświetlanie zdjęć
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Wybierz obraz z galerii poniżej, aby zobaczyć podgląd w powiększeniu.
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={<UploadCloud size={18} />}
                           
                        >
                            Wyslij 
                        </Button>
                    </Stack>

                    <Box
                        sx={{
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
                            minHeight: 280,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'background.default',
                            mb: 2,
                        }}
                    >
                        {selectedImage ? (
                            <Box sx={{width: '100%', height: '100%'}}>
                                <img
                                    src={selectedImage.previewUrl}
                                    alt={selectedImage.file.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        display: 'block',
                                    }}
                                />
                            </Box>
                        ) : (
                            <Stack spacing={1} alignItems="center" color="text.secondary">
                                <ImageIcon size={32} />
                                <Typography variant="body2">Brak wybranego zdjęcia</Typography>
                            </Stack>
                        )}
                    </Box>

                    {imageAttachments.length ? (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {xs: 'repeat(auto-fill, minmax(120px, 1fr))'},
                                gap: 1.5,
                            }}
                        >
                            {imageAttachments.map((image) => (
                                <Paper
                                    key={image.id}
                                    variant={selectedImage?.id === image.id ? 'elevation' : 'outlined'}
                                    elevation={selectedImage?.id === image.id ? 4 : 0}
                                    sx={{
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        borderColor:
                                            selectedImage?.id === image.id ? 'primary.main' : 'divider',
                                        outline:
                                            selectedImage?.id === image.id
                                                ? (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.3)}`
                                                : 'none',
                                    }}
                                    onClick={() => setSelectedImage(image)}
                                >
                                    <img
                                        src={image.previewUrl}
                                        alt={image.file.name}
                                        style={{width: '100%', height: 100, objectFit: 'cover', display: 'block'}}
                                    />
                                </Paper>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            Dodaj pliki graficzne, aby zobaczyć miniatury i podgląd.
                        </Typography>
                    )}
                </Paper>
            </Stack>

            <Paper sx={{p: 3, borderRadius: 3}}>
                <Stack
                    direction={{xs: 'column', sm: 'row'}}
                    alignItems={{xs: 'flex-start', sm: 'center'}}
                    justifyContent="space-between"
                    gap={2}
                    sx={{mb: 2}}
                >
                    <Box>
                        <Typography variant="h6" sx={{mb: 0.5}}>
                            Zdjęcia z bazy
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Po uruchomieniu integracji zobaczysz tutaj materiały z magazynu plików.
                        </Typography>
                    </Box>
                    <Tooltip title="Funkcja w przygotowaniu">
                        <span>
                            <Button
                                variant="contained"
                                startIcon={<DownloadCloud size={18} />}
                                disabled
                                onClick={handleFetchImagesFromDb}
                            >
                                Pobierz zdjęcia z bazy
                            </Button>
                        </span>
                    </Tooltip>
                </Stack>

                {dbImages.length ? (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {xs: 'repeat(auto-fill, minmax(160px, 1fr))'},
                            gap: 2,
                        }}
                    >
                        {dbImages.map((image) => (
                            <Paper key={image.id} variant="outlined" sx={{borderRadius: 2, overflow: 'hidden'}}>
                                <img
                                    src={image.url}
                                    alt={image.title ?? 'Zdjęcie z bazy'}
                                    style={{width: '100%', height: 140, objectFit: 'cover', display: 'block'}}
                                />
                                {image.title && (
                                    <Box sx={{p: 1}}>
                                        <Typography variant="caption" color="text.secondary" noWrap>
                                            {image.title}
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>
                        ))}
                    </Box>
                ) : (
                    <Box
                        sx={{
                            border: '1px dashed',
                            borderColor: 'divider',
                            borderRadius: 2,
                            py: 6,
                            px: 2,
                            textAlign: 'center',
                            color: 'text.secondary',
                        }}
                    >
                        <Typography variant="body2">
                            Brak zdjęć – przycisk pobierania jest jeszcze w przygotowaniu.
                        </Typography>
                    </Box>
                )}
            </Paper>

            <Paper sx={{p: 3, borderRadius: 3}}>
                <Typography variant="h6" sx={{mb: 2}}>
                    Lista załączonych plików ({attachedFiles.length})
                </Typography>
                {attachedFiles.length ? (
                    <List sx={{maxHeight: 360, overflowY: 'auto'}}>
                        {attachedFiles.map((file) => (
                            <React.Fragment key={file.id}>
                                <ListItem
                                    disablePadding
                                    secondaryAction={
                                        <Tooltip title="Usuń z listy">
                                            <IconButton edge="end" onClick={() => handleRemoveFile(file.id)}>
                                                <Trash2 size={18} />
                                            </IconButton>
                                        </Tooltip>
                                    }
                                >
                                    <ListItemText
                                        primary={file.file.name}
                                        secondary={`${file.file.type || 'brak typu'} • ${formatFileSize(file.file.size)} • dodano ${formatDateTime(file.uploadedAt)}`}
                                    />
                                </ListItem>
                                <Divider component="li" />
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        Nie wybrano jeszcze żadnych plików.
                    </Typography>
                )}
            </Paper>

            <Dialog open={isFolderDialogOpen} onClose={handleFolderDialogClose} fullWidth maxWidth="xs">
                <DialogTitle>Utwórz folder</DialogTitle>
                <DialogContent >
                    <TextField
                        autoFocus
                        label="Nazwa folderu"
                        value={folderName}
                        fullWidth
                        onChange={(event) => {
                            setFolderName(event.target.value);
                            if (folderError) setFolderError(null);
                        }}
                        error={Boolean(folderError)}
                        helperText={folderError ?? 'Nazwa powinna być unikalna w ramach testu.'}
                        sx={{mt: 2}}
                    />
                </DialogContent>
                <DialogActions >
                    <Button onClick={handleFolderDialogClose}>Anuluj</Button>
                    <Button variant="contained" onClick={handleCreateFolder}>
                        Utwórz
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}


