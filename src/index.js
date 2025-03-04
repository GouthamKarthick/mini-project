import { worker } from '../mocks/server.js';
import { add, getLastNote, closeCreateNote, update, pinToggle, permanentlyDelete, returnTrashedNotes,
    returnPinnedNotes, returnUnpinnedNotes, returnNotes, moveToTrash, reorderUpdate, returnFromTrash, searchNotes
 } from './Controller/Controller.js';

async function enableMocking() {
    console.log("calling mock");
    console.log(worker);
    return worker.start();
}

const toggle = document.querySelector('.navbar__toggle-icon');
const content = document.querySelector('.main-content');
const notesView = document.querySelector('.notes');
const listView = document.querySelector('.navbar__list-icon');
const gridView = document.querySelector('.navbar__grid-icon');
const notesContainer = document.querySelector('.notes__container');
const notesPinnedView = document.querySelector('.notes__pinned');
const notesUnpinnedView = document.querySelector('.notes__others');
const createNoteView = document.querySelector('.notes__create-note');
const title = document.querySelector('.notes__title');
const text = document.querySelector('.notes__text');
const buttonGroup = document.querySelector('.notes__btn-group')
const cancelButton = document.querySelector('.notes__cancel');
const closeButton = document.querySelector('.notes__close-btn');
const dialogTitle = document.querySelector('.notes__dialog-title');
const dialogText = document.querySelector('.notes__dialog-text');
const dialog = document.querySelector('.notes__dialog');
const searchInput = document.querySelector('.navbar__search');
const trashView = document.querySelector('.trash');
const trashNotesView = document.querySelector('.trash__view');
const trashMenu = document.querySelector('.sidebar__trash');
const notesMenu = document.querySelector('.sidebar__notes');

async function saveReorder() {
    let updatedArray = [];

    notesPinnedView.childNodes.forEach(child => {
        updatedArray.push(Number(child.id.slice(6,)));
    });

    notesUnpinnedView.childNodes.forEach(child => {
        updatedArray.push(Number(child.id.slice(6,)));
    });

    await reorderUpdate(updatedArray);
}

function createDeleteButton(deleteButton, noteCard, note) {
    deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteButton.classList.add('notes__delete-btn');

    deleteButton.addEventListener('click', async function (event) {
        event.stopPropagation();
        await moveToTrash(note.id);
        createTrashNote(note);
        noteCard.remove();
    });

    noteCard.appendChild(deleteButton);
}

function createPinButton(pinButton, noteCard, note) {
    pinButton.classList.add('notes__pin-btn');

    pinButton.innerHTML = note.isPinned
        ? '<i class="fa-solid fa-thumbtack-slash"></i>'
        : '<i class="fa-solid fa-thumbtack"></i>';

    pinButton.addEventListener('click', async function (event) {
        event.stopPropagation();

        const isNowPinned = !note.isPinned;
        const targetView = isNowPinned ? notesPinnedView : notesUnpinnedView;

        await pinToggle(note.id, isNowPinned);
        note.isPinned = isNowPinned;

        pinButton.innerHTML = isNowPinned
            ? '<i class="fa-solid fa-thumbtack-slash"></i>'
            : '<i class="fa-solid fa-thumbtack"></i>';

        noteCard.remove();
        
        targetView.appendChild(noteCard);
        addDragAndDropListeners(noteCard, note, targetView);
    });

    noteCard.appendChild(pinButton);
}

function addDragAndDropListeners(noteCard, note, container) {
    noteCard.setAttribute("draggable", true);

    noteCard.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", note.id);
        event.dataTransfer.effectAllowed = "move";
    });

    noteCard.addEventListener("dragover", (event) => {
        event.preventDefault();
    });

    noteCard.addEventListener("drop", async (event) => {
        event.preventDefault();

        const draggedNoteId = event.dataTransfer.getData("text/plain");
        const draggedNote = document.getElementById(`note__${draggedNoteId}`);

        if (draggedNote && draggedNote.parentElement === container) {
            container.insertBefore(draggedNote, noteCard.nextSibling);
            await saveReorder();
        }
    });
}

async function createNote(note, view = notesUnpinnedView) {
    const noteCard = document.createElement('div');
    const noteTitle = document.createElement('div');
    const noteText = document.createElement('div');
    const pinButton = document.createElement('button');
    const deleteButton = document.createElement('button');

    noteTitle.textContent = note.title;
    noteTitle.classList.add('notes__note-title');

    noteText.textContent = note.text;
    noteText.classList.add('notes__note-text');

    noteCard.classList.add('notes__card');
    noteCard.setAttribute('id', `note__${note.id}`);
    noteCard.appendChild(noteTitle);
    noteCard.appendChild(noteText);
    view.appendChild(noteCard);

    noteCard.addEventListener('click', function(event) {
        if (event.target === pinButton || event.target === deleteButton) {
            return;
        }

        dialog.id = `dialog_${note.id}`;
        dialogTitle.textContent = noteTitle.textContent;
        dialogText.textContent = noteText.textContent;
        dialog.showModal();
    });

    createPinButton(pinButton, noteCard, note);
    createDeleteButton(deleteButton, noteCard, note);
    addDragAndDropListeners(noteCard, note, view);

    requestAnimationFrame(() => {
        const rowHeight = 10;
        const contentHeight = noteCard.getBoundingClientRect().height;
        noteCard.style.gridRowEnd = `span ${Math.ceil(contentHeight / rowHeight)}`;
    });
}

