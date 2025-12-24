/* global Word */

import { PlatformDetector } from '../utils/PlatformDetector';

export interface EditOperation {
  type: 'insert' | 'replace' | 'format' | 'delete' | 'addParagraph';
  content?: string;
  position?: 'start' | 'end' | number;
  format?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    fontSize?: number;
    fontColor?: string;
  };
  searchText?: string;
  replaceText?: string;
}

export class WordEditor {
  /**
   * 获取当前文档的全部内容
   */
  static async getDocumentContent(): Promise<string> {
    // 检查平台兼容性
    if (!PlatformDetector.isOfficeJSAvailable() && PlatformDetector.isWPS()) {
      // WPS可能使用不同的API，这里尝试兼容处理
      console.warn('WPS环境：尝试使用Office.js API');
    }

    return new Promise((resolve, reject) => {
      try {
        if (typeof Word === 'undefined') {
          reject(new Error('Word API不可用，请确保在Word或WPS环境中运行'));
          return;
        }

        Word.run(async (context) => {
          try {
            const body = context.document.body;
            body.load('text');
            await context.sync();
            resolve(body.text);
          } catch (error) {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 应用编辑操作
   */
  static async applyEdits(edits: EditOperation[]): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (typeof Word === 'undefined') {
          reject(new Error('Word API不可用，请确保在Word或WPS环境中运行'));
          return;
        }

        Word.run(async (context) => {
          try {
            for (const edit of edits) {
              await this.applyEdit(context, edit);
            }
            await context.sync();
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 应用单个编辑操作
   */
  private static async applyEdit(context: Word.RequestContext, edit: EditOperation): Promise<void> {
    const body = context.document.body;

    switch (edit.type) {
      case 'insert':
        if (edit.position === 'start') {
          body.insertText(edit.content || '', Word.InsertLocation.start);
        } else if (edit.position === 'end') {
          body.insertText(edit.content || '', Word.InsertLocation.end);
        } else if (typeof edit.position === 'number') {
          // 在指定位置插入（简化处理，实际可能需要更复杂的定位）
          body.insertText(edit.content || '', Word.InsertLocation.end);
        } else {
          body.insertText(edit.content || '', Word.InsertLocation.end);
        }
        break;

      case 'replace':
        if (edit.searchText && edit.replaceText) {
          const searchResults = body.search(edit.searchText, { matchCase: false });
          searchResults.load('items');
          await context.sync();
          
          searchResults.items.forEach((result) => {
            result.insertText(edit.replaceText || '', Word.InsertLocation.replace);
          });
        }
        break;

      case 'format':
        if (edit.searchText) {
          const searchResults = body.search(edit.searchText, { matchCase: false });
          searchResults.load('items');
          await context.sync();
          
          searchResults.items.forEach((result) => {
            const font = result.font;
            if (edit.format?.bold !== undefined) {
              font.bold = edit.format.bold;
            }
            if (edit.format?.italic !== undefined) {
              font.italic = edit.format.italic;
            }
            if (edit.format?.underline !== undefined) {
              font.underline = edit.format.underline ? Word.UnderlineType.single : Word.UnderlineType.none;
            }
            if (edit.format?.fontSize) {
              font.size = edit.format.fontSize;
            }
            if (edit.format?.fontColor) {
              font.color = edit.format.fontColor;
            }
          });
        }
        break;

      case 'delete':
        if (edit.searchText) {
          const searchResults = body.search(edit.searchText, { matchCase: false });
          searchResults.load('items');
          await context.sync();
          
          searchResults.items.forEach((result) => {
            result.delete();
          });
        }
        break;

      case 'addParagraph':
        const paragraph = body.insertParagraph(edit.content || '', Word.InsertLocation.end);
        if (edit.format) {
          const font = paragraph.font;
          if (edit.format.bold !== undefined) {
            font.bold = edit.format.bold;
          }
          if (edit.format.italic !== undefined) {
            font.italic = edit.format.italic;
          }
          if (edit.format.fontSize) {
            font.size = edit.format.fontSize;
          }
          if (edit.format.fontColor) {
            font.color = edit.format.fontColor;
          }
        }
        break;
    }
  }

  /**
   * 在文档末尾添加文本
   */
  static async appendText(text: string, format?: EditOperation['format']): Promise<void> {
    return this.applyEdits([{
      type: 'addParagraph',
      content: text,
      format,
    }]);
  }

  /**
   * 替换文本
   */
  static async replaceText(searchText: string, replaceText: string): Promise<void> {
    return this.applyEdits([{
      type: 'replace',
      searchText,
      replaceText,
    }]);
  }

  /**
   * 格式化文本
   */
  static async formatText(searchText: string, format: EditOperation['format']): Promise<void> {
    return this.applyEdits([{
      type: 'format',
      searchText,
      format,
    }]);
  }

  /**
   * 获取当前选中的文本
   */
  static async getSelectedText(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        if (typeof Word === 'undefined') {
          reject(new Error('Word API不可用，请确保在Word或WPS环境中运行'));
          return;
        }

        Word.run(async (context) => {
          try {
            // 获取当前选择
            const selection = context.document.getSelection();
            selection.load('text');
            await context.sync();
            
            const selectedText = selection.text.trim();
            resolve(selectedText);
          } catch (error) {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 清除文档中的选中状态
   */
  static async clearSelection(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (typeof Word === 'undefined') {
          reject(new Error('Word API不可用，请确保在Word或WPS环境中运行'));
          return;
        }

        Word.run(async (context) => {
          try {
            // 获取当前选择
            const selection = context.document.getSelection();
            // 将选择折叠到结束位置（清除选中，光标停留在原位置）
            selection.collapse(Word.CollapseDirection.end);
            await context.sync();
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 设置选择变化监听器
   * @param callback 当选择变化时调用的回调函数
   * @returns 清理函数，用于移除监听器
   */
  static setupSelectionChangedListener(callback: (hasSelection: boolean, selectedText: string) => void): () => void {
    if (typeof Word === 'undefined') {
      console.warn('Word API不可用，无法设置选择监听器');
      return () => {};
    }

    const checkSelection = async () => {
      try {
        const selectedText = await this.getSelectedText();
        const hasSelection = Boolean(selectedText && selectedText.trim().length > 0);
        callback(hasSelection, hasSelection ? selectedText : '');
      } catch (error) {
        // 忽略错误
        callback(false, '');
      }
    };

    // 使用更频繁的检查来模拟选择变化监听
    // 注意：Office.js 的 SelectionChanged 事件在某些版本中可能不可用
    // 所以使用轮询方式
    const intervalId = setInterval(checkSelection, 300);

    // 立即检查一次
    checkSelection();

    // 返回清理函数
    return () => {
      clearInterval(intervalId);
    };
  }
}

