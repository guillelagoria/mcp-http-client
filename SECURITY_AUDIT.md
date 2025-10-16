# Security Audit Report: mcp-http-client

**Fecha**: 2025-10-15
**Versión Auditada**: 1.0.0
**Auditor**: Security Expert Analysis

---

## Executive Summary

**Veredicto General**: ✅ **SEGURO** con recomendaciones menores

El paquete `mcp-http-client` es un cliente HTTP de solo lectura que actúa como proxy entre Claude Desktop y servidores MCP remotos. No presenta riesgos de seguridad significativos para el sistema del usuario.

**Nivel de Riesgo**: 🟢 **BAJO**

---

## Análisis de Amenazas

### 1. Superficie de Ataque

#### ✅ Lo que el cliente NO puede hacer (Seguro):
- ❌ No ejecuta código arbitrario
- ❌ No accede al sistema de archivos del usuario
- ❌ No lee archivos locales sensibles
- ❌ No modifica archivos locales
- ❌ No instala backdoors o malware
- ❌ No envía datos del usuario a terceros sin conocimiento
- ❌ No escucha en puertos de red
- ❌ No eleva privilegios
- ❌ No modifica configuraciones del sistema
- ❌ No accede a credenciales del usuario

#### ⚠️ Lo que el cliente SÍ hace:
- ✅ Lee la URL del servidor desde argumentos CLI (controlado por el usuario)
- ✅ Hace requests HTTP al servidor especificado (visible y controlable)
- ✅ Recibe y formatea respuestas del servidor
- ✅ Comunica via stdio con Claude Desktop (protocolo MCP estándar)

### 2. Vectores de Ataque Potenciales

#### 2.1. Server-Side Request Forgery (SSRF)
**Riesgo**: 🟡 BAJO-MEDIO

**Descripción**: Un atacante podría intentar hacer que el cliente se conecte a URLs maliciosas.

**Código vulnerable**:
```javascript
const response = await fetch(`${this.serverUrl}/api/search?${params}`);
```

**Mitigaciones actuales**:
- ✅ Usuario especifica explícitamente la URL en la configuración
- ✅ No hay redirecciones automáticas sin conocimiento del usuario
- ✅ HTTPS recomendado (verificación de certificados)

**Recomendación**:
- Validar que la URL sea HTTPS (no HTTP) para servidores en producción
- Agregar whitelist opcional de dominios permitidos

#### 2.2. Inyección en Parámetros de Búsqueda
**Riesgo**: 🟢 BAJO

**Código**:
```javascript
const params = new URLSearchParams({ query, limit: limit.toString() });
```

**Mitigación actual**:
- ✅ Usa `URLSearchParams` que escapa automáticamente caracteres especiales
- ✅ No hay construcción manual de strings SQL o comandos shell

**Estado**: ✅ SEGURO

#### 2.3. Cross-Site Scripting (XSS) via Respuestas del Servidor
**Riesgo**: 🟢 BAJO

**Descripción**: El servidor podría enviar contenido malicioso en las respuestas.

