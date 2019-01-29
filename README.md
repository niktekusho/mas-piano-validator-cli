# MAS Piano Songs Validator (CLI)

[![Build Status](https://travis-ci.org/niktekusho/mas-piano-validator-cli.svg?branch=master)](https://travis-ci.org/niktekusho/mas-piano-validator-cli)

This repository contains the CLI application to validate the piano files used in the DDLC Mod ["Monika After Story"](https://github.com/Monika-After-Story/MonikaModDev).

You can find the corresponding core library [here](https://github.com/niktekusho/mas-piano-validator). 

## Introduction

In MAS you can play the piano to Monika and, depending on **how** the songs are *described*, she reacts to the song played.

The mod recognizes all piano songs by parsing JSON formatted files.

This application allows you to validate the *structure* of the songs you are working on.

**This project does not aim to check for the actual correctness of the song you are authoring.** 

## Installation

**Note:** to use this CLI application, you have to have installed [Node.js](https://nodejs.org/) and a console you can run commands into. The **minimum required version** of Node.js is: [8 - codename "Carbon"](https://github.com/nodejs/Release#release-schedule).

In your console, run the following command:

```sh
$ npm install -g mas-piano-validator-cli
```

[![Install animation](./assets/install.gif)](./assets/install.gif)

## Usage

In your console, all the following commands print the help of the module:

-   `$ mas-piano-validator-cli --help`
-   `$ mas-piano-validator --help`
-   `$ maspv -h`

[![Usage animation](./assets/examples.gif)](./assets/examples.gif)

The command requires at least one path, but of course, you can specify more.
Each path can point to a directory containing MAS's Piano songs (JSON format) or to a single JSON file.

**Note**: if you pass a directory, this application **does recurse on sub-directories**.

## Related

-   [core library](https://github.com/niktekusho/mas-piano-validator).


