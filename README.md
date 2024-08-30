# SPFYUI

## Why spfyui ?

- _**SpfyUI** solves the *problem* of *limited icon sets* and *bloated packages* in React projects by letting you dynamically add icons or UI components from various providers as needed, avoiding unnecessary codebase clutter._
- ### Key Benefits
  - Dynamic Integration
  - Reduced Bloat
  - Unified Interface

### Preview

![preview](./spfyui.gif)

## How to you the beta version ?

- This project has not been fully completed but if you like to try or contribute, you can follow the following steps:
  > Note I will be showing you how to do on linux, but it's pretty straight forward.
  >
  > -- 1. Clone the repo.

```sh
git clone https://github.com/thekbbohara/spfy-ui.git
```

-- 2. Change directory to spfyui.

```sh
cd spfyui
```

-- 3. Compile ts code to js.

```sh
tsc
```

-- 4. Create an alias to run the compiled code.

```sh
vim ~/.zshrc # your shell configuration file
```

And at the end of the file add alias `alias spfyui='node path/to/spfyui/dist/index.js'`

---

Hooray you are all set now you can create a react project and use spfyui.

_Example:_
-- `spfyui init` This sets up necessary utils files and path to icon dir inside src/assets
-- you can download any svg icon from general category : [Icons/general](https://icon-sets.iconify.design/?category=General)
-- `spfyui add ri:github-line`

## TODOs

- [x] Add `add` Feature: Implemented the functionality to add icons or components.
- [x] extend `add` Feature: Support to svg icons with multiple path data.
- [x] Add `init` Command: Set up the initial project configuration.
- [ ] Add `rm` Feature: Implement functionality to remove icons or components.
- [x] Add Listing Commands:
  - [x] `list`: List all installed icons in the current project.
  - [x] `list <povider>`: List all installed icons by provider.
  - [x] `list -g`: List all installed icons globally.
- [ ] Add support to emojies.
- [ ] Add Component Support: Extend functionality to support UI components
