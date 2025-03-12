import { http, HttpResponse } from "msw";

export const SERVER_URL = "http://localhost:5070";

let notesId = 1;
let notes = [];

export const handlers = [
  http.get(`${SERVER_URL}/notes`, ({ request, params, cookies }) => {
    return HttpResponse.json({ notes });
  }),
  http.get(`${SERVER_URL}/notes/:id`, ({ request, params, cookies }) => {
    const note = notes.find((n) => n.id === Number(params.id));

    return HttpResponse.json(note);
  }),
  http.post(`${SERVER_URL}/notes`, async ({ request, params, cookies }) => {
    const requestBody = await request.json();

    if (!requestBody.title && !requestBody.text) {
      return HttpResponse(null, { status: 400 });
    }

    notes.push({
      id: notesId++,
      title: requestBody.title,
      text: requestBody.text,
      isDeleted: false,
      isPinned: false,
    });
    return HttpResponse.json({ success: true });
  }),
  http.patch(
    `${SERVER_URL}/notes/:id`,
    async ({ request, params, cookies }) => {
      const noteIndex = notes.findIndex((n) => n.id === Number(params.id));

      if (noteIndex === -1) {
        return HttpResponse.json({ error: "Note not found" }, { status: 404 });
      }

      const requestBody = await request.json();
      const updatedNote = { ...notes[noteIndex], ...requestBody };

      notes[noteIndex] = updatedNote;
      console.log(notes);
      return HttpResponse.json({ success: true, updatedNote });
    }
  ),
  http.delete(
    `${SERVER_URL}/notes/:id`,
    async ({ request, params, cookies }) => {
      const noteIndex = notes.findIndex((n) => n.id === params.id);

      if (noteIndex === -1) {
        return HttpResponse(null, { status: 400 });
      }

      notes = notes.splice(noteIndex, 1);
      console.log(notes);
      return HttpResponse.json({ success: true });
    }
  ),
  http.post(
    `${SERVER_URL}/notes/sync`,
    async ({ request, params, cookies }) => {
      const responseBody = await request.json();

      if (!responseBody.notes || !responseBody.notes.length) {
        return HttpResponse(null, { status: 400 });
      }

      notes = responseBody.notes;

      return HttpResponse.json({ success: true });
    }
  ),
  http.patch(`${SERVER_URL}/notes`, async ({ request, params, cookies }) => {
    const responseBody = await request.json();

    notes = responseBody;
    return HttpResponse.json({ success: true });
  }),
];