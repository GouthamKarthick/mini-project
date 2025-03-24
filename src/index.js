import { worker } from "../mocks/server.js";
import { SELECTORS } from "./constants.js";
import {
  handleListView,
  handleGridView,
  openCreateNote,
  toggleSidebar,
  clickNotesMenu,
  clickTrashMenu,
  searchNotesHandler,
  closeButtonHandler,
  cancelButtonHandler,
  addNoteHandler,
  hideCreateNote,
} from "./views/eventHandlers.js";

export const elements = {};

init();

async function enableMocking() {
  try {
    return await worker.start();
  } catch (error) {
    console.error("Failed to enable mocking:", error);
  }
}

elements.LIST_VIEW.addEventListener("click", handleListView);

elements.GRID_VIEW.addEventListener("click", handleGridView);

elements.TEXT.addEventListener("focus", function (event) {
  openCreateNote(event);
});

document.addEventListener("click", function (event) {
  hideCreateNote(event);
});

elements.CREATE_NOTE.addEventListener("submit", async function (event) {
  await addNoteHandler(event);
});

elements.CANCEL.addEventListener("click", (event) => {
  cancelButtonHandler(event);
});

elements.CLOSE_BTN.addEventListener("click", closeButtonHandler);

elements.SEARCH.addEventListener("search", async function (event) {
  await searchNotesHandler(event);
});

elements.TRASH_MENU.addEventListener("click", clickTrashMenu);

elements.NOTES_MENU.addEventListener("click", clickNotesMenu);

elements.TOGGLE.addEventListener("click", toggleSidebar);

function init() {
  try {
    Object.entries(SELECTORS).forEach(([key, selector]) => {
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`Element not found for selector: ${selector}`);
      }
      elements[key] = element;
    });
  } catch (error) {
    console.error("Failed to initialize application:", error);
    alert("Failed to initialize application. Please refresh the page.");
  }
}

enableMocking();
