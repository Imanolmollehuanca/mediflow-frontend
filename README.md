# MediFlow · Frontend clínico

Aplicación local con React, Vite, TypeScript y React Router. El panel consulta la API y calcula sus indicadores con los registros recibidos. Las fechas de agenda y los turnos se muestran en UTC, que es la referencia del backend.

## Ejecutar

Requiere Node.js 22.12 o superior y npm. Arranca el backend con PostgreSQL configurado. Desde la carpeta de la solución puedes utilizar `dotnet run --project MediFlow --launch-profile http`.

Desde esta carpeta ejecuta:

```powershell
npm ci
npm run dev
```

Abre http://localhost:5173. La variable `VITE_API_BASE_URL=http://localhost:5282` se incluye en `.env`. Reinicia Vite al cambiarla.

## Operaciones

- Desde **Disponibilidad**, elige médico y fecha UTC, consulta los turnos y selecciona **Programar cita**. Completa el paciente y guarda. La API valida los conflictos al confirmar.
- Cada módulo permite buscar en la lista, consultar la ficha por ID y usar las operaciones de su controlador. Las relaciones se seleccionan desde catálogos de la API. Horarios filtra por médico, asignaciones filtra por médico y consultorio, y recetas filtra por paciente.
- Los módulos clínicos admiten acceso anónimo según la configuración actual del servidor. Inicia sesión en **Mi cuenta** para exportar pacientes a Excel y cambiar la contraseña. El token Bearer se conserva en la pestaña hasta el cierre de sesión o vencimiento.
- El rol **Admin** habilita usuarios, roles, facturas, pagos y notificaciones. La ficha del usuario permite cambiar su estado y asignar o retirar roles. En pagos se puede cambiar el estado y en notificaciones marcar la lectura. Las operaciones de facturación se limitan a consulta y emisión.
- Los conflictos, campos inválidos, fallos de conexión y denegaciones de acceso aparecen en la pantalla que originó la petición.

## Compilación y CORS

`npm run build` comprueba TypeScript y genera `dist`. `npm run preview` sirve la compilación local. En un servidor estático dirige las rutas de navegación a `index.html`.

En desarrollo el navegador solicita `/api` al servidor Vite y su proxy reenvía a `VITE_API_BASE_URL`. En la compilación de producción, las peticiones van directamente a la URL configurada al compilar. Si frontend y API tienen orígenes distintos, el navegador exige CORS, incluso durante la vista previa de producción.

El Program.cs inspeccionado carece de una política CORS. Para habilitar acceso directo, el responsable del backend puede registrar una política antes de `builder.Build()` y aplicarla antes de autenticación y autorización. Sustituye los orígenes por los que realmente sirvan el frontend.

```csharp
builder.Services.AddCors(options =>
    options.AddPolicy("Frontend", policy => policy
        .WithOrigins("http://localhost:5173", "http://localhost:4173")
        .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE")
        .WithHeaders("Content-Type", "Authorization")));

// En el pipeline, antes de UseAuthentication()
app.UseCors("Frontend");
```

Con HTTPS usa la URL HTTPS efectiva del backend y un certificado de confianza. En producción, localhost se refiere a la máquina del navegador; configura la dirección de la API antes de generar la distribución.
