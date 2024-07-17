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

export const getHouseApi = (houseIds) => {

  return fetchData(`/getHouse/${houseIds}`, {
    method: "GET",
  });
};

export const getHouseByIdApi = (houseIds) => {
  const houseId = houseIds.join(",");

  return fetchData(`/getHousesByIds/ids?ids=${houseId}`, {
    method: "GET",
  });
}

export const getAllHouseApi = () => {
  return fetchData(`/getHouse`, {
    method: "GET",
  });
};

export const uploadEventApi = (formData) => {
  return formSubmit(`/uploadEvent`, {
    method: "POST",
    body: formData,
  });
};
