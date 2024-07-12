import { formSubmit, fetchData } from "./utils";
export const updateEventApi = (eventId, request) => {
  return formSubmit(`/updateEvent/${eventId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  }).then((data) => {
    console.log("update success");
  });
};

export const getEventDataApi = (eventId) => {
  return fetchData(`/getEvent/${eventId}`).then((data) => {
    if (data) {
      return data.guest_data;
    }
  });
};

export const getSeatByEventIdApi = (eventId) => {
  return fetchData(`/getSeatByEventId/${eventId}`).then((data) => {
    return data.results[0];
  });
};
