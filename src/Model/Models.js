import { SERVER_URL } from '../../mocks/handlers';

export async function addNote(title, text) {
    try {
        const response = await fetch(`${SERVER_URL}/notes`, {
            method: 'POST',
            body: JSON.stringify({
                'title': title,
                'text': text
            })
        })
        if (!response.ok) {
            throw new Error("Unable to create note")
        }
    } catch (error) {
        console.log(error);
    }
}

export async function getNotes() {
    try {
        const response = await fetch(`${SERVER_URL}/notes`);
        const notes = await response.json();
        return notes.notes;
    } catch(error) {
        console.log(error);
    }
}

export async function getNote(id) {
    try {
        const response = await fetch(`${SERVER_URL}/notes/${id}`);
        const note = await response.json();
        return note;
    } catch(error) {
        console.log(error);
    }
}

export async function updateNote(note) {
    try {
        const response = await fetch(`${SERVER_URL}/notes/${note.id}`, {
            method: 'PATCH',
            body: JSON.stringify(note)
        })
        if (!response.ok) {
            throw new Error("Unable to update note");
        }
    }
    catch (error) {
        console.log(error);
    }
}

export async function deleteNote(id) {
    try {
        const response = await fetch(`${SERVER_URL}/notes/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) {
            throw new Error("Unable to delete the note");
        }
    }
    catch (error) {
        console.error(error);
    }
}

export async function bulkUpdate(array) {
    try {
        const response = await fetch(`${SERVER_URL}/notes`, {
            method:'PATCH',
            body: JSON.stringify(array)
        });
        if (!response.ok) {
            throw new Error("Unable to update the reordered array");
        }
    }
    catch (error) {
        console.error(error);
    }
}

export function addNoteOffline(title, text) {
    const note = { id: Date.now(), title, text, isSynced: false, isDeleted: false, isPinned: false };
    let offlineNotes = JSON.parse(localStorage.getItem('notes')) || [];
    offlineNotes.push(note);
    localStorage.setItem('notes', JSON.stringify(offlineNotes));
}

export function getNotesOffline() {
    return JSON.parse(localStorage.getItem('notes')) || [];
}

export function updateNoteOffline(updatedNote) {
    let offlineNotes = JSON.parse(localStorage.getItem('notes')) || [];
    offlineNotes = offlineNotes.map(note => note.id === updatedNote.id ? {...note, ...updatedNote} : note);
    localStorage.setItem('notes', JSON.stringify(offlineNotes));
}

export function deleteNoteOffline(id) {
    let offlineNotes = JSON.parse(localStorage.getItem('notes')) || [];
    offlineNotes = offlineNotes.filter(note => note.id !== id);
    localStorage.setItem('notes', JSON.stringify(offlineNotes));
}