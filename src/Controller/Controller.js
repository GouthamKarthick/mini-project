import {
  addNote,
  bulkUpdate,
  deleteNote,
  getNote,
  getNotes,
  updateNote,
  addNoteOffline,
  updateNoteOffline,
  deleteNoteOffline,
  getNotesOffline,
} from "../Model/Models";

export async function add(title, text) {
  try {
    if (!title || !text) {
      throw new Error("Title and text fields are required");
    }

    else {
      if (navigator.onLine) {
        await addNote(title, text);
      } else {
        addNoteOffline(title, text);
      }
    }

    return true;
  } catch (error) {
    return error;
  }
}

export async function getLastNote() {
  try {
    let notes = {};

    if (navigator.onLine) {
      notes = await getNotes();
    } else {
      notes = await getNotesOffline();
    }

    if (!notes || notes.length === 0) {
      throw new Error("No notes found");
    }

    return { note: notes.at(-1), id: notes.length };
  } catch (error) {
    console.error('Failed to get last note:', error);
  }
}

export async function returnNotes() {
  try {
    if (navigator.onLine) {
      return await getNotes();
    } else {
      return await getNotesOffline();
    }
  } catch (error) {
    console.error('Failed to fetch notes:', error);
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
  title.style.display = "none";
  buttonGroup.style.display = "none";
}

export async function update(id, text, title) {
  try {
    if (navigator.onLine) {
      await updateNote({ id, title, text });
    } else {
      updateNoteOffline({ id, title, text, isSynced: false });
    }
  } catch (error) {
    console.error('Failed to update note:', error);
  }
}

export async function getNoteById(id) {
  try {
    let note;
    if (!id) {
      throw new Error("Note ID is required");
    }

    if (navigator.onLine) {
      note = await getNote(id);
    } else {
      const notes = await getNotesOffline();
      note = notes.find((note) => note.id === id);
      if (!note) {
        throw new Error(`Note with ID ${id} not found`);
      }
    }
    return note;
  } catch (error) {
    console.error('Failed to get note by ID:', error);
  }
}

export async function searchNotes(searchQuery) {
  let notes = navigator.onLine ? await getNotes() : getNotesOffline();
  return notes.filter(
    (note) =>
      note &&
      ((note.title && note.title.toLowerCase().includes(searchQuery)) ||
        (note.text && note.text.toLowerCase().includes(searchQuery)))
  );
}

export async function moveToTrash(id) {
  try {
    if (navigator.onLine) {
      await updateNote({ id, isDeleted: true });
    } else {
      updateNoteOffline({ id, isDeleted: true, isSynced: false });
    }
  } catch (error) {
    console.error('Failed to move to trash:', error);
  }
}

export async function pinToggle(id, isPinned) {
  try {
    if (navigator.onLine) {
      await updateNote({ id, isPinned });
    } else {
      updateNoteOffline({ id, isPinned, isSynced: false });
    }
  } catch (error) {
    console.error('Failed to pin the note:', error);
  }
}

export async function permanentlyDelete(id) {
  try {
    if (navigator.onLine) {
      await deleteNote(id);
    } else {
      deleteNoteOffline(id);
    }
  } catch (error) {
    console.error('Failed to permanently delete the note:', error);
  }
}

export async function restoreNote(id, isDeleted) {
  try {
    if (navigator.onLine) {
      await updateNote({ id, isDeleted });
    } else {
      updateNoteOffline({ id, isDeleted, isSynced: false });
    }
  } catch (error) {
    console.error('Failed to restore the note:', error);
  }
}

export async function reorderUpdate(reorderArray) {
  try {
    let notes = [];

  if (navigator.onLine) {
    notes = await getNotes();
  } else {
    notes = await getNotesOffline();
  }

  let updatedArray = reorderArray.map((index) =>
    notes.find((note) => note.id === index)
  );

  if (navigator.onLine) {
    await bulkUpdate(updatedArray);
  } else {
      updatedArray.forEach((note) => updateNoteOffline(note));
    }
  } catch (error) {
    console.error('Failed to update the order of the notes:', error);
  }
}

export async function syncNotes() {
  try {
    if (!navigator.onLine) return;

    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    const syncPromises = notes
      .filter(note => !note.isSynced)
      .map(async note => {
        try {
          await addNote(note.title, note.text);
          note.isSynced = true;
        } catch (error) {
          console.error(`Failed to sync note ${note.id}:`, error);
        }
      });

    await Promise.all(syncPromises);
    localStorage.clear();
  } catch (error) {
    console.error('Failed to sync notes:', error);
  }
}

window.addEventListener("online", syncNotes);