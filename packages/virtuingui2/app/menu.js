// @flow
import { app, Menu, shell, BrowserWindow, dialog } from 'electron';
import prompt from 'electron-prompt';
import http from 'http';
import path from 'path';
import fs from 'fs';
import url from 'url';

import TaskDelegator from './server/taskDelegator';

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu() {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.openDevTools();
    this.mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.inspectElement(x, y);
          }
        }
      ]).popup(this.mainWindow);
    });
  }

  buildDarwinTemplate() {
    const subMenuAbout = {
      label: 'Virtuin',
      submenu: [
        {
          label: 'About Virtuin',
          selector: 'orderFrontStandardAboutPanel:'
        },
        { type: 'separator' },
        { label: 'Services', submenu: [] },
        { type: 'separator' },
        {
          label: 'Hide Virtuin',
          accelerator: 'Command+H',
          selector: 'hide:'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:'
        },
        { label: 'Show All', selector: 'unhideAllApplications:' },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            TaskDelegator.stop().then(() =>
              {
                app.quit();
              }).catch(e => {
                app.quit();
              })
          }
        }
      ]
    };
    const subMenuFile = {
      label: 'Collection',
      submenu: [
        {
          label: 'Load Collection File',
          accelerator: 'Command+L',
          click: () => {
            const collectionPaths = dialog.showOpenDialog({ properties: ['openFile'], filters: [{name: 'yaml', extensions: ['yml']}] })
            if (collectionPaths == null || collectionPaths.length < 1) return; // stop if cancelled selecting file
            try {
              const collectionDefUrl = new URL(`file://${collectionPaths[0]}`);
              TaskDelegator.reinit(collectionDefUrl).then(() => {

              }).catch(error => {
                console.error(`could not reinitialize ${error}`);
              });
            } catch(error) {
              console.error(`could not parse passed file ${collectionPaths[0]}\nError ${error}`);
            }
          }
        },
        {
          label: 'Load Collection URL',
          accelerator: 'Command+Shift+L',
          click: () => {
            prompt({
              title: 'Load Collection from http/https URL',
              label: 'URL:',
              value: 'http://example.org/collection.yml',
              inputAttrs: {
                  type: 'url'
              }
            })
            .then(selURL => {
              if (selURL == null) return;
              try {
                const collectionDefUrl = new URL(selURL);
                TaskDelegator.reinit(collectionDefUrl).then(() => {

                }).catch(error => {
                  console.error(`could not reinitialize ${error}`);
                });
              } catch(error) {
                console.error(`invalid url passed`);
              }
            })
            .catch(console.error);
          }
        }, {
          label: 'Reload Collection',
          accelerator: 'Command+Shift+R',
          click: () => {
            if (!TaskDelegator.isCollectionLoaded()) return;
            TaskDelegator.reloadCollection();
          }
        }, {
          label: 'Down Collection',
          accelerator: 'Command+D',
          click: () => {
            if (!TaskDelegator.isCollectionLoaded()) return;
            TaskDelegator.stop();
          }
        },
      ]
    };
    const subMenuEdit = {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:'
        }
      ]
    };
    const subMenuDev = {
      label: 'Developer',
      submenu: [
        {
          label: 'Bash in Service',
          accelerator: 'Command+B',
          click: () => {
            if (!TaskDelegator.isCollectionLoaded()) {
              dialog.showMessageBox({ title: 'Virtuin', message:'No collection loaded',
                detail: "Once a collection is running you can bash into one of your docker services using this menu item as a guide" })
              return;
            }

            const collpath = path.normalize(TaskDelegator.stackPath + path.sep + TaskDelegator.dispatcher.composeName())
            const message = `cd "${collpath}"\ndocker-compose exec [service-name] bash`;
            const detail = `${message}\nList of services: \n${Object.keys(TaskDelegator.dispatcher.collectionDef.dockerCompose.source.services).reduce((acc,key) => `${acc}\n${key}`)}`;
            dialog.showMessageBox({ title: 'Virtuin', message:'To run bash in your services', detail })

          }
        },
      ]
    };
    const subMenuViewDev = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload();
          }
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.toggleDevTools();
          }
        }
      ]
    };
    const subMenuViewProd = {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          }
        }
      ]
    };
    const subMenuWindow = {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:'
        },
        { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
        { type: 'separator' },
        { label: 'Bring All to Front', selector: 'arrangeInFront:' }
      ]
    };
    const subMenuHelp = {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            shell.openExternal('http://electron.atom.io');
          }
        },
        {
          label: 'Documentation',
          click() {
            shell.openExternal(
              'https://github.com/atom/electron/tree/master/docs#readme'
            );
          }
        },
        {
          label: 'Community Discussions',
          click() {
            shell.openExternal('https://discuss.atom.io/c/electron');
          }
        },
        {
          label: 'Search Issues',
          click() {
            shell.openExternal('https://github.com/atom/electron/issues');
          }
        }
      ]
    };

    const subMenuView =
      process.env.NODE_ENV === 'development' ? subMenuViewDev : subMenuViewProd;

    return [subMenuAbout, subMenuFile, subMenuEdit, subMenuDev ,subMenuView, subMenuWindow, subMenuHelp];
  }

  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: '&File',
        submenu: [
          {
            label: 'Load Collection File',
            accelerator: 'Ctrl+L',
            click: () => {
              const collectionPaths = dialog.showOpenDialog({ properties: ['openFile'], filters: [{name: 'yaml', extensions: ['yml']}] })
              if (collectionPaths == null || collectionPaths.length < 1) return; // stop if cancelled selecting file
              try {
                const collectionDefUrl = new URL(`file://${collectionPaths[0]}`);
                TaskDelegator.reinit(collectionDefUrl).then(() => {

                }).catch(error => {
                  console.error(`could not reinitialize ${error}`);
                });
              } catch(error) {
                console.error(`could not parse passed file ${collectionPaths[0]}\nError ${error}`);
              }
            }
          },
          {
            label: 'Load Collection URL',
            accelerator: 'Ctrl+Alt+L',
            click: () => {
              prompt({
                title: 'Load Collection from http/https URL',
                label: 'URL:',
                value: 'http://example.org/collection.yml',
                inputAttrs: {
                    type: 'url'
                }
              })
              .then(selURL => {
                if (selURL == null) return;
                const collectionDefUrl = new URL(selURL);
                TaskDelegator.reinit(collectionDefUrl).then(() => {

                }).catch(error => {
                  console.error(`could not reinitialize ${error}`);
                });
              })
              .catch(console.error);
            }
          }, {
            label: 'Reload Collection',
            accelerator: 'Ctrl+Alt+R',
            click: () => {
              if (!TaskDelegator.isCollectionLoaded()) return;
              TaskDelegator.reloadCollection();
            }
          }, {
            label: 'Down Collection',
            accelerator: 'Ctrl+D',
            click: () => {
              if (!TaskDelegator.isCollectionLoaded()) return;
              TaskDelegator.stop();
            }
          },
        ]
      }, {
        label: 'Developer',
        submenu: [
          {
            label: 'Bash in Service',
            accelerator: 'Ctrl+B',
            click: () => {
              if (!TaskDelegator.isCollectionLoaded()) {
                dialog.showMessageBox({ title: 'Virtuin', message:'No collection loaded',
                  detail: "Once a collection is running you can bash into one of your docker services using this menu item as a guide" })
                return;
              }

              const collpath = path.normalize(TaskDelegator.stackPath + path.sep + TaskDelegator.dispatcher.composeName())
              const message = `cd "${collpath}"\ndocker-compose exec [service-name] bash`;
              const detail = `${message}\nList of services: \n${Object.keys(TaskDelegator.dispatcher.collectionDef.dockerCompose.source.services).reduce((acc,key) => `${acc}\n${key}`)}`;
              dialog.showMessageBox({ title: 'Virtuin', message:'To run bash in your services', detail })

            }
          },
        ]
      },
      {
        label: '&View',
        submenu:
          process.env.NODE_ENV === 'development'
            ? [
                {
                  label: '&Reload',
                  accelerator: 'Ctrl+R',
                  click: () => {
                    this.mainWindow.webContents.reload();
                  }
                },
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    );
                  }
                },
                {
                  label: 'Toggle &Developer Tools',
                  accelerator: 'Alt+Ctrl+I',
                  click: () => {
                    this.mainWindow.toggleDevTools();
                  }
                }
              ]
            : [
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    );
                  }
                }
              ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Learn More',
            click() {
              shell.openExternal('http://electron.atom.io');
            }
          },
          {
            label: 'Documentation',
            click() {
              shell.openExternal(
                'https://github.com/atom/electron/tree/master/docs#readme'
              );
            }
          },
          {
            label: 'Community Discussions',
            click() {
              shell.openExternal('https://discuss.atom.io/c/electron');
            }
          },
          {
            label: 'Search Issues',
            click() {
              shell.openExternal('https://github.com/atom/electron/issues');
            }
          }
        ]
      }
    ];
    return templateDefault;
  }
}