function createTrashNote(note) {
    const trashCard = document.createElement('div');
    const noteTitle = document.createElement('div');
    const noteText = document.createElement('div');
    const deleteButton = document.createElement('button');
    const restoreButton = document.createElement('button');

    trashCard.classList.add('trash__card');
    trashCard.setAttribute('id', `trash__${note.id}`);
    
    noteTitle.textContent = note.title;
    noteTitle.classList.add('trash__note-title');
    
    noteText.textContent = note.text;
    noteText.classList.add('trash__note-text');
    
    deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteButton.classList.add('trash__delete-btn');
    deleteButton.addEventListener('click', async function () {
        await permanentlyDelete(note.id);
        trashCard.remove();
    });

    restoreButton.innerHTML = '<i class="fa-solid fa-arrow-rotate-left"></i>';
    restoreButton.classList.add('trash__restore-btn');
    restoreButton.addEventListener('click', async function () {
        await returnFromTrash(note.id, false);
        trashCard.remove();
    });

    trashCard.append(noteTitle, noteText, deleteButton, restoreButton);
    trashNotesView.appendChild(trashCard);

    requestAnimationFrame(() => {
        const rowHeight = 10;
        const contentHeight = trashCard.getBoundingClientRect().height;
        noteCard.style.gridRowEnd = `span ${Math.ceil(contentHeight / rowHeight)}`;
    });
}


async function displayNotes(notes) {
    const pinnedNotes = returnPinnedNotes(notes);
    const unpinnedNotes = returnUnpinnedNotes(notes);

    notesPinnedView.innerHTML = '';
    notesUnpinnedView.innerHTML = '';

    for (const note of pinnedNotes) {
        await createNote(note, notesPinnedView);
    }

    for (const note of unpinnedNotes) {
        await createNote(note, notesUnpinnedView);
    }
}

function displayTrash(notes) {
    const trashedNotes = returnTrashedNotes(notes);

    trashNotesView.innerHTML = '';

    for (const note of trashedNotes) {
        createTrashNote(note);
    }
}

function renderNote(note) {
    document.querySelector(`#note__${note.id} .notes__note-title`).textContent = note.title;
    document.querySelector(`#note__${note.id} .notes__note-text`).textContent = note.text;
}

toggle.addEventListener('click', function() {
    const value = content.style.left === '0rem';

    content.style.left = value ? '-8rem' : '0rem';
    notesView.style.width = value ? '84.85rem' : '76.75rem';
    trashView.style.width = value ? '84.85rem' : '76.75rem';
});

listView.addEventListener('click', function() {
    if (notesUnpinnedView.classList.contains('grid-view')) {
        notesUnpinnedView.classList.remove('grid-view');
    }

    if (notesPinnedView.classList.contains('grid-view')) {
        notesPinnedView.classList.remove('grid-view');
    }
    
    notesUnpinnedView.classList.add('list-view');
    notesPinnedView.classList.add('list-view');
    notesContainer.style.alignItems = 'center';
});

gridView.addEventListener('click', function() {
    if (notesUnpinnedView.classList.contains('list-view')) {
        notesUnpinnedView.classList.remove('list-view');
    }

    if (notesPinnedView.classList.contains('list-view')) {
        notesPinnedView.classList.remove('list-view');
    }

    notesUnpinnedView.classList.add('grid-view');
    notesPinnedView.classList.add('grid-view');
    notesContainer.style.alignItems = 'normal';
});

text.addEventListener('focus', function(event) {
    title.style.display = 'block';
    buttonGroup.style.display = 'block';
    event.stopPropagation();
});

document.addEventListener('click', function(event) {
    if (!createNoteView.contains(event.target)) {
        closeCreateNote(title, buttonGroup);
        createNoteView.reset();
    }
});

createNoteView.addEventListener('submit', async function(event) {
    event.preventDefault();

    const inputTitle = event.target['title'].value.trim();
    const inputText = event.target['text'].value.trim();
    
    await add(inputTitle, inputText);
    closeCreateNote(title, buttonGroup);
    event.target.reset();

    const {note, _} = await getLastNote();
    await createNote(note, notesUnpinnedView);
});

cancelButton.addEventListener('click', function(event) {
    event.preventDefault();
    createNoteView.reset();
    closeCreateNote(title, buttonGroup);
});

closeButton.addEventListener('click', async function() {
    const id = Number(dialog.id.slice(7,));
    const updatedTitle = dialogTitle.textContent.trim();
    const updatedText = dialogText.textContent.trim();
    const note = await update(id, updatedText, updatedTitle);

    renderNote(note);
    dialog.close();
});

searchInput.addEventListener('search', async function (event) {
    const query = event.target.value.trim();

    if (query === '') {
        let notes = await returnNotes();
        await displayNotes(notes);
    } else {
        let searchedNotes = await searchNotes(query);
        await displayNotes(searchedNotes);
    }
});

trashMenu.addEventListener('click', async function() {
    const notes = await returnNotes();

    notesView.style.display = 'none';
    trashView.style.display = 'flex';

    displayTrash(notes);
});

notesMenu.addEventListener('click', async function () {
    const notes = await returnNotes();

    trashView.style.display = 'none';
    notesView.style.display = 'flex';
    
    await displayNotes(notes);
});

enableMocking().then(() => {
    console.log('Mocking enabled!');
});