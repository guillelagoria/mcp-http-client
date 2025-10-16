# Guía de Instalación para Windows

## Requisitos Previos

1. **Claude Desktop instalado**
   - Descargar de: https://claude.ai/download
   - Instalar normalmente

2. **Node.js 18 o superior** (requerido)
   - Descargar de: https://nodejs.org
   - Instalar la versión LTS (recomendado)
   - Verificar instalación: Abrir PowerShell y ejecutar:
     ```powershell
     node --version
     ```
   - Debería mostrar algo como `v18.x.x` o superior

---

## Instalación en Windows

### Paso 1: Abrir el Archivo de Configuración de Claude Desktop

**Opción A - Desde el Explorador de Archivos**:
1. Presiona `Win + R`
2. Escribe: `%APPDATA%\Claude`
3. Presiona Enter
4. Busca el archivo: `claude_desktop_config.json`
5. Abre con Notepad o tu editor favorito

**Opción B - Desde PowerShell**:
```powershell
notepad "$env:APPDATA\Claude\claude_desktop_config.json"
```

**Opción C - Desde CMD**:
```cmd
notepad %APPDATA%\Claude\claude_desktop_config.json
```

---

### Paso 2: Editar la Configuración

Si el archivo está **vacío** o tiene solo `{}`, reemplaza TODO el contenido con:

```json
{
  "mcpServers": {
    "latch-knowledge": {
      "command": "npx",
      "args": ["-y", "mcp-http-client", "https://latch-support-mcp-production.up.railway.app"]
    }
  }
}
```

Si el archivo **YA tiene contenido**, agrega la sección dentro de `mcpServers`:

```json
{
  "mcpServers": {
    "servidor-existente": {
      ...
    },
    "latch-knowledge": {
      "command": "npx",
      "args": ["-y", "mcp-http-client", "https://latch-support-mcp-production.up.railway.app"]
    }
  }
}
```

**IMPORTANTE**:
- Respeta las comas entre servidores
- No agregues coma después del último servidor
- Asegúrate que los corchetes `{}` estén bien cerrados

---

### Paso 3: Guardar y Cerrar

1. **Guardar**: `Ctrl + S` o File → Save
2. **Cerrar** el editor

---

### Paso 4: Reiniciar Claude Desktop

1. **Cerrar completamente Claude Desktop**:
   - Haz clic derecho en el ícono de Claude en la bandeja del sistema (abajo a la derecha)
   - Selecciona "Quit" o "Salir"
   - O usa Task Manager (`Ctrl + Shift + Esc`) y finaliza el proceso "Claude"

2. **Abrir Claude Desktop nuevamente**

---

### Paso 5: Verificar que Funciona

1. Abre Claude Desktop
2. En la parte inferior izquierda, deberías ver un ícono de herramientas 🔨
3. Haz clic en el ícono para ver las herramientas disponibles
4. Deberías ver:
   - `search_knowledge`
   - `get_document`
   - `list_categories`

---

## Uso

Una vez configurado, puedes preguntarle a Claude cosas como:

- "¿Qué categorías hay disponibles en la base de conocimiento?"
- "Busca guías de instalación de Latch M2"
- "Muéstrame todos los runbooks disponibles"
- "Dame el contenido completo del documento [ID]"

Claude automáticamente usará las herramientas para buscar en el servidor.

---

## Troubleshooting

### Error: "node is not recognized"

**Problema**: Node.js no está instalado o no está en el PATH

**Solución**:
1. Instalar Node.js desde: https://nodejs.org
2. Durante la instalación, asegúrate de marcar "Add to PATH"
3. Reiniciar PowerShell/CMD
4. Verificar: `node --version`

---

### Error: "npx is not recognized"

**Problema**: npm no está instalado correctamente

**Solución**:
1. npx viene con Node.js, reinstalar Node.js
2. Verificar: `npx --version`

---

### Claude Desktop no muestra las herramientas

**Solución**:
1. Verificar que el archivo JSON esté bien formado (sin errores de sintaxis)
2. Verificar que guardaste el archivo
3. Cerrar COMPLETAMENTE Claude Desktop (Task Manager si es necesario)
4. Abrir nuevamente
5. Ver logs de Claude Desktop:
   ```powershell
   Get-Content "$env:APPDATA\Claude\logs\mcp*.log" -Tail 50
   ```

---

### Error: "Failed to connect to server"

**Solución**:
1. Verificar que tienes internet
2. Verificar la URL del servidor:
   ```powershell
   curl https://latch-support-mcp-production.up.railway.app/health
   ```
   Debería responder: `{"status":"ok","service":"latch-knowledge-mcp",...}`
