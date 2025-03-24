import { elements } from '../index.js';
import { reorderUpdate } from '../Controller/Controller.js';

export function addDragAndDropListeners(noteCard, note, container) {
  try {
    if (!noteCard || !note || !container) {
      throw new Error("Missing required parameters for drag and drop");
    }

    noteCard.setAttribute("draggable", true);

    noteCard.addEventListener("dragstart", (event) => {
      try {
        if (!note.id) {
          throw new Error("Note ID is required for drag operation");
        }
        event.dataTransfer.setData("text/plain", note.id);
        event.dataTransfer.effectAllowed = "move";
      } catch (error) {
        console.error('Failed to start drag operation:', error);
      }
    });

    noteCard.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    noteCard.addEventListener("drop", async (event) => {
      try {
        event.preventDefault();
        const draggedNoteId = event.dataTransfer.getData("text/plain");
        if (!draggedNoteId) {
          throw new Error("Dragged note ID not found");
        }

        const draggedNote = document.getElementById(`note__${draggedNoteId}`);
        if (!draggedNote) {
          throw new Error("Dragged note element not found");
        }

        if (draggedNote.parentElement === container) {
          container.insertBefore(draggedNote, noteCard.nextSibling);
          await saveReorder();
        }
      } catch (error) {
        console.error('Failed to handle drop operation:', error);
      }
    });
  } catch (error) {
    console.error('Failed to add drag and drop listeners:', error);
  }
}

export async function saveReorder() {
  try {
    let updatedArray = [];
    elements.NOTES_PINNED.childNodes.forEach((child) => {
      updatedArray.push(Number(child.id.slice(6)));
    });
    elements.NOTES_UNPINNED.childNodes.forEach((child) => {
      updatedArray.push(Number(child.id.slice(6)));
    });
    await reorderUpdate(updatedArray);
  } catch (error) {
    console.error('Failed to save note reorder:', error);
  }
}