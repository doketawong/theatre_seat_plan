export const getHello = async () => {
  const response = await fetch("/api/hello");
  const data = await response.json();
  return data;
};

export const uploadCSV = async (csvData) => {
  const response = await fetch("/uploadSeatingPlan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(csvData),
  });
  const data = await response.json();
  return data;
};
