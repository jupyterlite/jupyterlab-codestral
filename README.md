# jupyterlab-codestral

[![Github Actions Status](https://github.com/jupyterlite/jupyterlab-codestral/workflows/Build/badge.svg)](https://github.com/jupyterlite/jupyterlab-codestral/actions/workflows/build.yml)
[![lite-badge](https://jupyterlite.rtfd.io/en/latest/_static/badge.svg)](https://jupyterlite.github.io/jupyterlab-codestral/lab/index.html)

AI code completions and chat for JupyterLab, Notebook 7 and JupyterLite, powered by MistralAI ✨

[a screencast showing the Codestral extension in JupyterLite](https://github.com/jupyterlite/jupyterlab-codestral/assets/591645/b63a84de-32bf-449c-8b48-7d71494b88b9)

## Requirements

- JupyterLab >= 4.1.0 or Notebook >= 7.1.0

> [!WARNING]
> This extension is still very much experimental. It is not an official MistralAI extension.
> It is exploring the integration of the MistralAI API with JupyterLab, which can also be used in [JupyterLite](https://jupyterlite.readthedocs.io/).
> For a more complete AI extension for JupyterLab, see [Jupyter AI](https://github.com/jupyterlab/jupyter-ai).

## ✨ Try it in your browser ✨

You can try the extension in your browser using JupyterLite:

[![lite-badge](https://jupyterlite.rtfd.io/en/latest/_static/badge.svg)](https://jupyterlite.github.io/jupyterlab-codestral/lab/index.html)

See the [Usage](#usage) section below for more information on how to provide your API key.

## Install

To install the extension, execute:

```bash
pip install jupyterlab-codestral
```

# Usage

1. Go to https://console.mistral.ai/api-keys/ and create an API key.

![Screenshot showing how to create an API key](./img/1-api-key.png)

2. Open the JupyterLab settings and go to the Codestral section to enter the API key

![Screenshot showing how to add the API key to the settings](./img/2-jupyterlab-settings.png)

3. Open the chat, or use the inline completer

![Screenshot showing how to use the chat](./img/3-usage.png)

## Uninstall

To remove the extension, execute:

```bash
pip uninstall jupyterlab-codestral
```

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jupyterlab_codestral directory
# Install package in development mode
pip install -e "."
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall jupyterlab-codestral
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `jupyterlab-codestral` within that folder.

### Packaging the extension

See [RELEASE](RELEASE.md)
