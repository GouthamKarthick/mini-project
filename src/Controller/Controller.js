import { 
    addNote, bulkUpdate, deleteNote, getNote, getNotes, updateNote, 
    addNoteOffline, updateNoteOffline, deleteNoteOffline, getNotesOffline 
} from "../Model/Models";

export async function add(title, text) {
    if (!title || !text) {
        alert('Title and text fields are required');
        return;
    }

    if (navigator.onLine) {
        await addNote(title, text);
    } else {
        addNoteOffline(title, text);
    }
}

export async function getLastNote() {
    let notes;
    if (navigator.onLine) {
        notes = await getNotes();
    } else {
        notes = await getNotesOffline();
    }
    return { note: notes.at(-1), id: notes.length };
}

export async function returnNotes() {
    if (navigator.onLine) {
        return await getNotes();
    } else {
        return await getNotesOffline();
    }
}

export function returnPinnedNotes(notes) {
    return notes.filter((note) => note && note.isPinned && !note.isDeleted);
}

export function returnUnpinnedNotes(notes) {
    return notes.filter((note) => note && !note.isPinned && !note.isDeleted);
}

export function returnTrashedNotes(notes) {
    return notes.filter((note) => note && note.isDeleted);
}

export function closeCreateNote(title, buttonGroup) {
    title.style.display = 'none';
    buttonGroup.style.display = 'none';
}

export async function update(id, text, title) {
    if (navigator.onLine) {
        await updateNote({ id, title, text });
    } else {
        updateNoteOffline({ id, title, text, isSynced: false });
    }
    return await getNoteById(id);
}

async function getNoteById(id) {
    if (navigator.onLine) {
        return await getNote(id);
    } else {
        const notes = getNotesOffline();
        return notes.find(note => note.id === id);
    }
}

export async function searchNotes(searchQuery) {
    let notes = navigator.onLine ? await getNotes() : getNotesOffline();
    return notes.filter((note) => note && 
        ((note.title && note.title.toLowerCase().includes(searchQuery)) ||
        (note.text && note.text.toLowerCase().includes(searchQuery)))
    );
}

export async function moveToTrash(id) {
    if (navigator.onLine) {
        await updateNote({ id, isDeleted: true });
    } else {
        updateNoteOffline({ id, isDeleted: true, isSynced: false });
    }
}

export async function pinToggle(id, isPinned) {
    if (navigator.onLine) {
        await updateNote({ id, isPinned });
    } else {
        updateNoteOffline({ id, isPinned, isSynced: false });
    }
}

export async function permanentlyDelete(id) {
    if (navigator.onLine) {
        await deleteNote(id);
    } else {
        deleteNoteOffline(id);
    }
}

export async function returnFromTrash(id, isDeleted) {
    if (navigator.onLine) {
        await updateNote({ id, isDeleted });
    } else {
        updateNoteOffline({ id, isDeleted, isSynced: false });
    }
}

export async function reorderUpdate(reorderArray) {
    let notes;
    if (navigator.onLine) {
        notes = await getNotes();
    } else {
        notes = await getNotesOffline();
    }

    let updatedArray = reorderArray.map(index => notes.find(note => note.id === index));

    if (navigator.onLine) {
        await bulkUpdate(updatedArray);
    } else {
        updatedArray.forEach(note => updateNoteOffline(note));
    }
}

async function syncNotes() {
    if (!navigator.onLine) return;

    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    for (let note of notes) {
        if (!note.isSynced) {
            await addNote(note.title, note.text);
            note.isSynced = true;
        }
    }
    localStorage.clear();
}

window.addEventListener('online', syncNotes);