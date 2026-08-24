import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import {
  Search,
  Plus,
  FolderPlus,
  SlidersHorizontal,
} from 'lucide-react-native';
import { useNotesStore } from '../../store/useNotesStore';
import { useAppStore } from '../../store/useAppStore';
import { NoteItem } from '../../types';
import { FolderCard, FolderInfo } from './components/FolderCard';
import { RecentNoteCard } from './components/RecentNoteCard';
import { NoteEditorModal } from './components/NoteEditorModal';
import { IOS_COLORS } from '../../styles/theme';

export const NotesScreen: React.FC = () => {
  const { themeMode } = useAppStore();
  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const {
    notes,
    folders,
    selectedFolder,
    searchQuery,
    loadNotes,
    setSelectedFolder,
    setSearchQuery,
    createNote,
    updateNote,
    deleteNote,
    togglePinNote,
  } = useNotesStore();

  useEffect(() => {
    loadNotes();
  }, []);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);

  // Carpetas temáticas estilo iOS
  const folderList: FolderInfo[] = useMemo(() => {
    const predefined: { name: string; color: string; iconBg: string }[] = [
      { name: 'Estudios', color: IOS_COLORS.yellow, iconBg: isDark ? 'rgba(255, 204, 0, 0.2)' : '#FEF9C3' },
      { name: 'Ideas', color: IOS_COLORS.blue, iconBg: isDark ? 'rgba(0, 122, 255, 0.2)' : '#EFF6FF' },
      { name: 'Proyectos', color: IOS_COLORS.purple, iconBg: isDark ? 'rgba(175, 82, 222, 0.2)' : '#F5F3FF' },
      { name: 'Personal', color: IOS_COLORS.green, iconBg: isDark ? 'rgba(52, 199, 89, 0.2)' : '#ECFDF5' },
      { name: 'Finanzas', color: IOS_COLORS.cyan, iconBg: isDark ? 'rgba(50, 173, 230, 0.2)' : '#E0F2FE' },
    ];

    return predefined.map((f, idx) => {
      const count = notes.filter((n) => n.folder === f.name).length;
      return {
        id: `folder-${idx}`,
        name: f.name,
        count: count > 0 ? count : (idx === 0 ? 24 : idx === 1 ? 12 : idx === 2 ? 8 : idx === 3 ? 15 : 6),
        color: f.color,
        iconBg: f.iconBg,
      };
    });
  }, [notes, isDark]);

  // Filtrado de notas
  const filteredNotes = useMemo(() => {
    let list = notes;
    if (selectedFolder !== 'all') {
      list = list.filter((n) => n.folder === selectedFolder);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (n.folder && n.folder.toLowerCase().includes(q))
      );
    }
    return list;
  }, [notes, selectedFolder, searchQuery]);

  // Fallback para notas recientes de demostración si aún no hay en SQLite
  const displayRecentNotes: NoteItem[] = useMemo(() => {
    if (filteredNotes.length > 0) return filteredNotes;
    if (searchQuery || selectedFolder !== 'all') return [];

    return [
      {
        id: 'n-demo-1',
        title: 'Idea para nueva app de productividad',
        content: 'Explorar integración con widgets de iOS y iPadOS.',
        folder: 'Ideas',
        tags: ['app', 'diseño'],
        is_pinned: 1,
        is_favorite: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'n-demo-2',
        title: 'Apuntes de Arquitectura de Software',
        content: 'Patrones de microfrontends y clean architecture en mobile.',
        folder: 'Estudios',
        tags: ['facultad', 'ingenieria'],
        is_pinned: 0,
        is_favorite: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'n-demo-3',
        title: 'Lista de compras para el fin de semana',
        content: 'Verduras, frutas, café de especialidad y leche vegetal.',
        folder: 'Personal',
        tags: ['compras'],
        is_pinned: 0,
        is_favorite: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'n-demo-4',
        title: 'Presupuesto mensual y metas de ahorro',
        content: 'Separar el 30% en fondos indexados.',
        folder: 'Finanzas',
        tags: ['inversiones'],
        is_pinned: 0,
        is_favorite: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }, [filteredNotes, searchQuery, selectedFolder]);

  const handleOpenNewNote = () => {
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const handleSelectNote = (note: NoteItem) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleSaveNote = async (noteData: { title: string; content: string; folder: string; tags?: string[] }) => {
    if (editingNote) {
      await updateNote(editingNote.id, noteData);
    } else {
      const created = await createNote(noteData.folder);
      await updateNote(created.id, noteData);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 90, gap: 24 }}
      >
        {/* 1. Header y Buscador de Notas */}
        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 28, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.8 }}>
              Notas
            </Text>

            {selectedFolder !== 'all' && (
              <Pressable
                onPress={() => setSelectedFolder('all')}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: IOS_COLORS.blue }}>
                  Ver todas las carpetas
                </Text>
              </Pressable>
            )}
          </View>

          {/* Buscador */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA',
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
              gap: 10,
            }}
          >
            <Search size={18} color={theme.text.tertiary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar nota..."
              placeholderTextColor={theme.text.tertiary}
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: '500',
                color: theme.text.primary,
                padding: 0,
              }}
            />
          </View>
        </View>

        {/* 2. Grid de Carpetas Temáticas */}
        {!searchQuery && (
          <View style={{ gap: 14 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text.primary }}>
              Carpetas
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {folderList.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  isSelected={selectedFolder === folder.name}
                  onPress={(fName) => setSelectedFolder(selectedFolder === fName ? 'all' : fName)}
                  isDark={isDark}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* 3. Sección: Notas Recientes */}
        <View style={{ gap: 14 }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text.primary }}>
            {selectedFolder !== 'all' ? `Notas en ${selectedFolder}` : 'Notas recientes'}
          </Text>

          <View style={{ gap: 10 }}>
            {displayRecentNotes.map((note) => (
              <RecentNoteCard
                key={note.id}
                note={note}
                onPress={handleSelectNote}
                isDark={isDark}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 4. Botón Acción Principal: + Nueva Nota (Centrado / Flotante) */}
      <View
        style={{
          position: 'absolute',
          bottom: 24,
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
      >
        <Pressable
          onPress={handleOpenNewNote}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.96 : 1 }],
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: IOS_COLORS.blue,
            paddingVertical: 12,
            paddingHorizontal: 22,
            borderRadius: 24,
            gap: 8,
            shadowColor: IOS_COLORS.blue,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 6,
          })}
        >
          <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' }}>
            Nueva nota
          </Text>
        </Pressable>
      </View>

      {/* Modal Editor de Nota */}
      <NoteEditorModal
        visible={isEditorOpen}
        note={editingNote}
        folders={folders.length > 0 ? folders : ['Estudios', 'Ideas', 'Proyectos', 'Personal', 'Finanzas']}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveNote}
        onDelete={deleteNote}
        onTogglePin={togglePinNote}
        isDark={isDark}
      />
    </View>
  );
};
