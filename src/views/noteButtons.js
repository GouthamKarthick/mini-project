import { elements } from "../index.js";
import { pinToggle, getNoteById } from "../Controller/Controller.js";
import { addDragAndDropListeners } from "./dragAndDrop.js";
import { displayHeadAndDivider } from "./noteHandlers.js";

export function createButton(icon, className, clickHandler, title) {
  const button = document.createElement("button");
  button.innerHTML = `<i class="fa-solid ${icon}"></i>`;
  button.classList.add(className);
  button.setAttribute('title', title);

  button.addEventListener("click", async (event) => {
    try {
      event?.stopPropagation();
        await clickHandler();
        displayHeadAndDivider();
      } catch (error) {
        console.error(`Failed to handle ${className} action:`, error);
      }
    });
    return button;
  }
  
  export async function createPinButton(pinButton, noteCard, id) {
    try {
      const note = await getNoteById(id);
      pinButton.classList.add("notes__pin-btn");
      pinButton.innerHTML = note.isPinned
        ? '<i class="fa-solid fa-thumbtack-slash"></i>'
        : '<i class="fa-solid fa-thumbtack"></i>';

      pinButton.setAttribute('title', note.isPinned ? 'Unpin' : 'Pin');
  
      pinButton.addEventListener("click", async function (event) {
        try {
          event.stopPropagation();
          const isNowPinned = !note.isPinned;
          const targetView = isNowPinned ? elements.NOTES_PINNED : elements.NOTES_UNPINNED;
  
          await pinToggle(note.id, isNowPinned);
          note.isPinned = isNowPinned;
  
          pinButton.innerHTML = isNowPinned
            ? '<i class="fa-solid fa-thumbtack-slash"></i>'
            : '<i class="fa-solid fa-thumbtack"></i>';

          pinButton.setAttribute('title', isNowPinned ? 'Unpin' : 'Pin');
  
          noteCard.remove();

          targetView.appendChild(noteCard);
          displayHeadAndDivider();
          addDragAndDropListeners(noteCard, note, targetView);
        } catch (error) {
          console.error('Failed to handle pin toggle:', error);
        }
      });
  
      noteCard.appendChild(pinButton);
    } catch (error) {
      console.error('Failed to create pin button:', error);
    }
  }