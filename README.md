# JAC Hub

Proyecto monorepo para la app web JAC Hub.

## Estructura

- `artifacts/jac-hub/` — frontend en Vite + React
- `artifacts/api-server/` — backend API
- `lib/` — bibliotecas compartidas
- `scripts/` — utilidades del repositorio

## Cómo ejecutar localmente

1. Instalar dependencias:
   ```powershell
   pnpm install
   ```

2. Iniciar frontend:
   ```powershell
   pnpm --filter @workspace/jac-hub dev
   ```

3. (Opcional) Iniciar el backend desde `artifacts/api-server`:
   ```powershell
   cd artifacts/api-server
   pnpm dev
   ```

## Repositorio GitHub

- URL: https://github.com/JACcompany/JacHub

## Sitio en vivo

- URL: https://jaccompany.github.io/JacHub/

> El despliegue se hará automáticamente cada vez que empujes a `main`.

## Notas

- Usa `pnpm` como gestor de paquetes.
- La aplicación está en `artifacts/jac-hub`.
