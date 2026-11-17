# Publicar SendClear con EAS (en la otra compu)

Sirve para que el profesor abra la app en Expo Go **sin tu ayuda y sin que tu compu esté prendida**, como pide la rúbrica.

## Necesitas
- Node.js 22 o más nuevo: [nodejs.org](https://nodejs.org)
- Una cuenta gratis en [expo.dev](https://expo.dev/signup)
- Expo Go en el celular (App Store / Google Play)
- El archivo `.env` con la contraseña y el PIN de prueba. Ya viene dentro del zip; no lo subas a GitHub.

## Pasos
Abre una terminal dentro de la carpeta `sendclear` y corre estos comandos en orden.

1. Instala las dependencias:
```bash
npm install
```

2. Comprueba que todo pasa (deben salir 13 tests, 0 fallos):
```bash
npm test
```

3. Inicia sesión con tu cuenta de Expo:
```bash
npx eas-cli@latest login
```

4. Crea el proyecto en tu cuenta. Contesta **Yes** cuando pregunte si quieres crearlo:
```bash
npx eas-cli@latest init
```

5. Configura las actualizaciones. Agrega `expo-updates` y cambia `app.json`:
```bash
npx eas-cli@latest update:configure
```

   Después revisa `app.json`: `runtimeVersion` debe decir `"policy": "sdkVersion"` (si dice `appVersion`, cámbialo; Expo Go solo abre actualizaciones con runtime `exposdk:58.0.0`).

   Si la carpeta no es un repo de git, antes de los pasos 5 y 6 corre `$env:EAS_NO_VCS='1'` en PowerShell, y al paso 6 agrégale `--environment production`.

6. Publica la app:
```bash
npx eas-cli@latest update --branch main --message "Final project"
```

7. Al terminar, el comando imprime un link a expo.dev. Ábrelo y entra a la actualización. Toca **Preview** para ver el **QR**. Escanéalo con Expo Go en tu celular y prueba que abre y que puedes entrar con Ana (5550000001).

8. Pon en Blackboard:
   - el link o el QR de la actualización,
   - la contraseña y el PIN que están en `.env` (solo en Blackboard, nunca en el repo).

## Si el QR no abre en Expo Go
Plan B, que funciona seguro pero requiere tu compu prendida:
```bash
npx expo start --tunnel
```
Comparte el QR que aparece. La app funciona mientras esa terminal siga abierta.

## Después de publicar
Si cambias algo del código, repite solo el paso 6. El mismo link muestra la versión nueva.

Haz commit de los cambios que dejaron los pasos 4 y 5 (`app.json`, `package.json`):
```bash
git add -A
```
```bash
git commit -m "Configure EAS Update"
```
