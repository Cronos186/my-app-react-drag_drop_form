import React, { useState } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Formik, Form, Field } from "formik";
import {
  TextField,
  Button,
  Paper,
  Typography,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Grid as UIGrid } from "@mui/material";
import ReactJson from "react-json-view";

const availableFields = [
  { type: "text", label: "Texto", placeholder: "Ingresa texto" },
  {
    type: "email",
    label: "Correo electrónico",
    placeholder: "Ingresa correo electrónico",
  },
  { type: "number", label: "Número", placeholder: "Ingresa un número" },
];

const DraggableField = ({ field }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "FIELD",
    item: field,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <Paper
      ref={drag}
      sx={{
        padding: "10px",
        marginBottom: "10px",
        backgroundColor: isDragging ? "#e0e0e0" : "#fff",
        cursor: "grab",
        border: "1px solid #ccc",
      }}
    >
      {field.label}
    </Paper>
  );
};

const Dropzone = ({ fields, setFields }) => {
  const [, drop] = useDrop({
    accept: "FIELD",
    drop: (item) => {
      const newField = {
        ...item,
        id: `field-${Date.now()}`,
        name: `${item.type}_${fields.length + 1}`,
      };
      setFields([...fields, newField]);
    },
  });

  return (
    <Paper
      ref={drop}
      sx={{
        padding: "20px",
        minHeight: "250px",
        border: "2px dashed #2196F3",
        backgroundColor: "#f0f8ff",
      }}
    >
      <Typography variant="h6" color="primary">
        📝 Formulario Generado
      </Typography>
      {fields.length === 0 && (
        <Typography variant="body2">Arrastra campos aquí</Typography>
      )}
      <UIGrid container spacing={2}>
        {fields.map((field, index) => (
          <DraggableFieldInForm
            key={field.id}
            field={field}
            index={index}
            fields={fields}
            setFields={setFields}
          />
        ))}
      </UIGrid>
    </Paper>
  );
};

const DraggableFieldInForm = ({ field, index, fields, setFields }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], [name]: value };
    setFields(updatedFields);
  };

  return (
    <UIGrid item xs={6}>
      <Paper
        sx={{ padding: "10px", position: "relative", border: "1px solid #ccc" }}
      >
        <TextField
          fullWidth
          label="Etiqueta"
          name="label"
          value={field.label}
          onChange={handleChange}
          variant="outlined"
          margin="dense"
        />
        <TextField
          fullWidth
          label="Nombre"
          name="name"
          value={field.name}
          onChange={handleChange}
          variant="outlined"
          margin="dense"
        />
        <TextField
          fullWidth
          label="Placeholder"
          name="placeholder"
          value={field.placeholder}
          onChange={handleChange}
          variant="outlined"
          margin="dense"
        />
        {/*<Field
          as={TextField}
          fullWidth
          type={field.type}
          name={field.name}
          placeholder={field.placeholder}
          variant="outlined"
          margin="dense"
        />*/}
        <IconButton
          onClick={() => setFields(fields.filter((_, i) => i !== index))}
          sx={{ position: "absolute", top: "5px", right: "5px" }}
        >
          <DeleteIcon color="error" />
        </IconButton>
      </Paper>
    </UIGrid>
  );
};

const FormPreviewModal = ({ open, onClose, fields }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>🖥️ Vista Previa del Formulario</DialogTitle>
      <br></br>
      <DialogContent>
        <UIGrid container spacing={2}>
          {fields.map((field) => (
            <UIGrid item xs={6} key={field.id}>
              <TextField
                fullWidth
                label={field.label}
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                variant="outlined"
              />
            </UIGrid>
          ))}
        </UIGrid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DragDropForm = () => {
  const [formFields, setFormFields] = useState([]);
  const [jsonOutput, setJsonOutput] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <DndProvider backend={HTML5Backend}>
      <Formik
        enableReinitialize
        initialValues={{}}
        onSubmit={() => {
          const output = formFields.map(
            ({ type, label, name, placeholder }) => ({
              type,
              label,
              name,
              placeholder,
            })
          );
          setJsonOutput(output);
        }}
      >
        {() => (
          <Form>
            <UIGrid container spacing={3}>
              {/* Sección de Campos Disponibles */}
              <UIGrid item xs={4}>
                <Paper
                  sx={{
                    padding: "20px",
                    minHeight: "250px",
                    backgroundColor: "#e3f2fd",
                    border: "2px solid #1976D2",
                  }}
                >
                  <Typography variant="h6" color="primary">
                    🏗️ Campos Disponibles
                  </Typography>
                  {availableFields.map((field) => (
                    <DraggableField key={field.type} field={field} />
                  ))}
                </Paper>
              </UIGrid>

              {/* Sección del Formulario */}
              <UIGrid item xs={8}>
                <Dropzone fields={formFields} setFields={setFormFields} />
              </UIGrid>
            </UIGrid>

            {/* Botones de acción */}
            <Box sx={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <Button type="submit" variant="contained" color="primary">
                📄 Generar JSON
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => setPreviewOpen(true)}
              >
                👁️ Vista Previa
              </Button>
            </Box>

            {/* JSON Generado */}
            {jsonOutput && (
              <Paper
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ccc",
                  textAlign: "left",
                }}
              >
                <Typography variant="h6" color="primary">
                  📜 JSON Generado
                </Typography>
                <ReactJson
                  src={jsonOutput}
                  theme="rjv-default" // Puedes cambiar el tema a "monokai", "ocean", etc.
                  displayDataTypes={false}
                  displayObjectSize={false}
                />
              </Paper>
            )}

            {/* Modal de vista previa */}
            <FormPreviewModal
              open={previewOpen}
              onClose={() => setPreviewOpen(false)}
              fields={formFields}
            />
          </Form>
        )}
      </Formik>
    </DndProvider>
  );
};

export default DragDropForm;
