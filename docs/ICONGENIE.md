# Icon Genie CLI en el proyecto

[Quasar Icon Genie](https://quasar.dev/icongenie/installation) genera iconos y splash screens para la app a partir de una imagen fuente.

## Por qué el comando no se reconocía

Si instalaste Icon Genie **globalmente** con `yarn global add @quasar/icongenie`, el comando `icongenie` está en el directorio global de Yarn. Ese directorio debe estar en tu `PATH`.

### Opción A: Arreglar el PATH (para uso global)

Añade esta línea a tu `~/.bashrc` o `~/.zshrc`:

```bash
export PATH="$(yarn global bin):$PATH"
```

Luego ejecuta `source ~/.bashrc` (o `source ~/.zshrc`) o abre una nueva terminal.

En Linux, la ruta suele ser `/home/tu-usuario/.yarn/bin`.

### Opción B: Usar los scripts del proyecto (recomendado)

En este proyecto **Icon Genie está como dependencia de desarrollo**. No necesitas instalación global ni tocar el PATH.

- **Ver ayuda:** `yarn icongenie -- --help`
- **Generar iconos (modo SPA):**  
  `yarn icongenie:generate -- -i <ruta-al-icono.png> -m spa`
- **Verificar iconos:** `yarn icongenie:verify`

Ejemplo con un icono en el proyecto:

```bash
# Usar el favicon existente como fuente (mínimo 64x64; mejor 1024x1024)
yarn icongenie:generate -- -i ./public/icons/favicon-128x128.png -m spa
```

Requisitos del icono fuente (según [documentación](https://quasar.dev/icongenie/installation)):

- Formato **PNG** con transparencia
- Mínimo **64×64 px** (recomendado **1024×1024 px**)
- Preferiblemente cuadrado

Opcional para splash screens:

- `-b <ruta-al-fondo.png>` — imagen de fondo para splash
- `--splashscreen-icon-ratio 40` — tamaño del icono sobre el fondo (0–100)

Después de generar, Icon Genie indicará qué etiquetas usar en `index.html` si algo cambia.
