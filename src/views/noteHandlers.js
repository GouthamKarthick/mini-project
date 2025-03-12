import { createButton, createPinButton } from './noteButtons.js';
import { moveToTrash, permanentlyDelete, restoreNote, getNoteById } from '../Controller/Controller.js';
import { initQuillEditor } from './noteView.js';
import { elements } from '../index.js';
import { createNoteElement } from './noteView.js';
import { addDragAndDropListeners } from './dragAndDrop.js';

export function displayHeadAndDivider() {
  if (elements.NOTES_PINNED.children.length === 0) {
    elements.PINNED_HEADING.style.display = "none";
    elements.DIVIDER.style.display = "none";
  } else {
    elements.PINNED_HEADING.style.display = "block";
  }

  if (elements.NOTES_UNPINNED.children.length === 0) {
    elements.OTHERS_HEADING.style.display = "none";
    elements.DIVIDER.style.display = "none";
  } else {
    elements.OTHERS_HEADING.style.display = "block";
  }

  if (elements.NOTES_PINNED.children.length > 0 && elements.NOTES_UNPINNED.children.length > 0) {
    elements.DIVIDER.style.display = "block";
  }

  if (elements.TRASH_NOTES.children.length === 0) {
    elements.TRASH_NOTES.innerHTML = "<p>Trash is empty</p>";
  }
}

export async function createNote(note, isTrash = false, container = elements.NOTES_UNPINNED) {
  try {
    const { container: noteCard } = createNoteElement(note, isTrash);
    
    if (isTrash) {
      setupTrashNoteButtons(noteCard, note.id);
    } else {
      setupNoteClickHandler(noteCard, note.id);
      setupRegularNoteButtons(noteCard, note.id);
      addDragAndDropListeners(noteCard, note.id, container);
    }
    
    container.appendChild(noteCard);
    displayHeadAndDivider();
  } catch (error) {
    console.error('Failed to create note element:', error);
  }
}

export function setupNoteClickHandler(noteCard, id) {
  noteCard.addEventListener("click", async (event) => {
    try {
      if (event.target.closest('button')) return;
      
      const quillInstance = initQuillEditor();
      if (!quillInstance) throw new Error("Quill editor initialization failed");
      const note = await getNoteById(id);
      elements.DIALOG.id = `dialog_${id}`;
      elements.DIALOG_TITLE.textContent = note.title;
      quillInstance.root.innerHTML = note.text || '';
      elements.DIALOG.showModal();
    } catch (error) {
      console.error('Failed to open note:', error);
      alert('Failed to open note. Please try again.');
    }
  });
}

export function setupRegularNoteButtons(noteCard, id) {
  const deleteButton = createButton('fa-trash', 'notes__delete-btn', async () => {
    await moveToTrash(id);
    const note = await getNoteById(id);
    await createNote(note, true, elements.TRASH_NOTES);
    noteCard.remove();
  }, 'Delete');

  const pinButton = document.createElement("button");
  createPinButton(pinButton, noteCard, id);
  
  noteCard.append(pinButton, deleteButton);
}

export function setupTrashNoteButtons(noteCard, id) {
  const deleteButton = createButton('fa-trash', 'trash__delete-btn', async () => {
    await permanentlyDelete(id);
    noteCard.remove();
  }, 'Delete');

  const restoreButton = createButton('fa-arrow-rotate-left', 'trash__restore-btn', async () => {
    await restoreNote(id, false);
    noteCard.remove();
  }, 'Restore');
  
  noteCard.append(deleteButton, restoreButton);
}

export function renderNote(note) {
  try {
    const noteElement = document.querySelector(`#note__${note.id}`);
    if (!noteElement) {
      throw new Error(`Note element with ID note__${note.id} not found!`);
    }

    const titleElement = noteElement.querySelector(".notes__note-title");
    const textElement = noteElement.querySelector(".notes__note-text");

    if (!titleElement || !textElement) {
      throw new Error(`Title or text element not found in note ${note.id}`);
    }

    titleElement.textContent = note.title;
    textElement.innerHTML = note.text || "";
  } catch (error) {
    console.error("Failed to render note:", error);
  }
}