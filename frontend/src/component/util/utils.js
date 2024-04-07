import * as constants from "../../constants";

export const fetchData = async (url) => {
  try {
    const response = await fetch(`${constants.API_HOST}${url}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
};

export const formSubmit = async (url, formData) => {
  try {
    const response = await fetch(`${constants.API_HOST}${url}`, formData);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}