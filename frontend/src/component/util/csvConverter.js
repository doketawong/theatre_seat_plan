import Papa from 'papaparse';

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: function(results) {
        resolve(results.data);
      },
      error: function(err) {
        reject(err);
      }
    });
  });
};