3. Si el servidor está "dormido" (Railway free tier), espera 30 segundos y reintenta

---

### Primera ejecución es lenta

**Normal**: La primera vez que ejecutas `npx mcp-http-client`, descarga el paquete (~20KB). Toma unos 10-30 segundos. Las siguientes veces es instantáneo.

---

## Ubicaciones Importantes en Windows

### Archivo de Configuración:
```
%APPDATA%\Claude\claude_desktop_config.json
```
Ruta completa típica:
```
C:\Users\TuUsuario\AppData\Roaming\Claude\claude_desktop_config.json
```

### Logs de Claude Desktop:
```
%APPDATA%\Claude\logs\
```

### Cache de NPM (donde se descarga mcp-http-client):
```
%APPDATA%\npm-cache\
```

---

## Configuración Avanzada

### Múltiples Servidores

Puedes conectarte a múltiples servidores MCP:

```json
{
  "mcpServers": {
    "latch-knowledge": {
      "command": "npx",
      "args": ["-y", "mcp-http-client", "https://latch-support-mcp-production.up.railway.app"]
    },
    "door-knowledge": {
      "command": "npx",
      "args": ["-y", "mcp-http-client", "https://door-support-mcp-production.up.railway.app"]
    }
  }
}
```

### Usar Variable de Entorno

Si prefieres, puedes configurar la URL como variable de entorno:

```powershell
# En PowerShell (admin)
[System.Environment]::SetEnvironmentVariable('MCP_SERVER_URL', 'https://latch-support-mcp-production.up.railway.app', 'User')
```

Luego en la config:
```json
{
  "mcpServers": {
    "latch-knowledge": {
      "command": "npx",
      "args": ["-y", "mcp-http-client"]
    }
  }
}
```

---

## Desinstalación

Si quieres remover la configuración:

1. Editar `claude_desktop_config.json`
2. Eliminar la sección de `latch-knowledge`
3. Guardar
4. Reiniciar Claude Desktop

Para limpiar el cache de NPM (opcional):
```powershell
npm cache clean --force
```

---

## Verificación Manual

Para probar que el cliente funciona sin Claude Desktop:

```powershell
# Instalar globalmente (opcional)
npm install -g mcp-http-client

# Probar conexión
mcp-http-client https://latch-support-mcp-production.up.railway.app
```

Deberías ver:
```
🔌 Connecting to https://latch-support-mcp-production.up.railway.app...
✅ Connected to latch-knowledge-mcp
   📄 225 documents available
```

Presiona `Ctrl + C` para salir.

---

## Diferencias con macOS/Linux

| Aspecto | Windows | macOS/Linux |
|---------|---------|-------------|
| **Config Path** | `%APPDATA%\Claude\` | `~/Library/Application Support/Claude/` |
| **Command Line** | PowerShell o CMD | Terminal |
| **Separador de Ruta** | `\` (backslash) | `/` (forward slash) |
| **Variables de Entorno** | `%VAR%` o `$env:VAR` | `$VAR` |

---

## Requisitos del Sistema

- **OS**: Windows 10 o superior
- **Node.js**: 18.0.0 o superior
- **RAM**: 100MB libres (para Claude Desktop + cliente)
- **Disco**: ~50MB (Node.js + cache NPM)
- **Internet**: Requerido para conectar al servidor

---

## Preguntas Frecuentes

### ¿Necesito instalar algo más?
Solo Node.js y Claude Desktop. El cliente `mcp-http-client` se descarga automáticamente via `npx`.

### ¿Funciona sin internet?
No, necesitas internet para conectar al servidor Railway.

### ¿Los datos se guardan localmente?
No, todo se consulta en tiempo real del servidor remoto. No ocupa espacio en disco.

### ¿Es seguro?
Sí, es un cliente read-only que solo hace requests HTTP. Ver `SECURITY_AUDIT.md` para detalles.

### ¿Cuánto cuesta?
$0. Es completamente gratis.

### ¿Se actualiza automáticamente?
Sí, `npx -y` siempre descarga la última versión publicada en NPM.

---

## Soporte

Si tienes problemas:
1. Verifica los logs de Claude Desktop
2. Verifica que Node.js está instalado: `node --version`
3. Verifica que el servidor está arriba:
   ```powershell
   curl https://latch-support-mcp-production.up.railway.app/health
   ```

---

**Última actualización**: 2025-10-15
**Versión del cliente**: 1.0.2
