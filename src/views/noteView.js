import Quill from "quill";
import 'quill/dist/quill.snow.css';
import { elements } from "../index.js";
import { createNote } from "./noteHandlers.js";
import { returnPinnedNotes, returnUnpinnedNotes, returnTrashedNotes } from "../Controller/Controller.js";

export function createNoteElement(note, isTrash = false) {
  const container = document.createElement("div");
  const noteTitle = document.createElement("div");
  const noteText = document.createElement("div");
  
  container.classList.add(isTrash ? "trash__card" : "notes__card");
  container.setAttribute("id", `${isTrash ? 'trash' : 'note'}__${note.id}`);
  
  noteTitle.textContent = note.title;
  noteTitle.classList.add(isTrash ? "trash__note-title" : "notes__note-title");
  
  noteText.innerHTML = note.text;
  noteText.classList.add(isTrash ? "trash__note-text" : "notes__note-text");
  
  container.append(noteTitle, noteText);
  
  requestAnimationFrame(() => {
    const rowHeight = 10;
    const contentHeight = container.getBoundingClientRect().height;
    container.style.gridRowEnd = `span ${Math.ceil(contentHeight / rowHeight)}`;
  });
  
  return { container, noteTitle, noteText };
}

export function initQuillEditor() {
  if (!window.quillInstance) {
    window.quillInstance = new Quill("#editor", {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }, {list: 'check'}],
        ],
      },
    });
  }
  return window.quillInstance;
} 

export async function displayNotes(notes) {
  try {
    if (!notes) {
      throw new Error("Notes array is required");
    }

    const pinnedNotes = returnPinnedNotes(notes);
    const unpinnedNotes = returnUnpinnedNotes(notes);

    if (pinnedNotes.length === 0) {
      elements.PINNED_HEADING.style.display = "none";
      elements.DIVIDER.style.display = "none";
    } else {
      elements.PINNED_HEADING.style.display = "block";
    }

    if (unpinnedNotes.length === 0) {
      elements.OTHERS_HEADING.style.display = "none";
      elements.DIVIDER.style.display = "none";
    } else {
      elements.OTHERS_HEADING.style.display = "block";
    }

    if (pinnedNotes.length > 0 && unpinnedNotes.length > 0) {
      elements.DIVIDER.style.display = "block";
    }
    elements.NOTES_PINNED.innerHTML = "";
    elements.NOTES_UNPINNED.innerHTML = "";

    const createNotePromises = [
      ...pinnedNotes.map((note) =>
        createNote(note, false, elements.NOTES_PINNED)
      ),
      ...unpinnedNotes.map((note) =>
        createNote(note, false, elements.NOTES_UNPINNED)
      ),
    ];

    await Promise.all(createNotePromises);
  } catch (error) {
    console.error("Failed to display notes:", error);
    throw error;
  }
}

export async function displayTrash(notes) {
  try {
    const trashedNotes = returnTrashedNotes(notes);
    elements.TRASH_NOTES.innerHTML = "";

    if (trashedNotes.length > 0) {
      for (const note of trashedNotes) {
        await createNote(note, true, elements.TRASH_NOTES);
      }
    } else {
      elements.TRASH_NOTES.innerHTML = "<p>Trash is empty</p>";
    }
  } catch (error) {
    console.error("Failed to display trash notes:", error);
  }
}