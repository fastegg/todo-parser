import * as vscode from 'vscode';
import * as path from 'path';

export class ToDoItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly uri?: vscode.Uri,
    public readonly line?: number,
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
  }

  iconPath = {
		light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'dependency.svg')
	};

  contextValue: 'todo context';
}