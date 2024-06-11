import { LoadingButton } from "@mui/lab";
import { Box, Container, TextField, Typography } from "@mui/material";
import { useState } from "react";
import './App.css';

// importacion para la conexion

const API_WEATHER = `http://api.weatherapi.com/v1/current.json?key=${import.meta.env.VITE_API_KEY}&lang=es&q=`;

export default function App() {
  const [city, setCity] = useState("");
  const [error, setError] = useState({
    error: false,
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);

  // Función para guardar en MongoDB
  
  const saveToDatabase = async () => {
    try {
      if (!weather) {
        throw new Error('No hay datos meteorológicos para guardar');
      }
  
      const response = await fetch('http://localhost:5000/saveWeatherData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: weather.city,
          country: weather.country,  // <-- Agregar este campo
          temperature: weather.temperature,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Error al guardar los datos en la base de datos');
      }
  
      console.log('Datos guardados correctamente en MongoDB');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError({ error: false, message: "" });
    setLoading(true);

    try {
      if (!city.trim()) throw { message: "El campo ciudad es obligatorio" };

      const res = await fetch(API_WEATHER + city);
      if (!res.ok) {
        throw { message: "No se pudo obtener el clima, intente nuevamente" };
      }
      const data = await res.json();

      if (data.error) {
        throw { message: data.error.message };
      }

      console.log(data);

      setWeather({
        city: data.location.name,
        country: data.location.country,
        temperature: data.current.temp_c,
        condition: data.current.condition.code,
        conditionText: data.current.condition.text,
        icon: data.current.condition.icon,
      });
    } catch (error) {
      console.log(error);
      setError({ error: true, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 2 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        El Tiempo
      </Typography>
      <Box sx={{ display: "grid", gap: 2 }} component="form" autoComplete="off" onSubmit={onSubmit}>
        <TextField
          id="city"
          label="Ciudad"
          variant="outlined"
          size="small"
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          error={error.error}
          helperText={error.message}
        />

        <LoadingButton type="submit" variant="contained" loading={loading} loadingIndicator="Buscando...">
          Buscar
        </LoadingButton>

        {/* Botón para guardar en MongoDB */}
        <LoadingButton onClick={saveToDatabase} variant="contained">
          Guardar en Base de Datos
        </LoadingButton>
      </Box>

      {weather && (
        <WeatherInfo weather={weather} />
      )}

      <Typography textAlign="center" sx={{ mt: 2, fontSize: "10px" }}>
        Powered by:{" "}
        <a href="https://www.weatherapi.com/" title="Weather API">
          WeatherAPI.com
        </a>
      </Typography>
    </Container>
  );
}

function WeatherInfo({ weather }) {
  // Mapeo de condiciones climáticas a URLs de GIFs
  const weatherGifs = {
    
    sunny: "https://i.gifer.com/7GdU.gif",
    partially_cloudy: "https://i.gifer.com/68P.gif",
    rainy: "https://i.gifer.com/D1D8.gif",
    windy: "https://i.gifer.com/4OCT.gif",
  };

   // Determinar el GIF basado en la condición climática
   let weatherGif;
   if (weather.condition === 1000) {
     weatherGif = weatherGifs.sunny; // Soleado
   } else if ([1003, 1006, 1009, 1030].includes(weather.condition)) {
     weatherGif = weatherGifs.partially_cloudy; // Parcialmente nublado
   } else if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246, 1273, 1276].includes(weather.condition)) {
     weatherGif = weatherGifs.rainy; // Lluvioso
   } else if ([1009, 1030, 1066, 1069, 1072, 1087, 1135, 1147, 1150, 1153, 1168, 1171, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1255, 1258, 1261, 1264, 1279, 1282].includes(weather.condition)) {
     weatherGif = weatherGifs.windy; // Ventoso
   } else {
     weatherGif = weather.icon; // Usar el ícono proporcionado por la API como predeterminado
   }

   return (
    <Box sx={{ mt: 2, display: "grid", gap: 2, textAlign: "center" }}>
      <Typography variant="h4" component="h2">
        {weather.city}, {weather.country}
      </Typography>
      <Box component="img" alt={weather.conditionText} src={weatherGif} className="weather-gif" />
      <Typography variant="h5" component="h3">
        {weather.temperature} °C
      </Typography>
      <Typography variant="h6" component="h4">
        {weather.conditionText}
      </Typography>
    </Box>
  );
}
