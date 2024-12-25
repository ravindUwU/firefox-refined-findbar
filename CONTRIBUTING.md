# Contributing

## Tools

- This project uses [PNPM](https://pnpm.io/).

- Consider using [Visual Studio Code](https://code.visualstudio.com/) to make your changes. The repo
  includes a [workspace configuration](./.vscode/) that runs [Prettier](https://prettier.io/) on
  save.

  If you prefer to use a different text editor, please run the `pretty` script and resolve any
  issues reported before committing your changes.

## Scripts

| Name     | Description                                                                                     |
| -------- | ----------------------------------------------------------------------------------------------- |
| `build`  | Compile the SCSS to the `./dist` folder.                                                        |
| `watch`  | Similar to build, but compile every time the SCSS changes.                                      |
| `clean`  | Clean the build output.                                                                         |
| `site`   | Starts an HTTP server at the root of the project. View the site at http://localhost:8080/docs/. |
| `pretty` | Run Prettier.                                                                                   |
