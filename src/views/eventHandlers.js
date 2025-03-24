import { elements } from "../index.js";
import {
  returnNotes,
  searchNotes,
  update,
  getNoteById,
  add,
  closeCreateNote,
  getLastNote,
} from "../Controller/Controller.js";
import {
  displayNotes,
  displayTrash,
} from "./noteView.js";
import { renderNote, createNote } from "./noteHandlers.js";

export function handleListView() {
  if (elements.NOTES_PINNED.classList.contains("grid-view")) {
    elements.NOTES_PINNED.classList.remove("grid-view");
  }

  if (elements.NOTES_UNPINNED.classList.contains("grid-view")) {
    elements.NOTES_UNPINNED.classList.remove("grid-view");
  }

  elements.NOTES_PINNED.classList.add("list-view");
  elements.NOTES_UNPINNED.classList.add("list-view");
  elements.NOTES_CONTAINER.style.alignItems = "center";
  elements.DIVIDER.style.width = "37.5rem";
}

export function handleGridView() {
  if (elements.NOTES_PINNED.classList.contains("list-view")) {
    elements.NOTES_PINNED.classList.remove("list-view");
  }

  if (elements.NOTES_UNPINNED.classList.contains("list-view")) {
    elements.NOTES_UNPINNED.classList.remove("list-view");
  }

  elements.NOTES_PINNED.classList.add("grid-view");
  elements.NOTES_UNPINNED.classList.add("grid-view");
  elements.NOTES_CONTAINER.style.alignItems = "normal";
  elements.DIVIDER.style.width = "96%";
}

export function openCreateNote(event) {
  event.preventDefault();
  elements.BTN_GROUP.style.display = "block";
  elements.TITLE.style.display = "block";
}

export function toggleSidebar() {
  const isOpen = elements.CONTENT.style.left === "0rem";

  elements.CONTENT.style.left = isOpen ? "-8rem" : "0rem";
  elements.NOTES.style.width = isOpen ? "85.85rem" : "76.75rem";
  elements.TRASH_VIEW.style.width = isOpen ? "85.85rem" : "76.75rem";
}

export async function clickNotesMenu() {
  try {
    const notes = await returnNotes();

    elements.NOTES.style.display = "flex";
    elements.TRASH_VIEW.style.display = "none";

    await displayNotes(notes);
  } catch (error) {
    console.error("Failed to display notes:", error);
  }
}

export async function clickTrashMenu() {
  try {
    const notes = await returnNotes();

    elements.NOTES.style.display = "none";
    elements.TRASH_VIEW.style.display = "flex";

    await displayTrash(notes);
  } catch (error) {
    console.error("Failed to display trash:", error);
  }
}

export async function searchNotesHandler(event) {
  const searchQuery = event.target.value.toLowerCase();
  let notes = {};
  try {
    if (searchQuery == "") {
      notes = await returnNotes();
    } else {
      notes = await searchNotes(searchQuery);
    }
  
    await displayNotes(notes);
  } catch (error) {
    console.error("Failed to display searched notes:", error);
  }
}

export async function closeButtonHandler() {
  try {
    const id = Number(elements.DIALOG.id.slice(7));
    const updatedTitle = elements.DIALOG_TITLE.textContent.trim();
    const updatedText = window.quillInstance.root.innerHTML;

    await update(id, updatedText, updatedTitle);
    const note = await getNoteById(id);
    renderNote(note);
    elements.DIALOG.close();
  } catch (error) {
    console.error("Failed to update note:", error);
  }
}

export function cancelButtonHandler(event) {
  event.preventDefault();
  closeCreateNote(elements.TITLE, elements.BTN_GROUP);
  event.target.reset();
}

export async function addNoteHandler(event) {
  event.preventDefault();

  try {
    const inputTitle = event.target["title"].value;
    const inputText = event.target["text"].value;
    const isAdded = await add(inputTitle, inputText);

    if (isAdded) {
      const { note, _ } = await getLastNote();
      await createNote(note, false, elements.NOTES_UNPINNED);
      closeCreateNote(elements.TITLE, elements.BTN_GROUP);
    } else {
      throw isAdded;
    }
  } catch (error) {
    console.error("Failed to create note:", error);
  } finally {
    event.target.reset();
  }
}

export function hideCreateNote(event) {
  if (!elements.CREATE_NOTE.contains(event.target)) {
    elements.BTN_GROUP.style.display = "none";
    elements.TITLE.style.display = "none";
    elements.CREATE_NOTE.reset();
  }
}