**Código**:
```javascript
text += `${i + 1}. **${doc.title}**\n`;
text += `   📄 ID: \`${doc.id}\`\n`;
```

**Mitigaciones actuales**:
- ✅ Output es texto plano (Markdown), no HTML ejecutable
- ✅ Claude Desktop renderiza de forma segura
- ✅ No hay eval() o ejecución de código dinámico

**Estado**: ✅ SEGURO

#### 2.4. Exposición de Información Sensible
**Riesgo**: 🟢 MUY BAJO

**Análisis**:
- ✅ No hay logging de datos sensibles
- ✅ Errores no revelan información del sistema
- ✅ No hay telemetría automática
- ⚠️ La URL del servidor es visible en la configuración (esperado)

**Estado**: ✅ SEGURO

#### 2.5. Man-in-the-Middle (MITM)
**Riesgo**: 🟡 MEDIO (si se usa HTTP)

**Análisis**:
```javascript
const response = await fetch(`${this.serverUrl}/api/search`);
```

**Riesgo actual**:
- Si el usuario configura HTTP (no HTTPS), los datos van en texto plano
- Un atacante en la red podría interceptar queries y respuestas

**Recomendaciones**:
- Forzar HTTPS para servidores remotos
- Advertir al usuario si intenta usar HTTP
- Permitir HTTP solo para localhost/127.0.0.1

#### 2.6. Dependency Vulnerabilities
**Riesgo**: 🟢 BAJO

**Dependencias**:
```json
{
  "@modelcontextprotocol/sdk": "^0.6.0",
  "node-fetch": "^3.3.2"
}
```

**Análisis**:
- ✅ Solo 2 dependencias directas
- ✅ `@modelcontextprotocol/sdk` - Oficial de Anthropic
- ✅ `node-fetch` - Librería popular y mantenida
- ⚠️ node-fetch tiene 20 dependencias transitivas

**Recomendación**:
- Ejecutar `npm audit` regularmente
- Considerar usar `fetch` nativo de Node.js 18+ (eliminar node-fetch)

---

## Análisis de Privacidad

### Datos que el Cliente Maneja

#### Input del Usuario (a través de Claude):
- Queries de búsqueda
- IDs de documentos solicitados
- Filtros de categoría

#### Datos Enviados al Servidor:
```
GET /api/search?query=<user-query>&category=<optional>&limit=<number>
GET /api/document?id=<document-id>
GET /api/categories
```

#### ¿Qué se comparte?
- ✅ Solo lo que el usuario pregunta explícitamente
- ✅ No se envía historial de navegación
- ✅ No se envían metadatos del sistema
- ✅ No hay telemetría automática
- ✅ No hay cookies o tracking

### Recomendaciones de Privacidad:
1. ✅ El servidor debería usar HTTPS (ya implementado)
2. ⚠️ Documentar claramente qué datos se envían al servidor
3. ⚠️ Si el servidor hace logging, debe ser transparente

---

## Análisis del Código Fuente

### Buenas Prácticas Implementadas:
- ✅ No usa `eval()` o `Function()` constructor
- ✅ No ejecuta comandos shell
- ✅ No accede al filesystem
- ✅ Manejo de errores adecuado
- ✅ Usa `encodeURIComponent()` para escapar IDs
- ✅ Valida respuestas HTTP antes de procesar
- ✅ No hay hardcoded credentials
- ✅ Código simple y auditable (345 líneas)

### Áreas de Mejora:
1. **Validación de URL**: Verificar formato y protocolo
2. **Timeout**: No hay timeout en requests (puede colgar)
3. **Rate Limiting**: No hay protección contra abuso
4. **Input Sanitization**: Podría validar más estrictamente los inputs

---

## Riesgos Específicos de Latch

### ⚠️ Exposición de Información Corporativa

**Problema Actual**:
El código y documentación mencionan explícitamente "Latch" en varios lugares:

```javascript
// index.js línea 319-320
mcp-http-client https://latch-support-mcp.railway.app
mcp-http-client https://door-support-mcp.railway.app
```

**Implicaciones**:
- 🔴 Cualquier persona que inspeccione el paquete NPM puede ver:
  - Que es para documentación de Latch/Door
  - Las URLs de tus servidores Railway
  - Que hay 225 documentos disponibles
  - La estructura de la API

**Información Expuesta**:
1. **En el código**: URLs de ejemplo con latch-support-mcp.railway.app
2. **En README.md**: Descripción completa del uso con Latch
3. **En examples/**: Configuración con URLs de Latch y Door
4. **En npm metadata**: Keywords incluyen referencias a conocimiento base

### ¿Es esto un riesgo de seguridad?

**Depende de tu modelo de amenaza**:

#### 🟢 NO es riesgo si:
- La documentación de Latch/Door es pública de todas formas
- No hay información confidencial en los documentos
- El servidor solo sirve documentación de soporte pública
- Usas esto como herramienta open-source pública

#### 🔴 SÍ es riesgo si:
- No quieres que se sepa que estás exponiendo esta data
- Los documentos contienen información propietaria
- Quieres ocultar la existencia del servicio
- Hay información sensible sobre arquitectura interna
- Competidores podrían usar esta información

---

## Recomendaciones de Seguridad

### Prioridad Alta (Implementar Ya)

1. **Forzar HTTPS para servidores remotos**:
```javascript
if (!serverUrl.startsWith('https://') &&
    !serverUrl.startsWith('http://localhost') &&
    !serverUrl.startsWith('http://127.0.0.1')) {
  throw new Error('Only HTTPS URLs are allowed for remote servers');
}
```

2. **Agregar timeout a requests**:
```javascript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000);
const response = await fetch(url, { signal: controller.signal });
clearTimeout(timeout);
```

3. **Eliminar referencias a Latch del código de ejemplo** (si quieres mantener privacidad):
```javascript
// Cambiar ejemplos a genéricos
mcp-http-client https://your-mcp-server.example.com
```

### Prioridad Media (Considerar)

4. **Validar formato de URL**:
```javascript
try {
  new URL(serverUrl);
} catch {
  throw new Error('Invalid URL format');
}
```

5. **Agregar rate limiting cliente-side**:
```javascript
// Prevenir spam de requests
const requestDelay = 100; // ms entre requests
```

6. **Versionar el package.json para separar info sensible**:
- Crear versión pública sin referencias a Latch
- Mantener versión privada con ejemplos específicos

### Prioridad Baja (Opcional)

7. **Agregar telemetría opcional** (con opt-in explícito)
8. **Implementar caché local** para reducir requests
9. **Agregar soporte para autenticación** (API keys)

---

## Análisis de Modelo de Amenaza

### Atacantes Potenciales:

#### 1. Usuario Malicioso
**Objetivo**: Usar el cliente para atacar otros servicios
**Capacidad**: Baja (solo puede hacer GET requests a URL que él configura)
**Mitigación**: Forzar HTTPS, no seguir redirects

#### 2. Servidor Comprometido
**Objetivo**: Enviar respuestas maliciosas al cliente
**Capacidad**: Media (control total sobre respuestas)
**Mitigación**:
- ✅ Ya implementado: No ejecutar código de respuestas
- ⚠️ Falta: Validar schema de respuestas

#### 3. Network Attacker (MITM)
**Objetivo**: Interceptar queries y respuestas
**Capacidad**: Alta (si es HTTP), Baja (si es HTTPS)
**Mitigación**: Forzar HTTPS

#### 4. Competidor / Curiosos
**Objetivo**: Descubrir qué información está expuesta
**Capacidad**: Alta (paquete es público en NPM)
**Mitigación**: Limpiar referencias corporativas del código

---

## Conclusiones

### ✅ El Cliente es Seguro Para:
- Uso en Claude Desktop
- Conectar a servidores de confianza
- Acceder a documentación no sensible
- Deployment público como herramienta open-source

### ⚠️ Considerar Riesgos de:
- Exposición de URLs de servidores internos en código público
- Revelación de arquitectura y capacidades del sistema
- MITM si se permite HTTP (fácil de mitigar)
- Falta de autenticación (si el servidor es privado)

### 🔴 NO Usar Para:
- Acceder a información altamente confidencial sin autenticación
- Exponer servicios internos sin control de acceso
- Comunicación sobre HTTP en redes no confiables

---

## Checklist de Seguridad

**Antes de usar en producción**:
- [ ] Forzar HTTPS para servidores remotos
- [ ] Agregar timeouts a requests
- [ ] Validar formato de URLs
- [ ] Remover referencias corporativas del código (si aplica)
- [ ] Ejecutar `npm audit` y resolver vulnerabilidades
- [ ] Documentar qué datos se envían al servidor
- [ ] Implementar rate limiting en el servidor
- [ ] Considerar autenticación para servidores privados
- [ ] Hacer security headers review del servidor
- [ ] Implementar logging en el servidor (para detección de abusos)

**Para versión pública limpia**:
- [ ] Remover todos los ejemplos con "latch" y "door"
- [ ] Usar URLs genéricas en documentación
- [ ] Remover tu nombre/email si quieres anonimidad
- [ ] Actualizar keywords en package.json (remover referencias específicas)
- [ ] Limpiar PUBLISH_TO_NPM.md de URLs específicas

---

## Veredicto Final

**Rating de Seguridad**: 🟢 8/10

El cliente es fundamentalmente seguro y bien diseñado. Los riesgos principales son:
1. Exposición de información corporativa (fácil de mitigar)
2. Falta de HTTPS enforcement (5 líneas de código)
3. Sin timeouts (fácil de agregar)

**Recomendación**: ✅ **APROBAR** con implementación de mejoras de prioridad alta.

---

## Notas Adicionales

### Para Compliance:
- No procesa datos personales (GDPR compliant si el servidor también lo es)
- No almacena datos localmente
- No hace tracking de usuarios
- Código completamente auditable (open source)

### Para InfoSec:
- Surface area mínima
- No requiere permisos especiales
- No elevation of privileges
- Read-only operations
- Stateless client

---

**Última Actualización**: 2025-10-15
**Próxima Revisión**: Después de implementar cambios de prioridad alta
