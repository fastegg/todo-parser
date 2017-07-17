'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ToDoItem } from './todo';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const todoTree = new ToDoTree();
    const watcher = vscode.workspace.createFileSystemWatcher('**/*.[tj]s?');

    watcher.onDidChange((uri) => {
        console.log('changed', uri);
        todoTree.checkFile(uri);
    });

    watcher.onDidCreate((uri) => {
        console.log('created', uri);
        todoTree.checkFile(uri);
    });

    watcher.onDidDelete((uri) => {
        todoTree.clearFile(uri);
    });

    vscode.window.registerTreeDataProvider('todo-list', todoTree);

    vscode.commands.registerCommand('todo.goto', async function goto(uri, selection) {
		const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc);

        vscode.window.activeTextEditor.selection = selection;
	});
}

const commentRegex = /\/([/*])\s*todo:?(\(\w+\))?:?(.*)/;
const multiLineEnd = /\*\//;
class ToDoTree implements vscode.TreeDataProvider<ToDoItem> {
    constructor() {}

    private _onDidChangeTreeData: vscode.EventEmitter<ToDoItem | undefined> = new vscode.EventEmitter<ToDoItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<ToDoItem | undefined> = this._onDidChangeTreeData.event;
    private todos: any = {};
    public refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    public goTo(uri, line) {
        console.log('goto line ' + line + ' of file ' + uri.toString());
    }

    public async checkFile(uri) {
        const doc = await vscode.workspace.openTextDocument(uri);
        const text = doc.getText().split('\n');

        const found: ToDoItem[] = [];
        
        for (let i=0;i<text.length;i++) {
            const match = text[i].match(commentRegex);
            
            if (match) {
                const todoItem = new ToDoItem(match[3].trim(), uri, i);
                todoItem.command = {
                    command: 'todo.goto',
                    title: 'go to todo',
                    arguments: [uri, new vscode.Selection(new vscode.Position(i, text[i].indexOf(match[0])), new vscode.Position(i, text[i].indexOf(match[0])))],
                }
                found.push(todoItem);

                if (match[1] === '*') {
                    let end = text[i].match(multiLineEnd);
                    while (!end && i<text.length) {
                        i++;
                        end = text[i].match(multiLineEnd);
                    }
                }
            }
        }

        if (found.length) {
            this.todos[uri.fsPath] = found;
        } else if (this.todos[uri.fsPath]) {
            delete this.todos[uri.fsPath];
        }
        this.refresh();
    }

    public clearFile(uri: vscode.Uri): void {
        delete this.todos[uri.fsPath];
        this.refresh();
    }

    public getChildren(element? : ToDoItem): Thenable<ToDoItem[]> {
        return new Promise(resolve => {
            let rtn: ToDoItem[] = [];
            for (const i in this.todos) {
                rtn = rtn.concat(this.todos[i]);
            }
            resolve(rtn);
        });
    }

    getTreeItem(element: ToDoItem): vscode.TreeItem {
		return element;
	}
}

// this method is called when your extension is deactivated
export function deactivate() {
}