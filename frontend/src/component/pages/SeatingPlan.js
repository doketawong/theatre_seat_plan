import { Box, Button, Typography, TextField} from "@mui/material";
import React, { useState, forwardRef } from "react";
import { formSubmit } from '../util/utils';

const SeatingPlan = (props) => {
  const [form, setForm] = useState({
    eventName: '',
    eventDate: '',
    houseId: '',
    file: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prevState => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm(prevState => ({ ...prevState, file: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));

    formSubmit(`/uploadEvent`, {
      method: 'POST',
      body: formData
    })
  };

  return (
    <Box>
      <div>
        <Typography><b>{props.eventName}</b> Seating Plan</Typography>
        <table>
          <thead></thead>
          <tbody>
            {props.seat ? Object.keys(props.seat).map((key, i) => (
              <tr key={key}>
                <td>{key}</td>
                {props.seat[key].map((obj, j) => (
                  <td key={key + j}>
                    <Button key={key + j} style={{ margin: "1px" }}>
                      {obj ? obj.displayName : null}
                    </Button>
                  </td>
                ))}
              </tr>
            )) : <tr><td>Loading...</td></tr>}
          </tbody>
        </table>
      </div>
      <hr/>
      <div>
        <div>Submit Event with guest data:</div>
        <form onSubmit={handleSubmit}>
          <TextField name="eventName" label="Dune: Part Two" value={form.eventName} onChange={handleChange} />
          <TextField name="eventDate" label="Event Date" type="datetime-local" InputLabelProps={{ shrink: true }} value={form.eventDate} onChange={handleChange} />
          <TextField name="houseId" label="1" value={form.houseId} onChange={handleChange} />
          <input type="file" onChange={handleFileChange} />
          <Button type="submit">Submit</Button>
        </form>
      </div>
    </Box>
  );
};

export default forwardRef(SeatingPlan);
