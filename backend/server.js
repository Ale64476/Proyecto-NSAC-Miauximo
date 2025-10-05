const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 5000; // distinto a React para evitar conflicto

app.use(cors());
app.use(express.json());

// Endpoint para lugares
app.get('/api/lugares', (req, res) => {
    const data = JSON.parse(fs.readFileSync('lugares.json', 'utf-8'));
    res.json(data);
});

// Endpoint para la predicción de la RNA
app.post('/api/predict', async (req, res) => {
    const input = req.body; // recibir datos del frontend

    // Aquí iría la lógica de tu RNA ya entrenada
    // Ejemplo: cargar el modelo y hacer la predicción
    // const output = rnaModelo.predict(input);
    // res.json(output);

    res.json({ message: 'Aquí se haría la predicción' });
});

app.listen(port, () => console.log(`Backend corriendo en http://localhost:${port}`));
