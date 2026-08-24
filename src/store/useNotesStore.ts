import { create } from 'zustand';
import { NoteItem } from '../types';
import { notesRepo } from '../db/repositories/notesRepo';

interface NotesState {
  notes: NoteItem[];
  activeNoteId: string | null;
  selectedFolder: string;
  folders: string[];
  searchQuery: string;
  isLoading: boolean;

  loadNotes: () => Promise<void>;
  setActiveNoteId: (id: string | null) => void;
  setSelectedFolder: (folder: string) => void;
  setSearchQuery: (query: string) => void;

  createNote: (folder?: string) => Promise<NoteItem>;
  updateNote: (id: string, updates: Partial<NoteItem>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePinNote: (id: string) => Promise<void>;
  toggleFavoriteNote: (id: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  activeNoteId: null,
  selectedFolder: 'all',
  folders: ['General'],
  searchQuery: '',
  isLoading: false,

  loadNotes: async () => {
    set({ isLoading: true });
    try {
      const [notes, folders] = await Promise.all([notesRepo.getAll(), notesRepo.getFolders()]);
      const uniqueFolders = Array.from(new Set(['General', ...folders]));
      
      let activeId = get().activeNoteId;
      if ((!activeId || !notes.find(n => n.id === activeId)) && notes.length > 0) {
        activeId = notes[0].id;
      }

      set({
        notes,
        folders: uniqueFolders,
        activeNoteId: activeId,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  setActiveNoteId: (id) => set({ activeNoteId: id }),
  setSelectedFolder: (folder) => set({ selectedFolder: folder }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  createNote: async (folder = 'General') => {
    const newNote: Omit<NoteItem, 'created_at' | 'updated_at'> = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: 'Nueva Nota',
      content: '# Nueva Nota\n\nComienza a escribir aquí...',
      folder: folder === 'all' ? 'General' : folder,
      tags: [],
      is_pinned: 0,
      is_favorite: 0,
    };

    const created = await notesRepo.create(newNote);
    const notes = [created, ...get().notes];
    const folders = Array.from(new Set([...get().folders, created.folder]));
    set({ notes, folders, activeNoteId: created.id });
    return created;
  },

  updateNote: async (id, updates) => {
    await notesRepo.update(id, updates);
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n)),
    }));
  },

  deleteNote: async (id) => {
    await notesRepo.delete(id);
    const remaining = get().notes.filter((n) => n.id !== id);
    const nextActive = remaining.length > 0 ? remaining[0].id : null;
    set({ notes: remaining, activeNoteId: nextActive });
  },

  togglePinNote: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;
    const nextPinned = note.is_pinned === 1 ? 0 : 1;
    await notesRepo.update(id, { is_pinned: nextPinned });
    set((state) => ({
      notes: state.notes
        .map((n) => (n.id === id ? { ...n, is_pinned: nextPinned } : n))
        .sort((a, b) => b.is_pinned - a.is_pinned),
    }));
  },

  toggleFavoriteNote: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;
    const nextFav = note.is_favorite === 1 ? 0 : 1;
    await notesRepo.update(id, { is_favorite: nextFav });
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, is_favorite: nextFav } : n)),
    }));
  },
}));
