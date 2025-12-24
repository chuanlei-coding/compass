/* global Word */

import { PlatformDetector } from '../utils/PlatformDetector';

export interface EditOperation {
  type: 'insert' | 'replace' | 'format' | 'delete' | 'addParagraph' | 'insertTable' | 'setHeading';
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
  // 表格相关参数
  tableRows?: number;
  tableColumns?: number;
  tableData?: string[][]; // 表格数据，二维数组，第一行通常是表头
  // 段落样式相关参数
  style?: 'Heading1' | 'Heading2' | 'Heading3' | 'Normal' | string; // 段落样式，用于标题
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
              try {
                await this.applyEdit(context, edit);
              } catch (editError) {
                // 记录每个编辑操作的详细错误信息
                const errorDetails = {
                  operationType: edit.type,
                  error: editError instanceof Error ? editError.message : String(editError),
                  errorStack: editError instanceof Error ? editError.stack : undefined,
                  operationData: {
                    content: edit.content?.substring(0, 50),
                    style: edit.style,
                    searchText: edit.searchText?.substring(0, 50),
                    tableRows: edit.tableRows,
                    tableColumns: edit.tableColumns
                  }
                };
                console.error(`❌ 执行编辑操作失败:`, errorDetails);
                // 继续执行其他操作，不中断
                console.warn(`⚠️ 跳过失败的操作，继续处理剩余操作`);
              }
            }
            await context.sync();
            resolve();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            console.error(`❌ 应用编辑操作时发生错误:`, {
              error: errorMessage,
              errorStack: errorStack,
              editsCount: edits.length
            });
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 获取 Office.js 内置样式枚举值（用于 styleBuiltIn 属性）
   */
  private static getStyleBuiltInEnum(style: string): any {
    // 尝试使用 Office.js 内置样式枚举
    // Office.js 的 Style 枚举值通常是整数或特定的字符串常量
    try {
      // 检查 Word.Style 或 Word.BuiltInStyle 是否存在
      if (typeof Word !== 'undefined') {
        // 尝试不同的可能路径
        const WordAny = Word as any;
        
        // 可能的枚举路径
        if (WordAny.Style) {
          const styleMap: Record<string, string> = {
            'Heading1': 'heading1',
            'Heading2': 'heading2',
            'Heading3': 'heading3',
            'Normal': 'normal',
            'Title': 'title'
          };
          
          const enumKey = styleMap[style] || 'heading2';
          if (WordAny.Style[enumKey] !== undefined) {
            return WordAny.Style[enumKey];
          }
        }
        
        // 或者尝试 BuiltInStyle
        if (WordAny.BuiltInStyle) {
          const styleMap: Record<string, string> = {
            'Heading1': 'heading1',
            'Heading2': 'heading2',
            'Heading3': 'heading3'
          };
          const enumKey = styleMap[style] || 'heading2';
          if (WordAny.BuiltInStyle[enumKey] !== undefined) {
            return WordAny.BuiltInStyle[enumKey];
          }
        }
      }
    } catch (e) {
      // 如果枚举不可用，返回 null，将使用字符串方式
      console.warn(`无法访问 Style 枚举: ${e}`);
    }
    return null;
  }

  /**
   * 获取 Office.js 内置样式名称（字符串格式，用于 style 属性）
   * 注意：不同语言版本的 Word 可能需要不同的样式名称
   */
  private static getBuiltInStyleName(style: string): string {
    // Office.js 使用内置样式名称，这里映射用户友好的名称到 Office.js 样式名称
    const styleMap: Record<string, string> = {
      'Heading1': 'Heading 1',
      'Heading2': 'Heading 2',
      'Heading3': 'Heading 3',
      'Normal': 'Normal',
      'Title': 'Title',
      'Subtitle': 'Subtitle'
    };
    
    // 如果已经在映射表中，返回映射值
    if (styleMap[style]) {
      return styleMap[style];
    }
    
    // 如果包含空格（如 "Heading 1"），直接返回
    if (style.includes(' ')) {
      return style;
    }
    
    // 默认返回 Heading 2
    return 'Heading 2';
  }
  

  /**
   * 应用单个编辑操作
   */
  private static async applyEdit(context: Word.RequestContext, edit: EditOperation): Promise<void> {
    console.log(`🔧 执行编辑操作: type=${edit.type}, content=${edit.content?.substring(0, 30) || 'N/A'}..., style=${edit.style || 'none'}`);
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
        
        // 先同步，确保段落已创建
        await context.sync();
        
        // 设置段落样式（如果指定）
        if (edit.style) {
          try {
            console.log(`📝 尝试设置段落样式: "${edit.style}"`);
            
            // 方法1: 尝试使用 styleBuiltIn（枚举方式，推荐，不依赖本地化）
            const styleEnum = this.getStyleBuiltInEnum(edit.style);
            const paraAny = paragraph as any;
            let styleSetSuccess = false;
            
            if (styleEnum !== null) {
              try {
                // 检查 styleBuiltIn 属性是否存在
                if ('styleBuiltIn' in paraAny) {
                  paraAny.styleBuiltIn = styleEnum;
                  console.log(`📝 尝试使用 styleBuiltIn: ${edit.style} -> ${styleEnum}`);
                  await context.sync();
                  console.log(`✅ 段落样式设置成功 (styleBuiltIn): "${edit.style}"`);
                  styleSetSuccess = true;
                }
              } catch (builtInError) {
                const builtInErrorMsg = builtInError instanceof Error ? builtInError.message : String(builtInError);
                console.warn(`⚠️ styleBuiltIn 设置失败: ${builtInErrorMsg}`);
              }
            }
            
            // 方法2: 如果 styleBuiltIn 不可用或失败，尝试使用 style 字符串
            if (!styleSetSuccess) {
              // 尝试不同的样式名称格式
              const styleVariations = [
                this.getBuiltInStyleName(edit.style),  // "Heading 2"
                edit.style.replace(/([A-Z])/g, ' $1').trim(), // "Heading2" -> "Heading 2"
                edit.style  // 原始值
              ];
              
              for (const styleName of styleVariations) {
                try {
                  console.log(`📝 尝试使用 style 字符串: "${styleName}"`);
                  paragraph.style = styleName;
                  await context.sync();
                  console.log(`✅ 段落样式设置成功 (style): "${styleName}"`);
                  styleSetSuccess = true;
                  break;
                } catch (styleError) {
                  const styleErrorMsg = styleError instanceof Error ? styleError.message : String(styleError);
                  console.warn(`⚠️ 样式名称 "${styleName}" 失败: ${styleErrorMsg}`);
                  // 继续尝试下一个
                }
              }
            }
            
            if (!styleSetSuccess) {
              console.error(`❌ 所有样式设置方法都失败了`);
              console.error(`❌ 请求样式: ${edit.style}`);
              console.error(`❌ 内容: ${edit.content?.substring(0, 50) || 'N/A'}`);
            }
          } catch (styleError) {
            const errorMsg = styleError instanceof Error ? styleError.message : String(styleError);
            const errorStack = styleError instanceof Error ? styleError.stack : undefined;
            console.error(`❌ 设置段落样式失败 - 请求样式: ${edit.style}, 错误: ${errorMsg}`);
            if (errorStack) {
              console.error(`❌ 错误堆栈: ${errorStack}`);
            }
            console.error(`❌ 内容: ${edit.content?.substring(0, 50) || 'N/A'}`);
            // 如果样式设置失败，只应用格式，不中断执行
          }
        }
        
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

      case 'setHeading':
        // 设置段落为标题样式
        if (edit.content) {
          // 如果指定了内容，在末尾插入并设置样式（优先使用这种方式）
          const para = body.insertParagraph(edit.content, Word.InsertLocation.end);
          await context.sync();
          
          try {
            const requestStyle = edit.style || 'Heading2';
            console.log(`📝 尝试设置标题样式: "${requestStyle}"`);
            
            // 尝试使用 styleBuiltIn（如果可用）
            const styleEnum = this.getStyleBuiltInEnum(requestStyle);
            const paraAny = para as any;
            
            if (styleEnum !== null && paraAny.styleBuiltIn !== undefined) {
              try {
                paraAny.styleBuiltIn = styleEnum;
                console.log(`📝 使用 styleBuiltIn 设置样式: ${requestStyle} -> ${styleEnum}`);
                await context.sync();
                console.log(`✅ 标题样式设置成功 (styleBuiltIn): "${requestStyle}"`);
              } catch (builtInError) {
                const builtInErrorMsg = builtInError instanceof Error ? builtInError.message : String(builtInError);
                console.warn(`⚠️ styleBuiltIn 失败 (${builtInErrorMsg})，尝试使用 style 字符串`);
                // 回退到 style 字符串
                const styleName = this.getBuiltInStyleName(requestStyle);
                para.style = styleName;
                await context.sync();
                console.log(`✅ 标题样式设置成功 (style): "${styleName}"`);
              }
            } else {
              // 使用 style 字符串属性
              const styleName = this.getBuiltInStyleName(requestStyle);
              console.log(`📝 使用 style 字符串设置样式: "${styleName}"`);
              para.style = styleName;
              await context.sync();
              console.log(`✅ 标题样式设置成功 (style): "${styleName}"`);
            }
          } catch (styleError) {
            const errorMsg = styleError instanceof Error ? styleError.message : String(styleError);
            const errorStack = styleError instanceof Error ? styleError.stack : undefined;
            console.error(`❌ 设置标题样式失败 - 请求样式: ${edit.style || 'Heading2'}, 错误: ${errorMsg}`);
            if (errorStack) {
              console.error(`❌ 错误堆栈: ${errorStack}`);
            }
            console.error(`❌ 内容: ${edit.content?.substring(0, 50) || 'N/A'}`);
            // 继续执行，不中断
          }
        } else if (edit.searchText) {
          // 通过搜索文本找到段落并设置样式
          const searchResults = body.search(edit.searchText, { matchCase: false });
          searchResults.load('items');
          await context.sync();
          
          if (searchResults.items.length > 0) {
            // 获取每个搜索结果所在的段落，并设置样式
            searchResults.items.forEach((result) => {
              result.paragraphs.load('items');
            });
            await context.sync();
            
            const styleName = this.getBuiltInStyleName(edit.style || 'Heading2');
            searchResults.items.forEach((result) => {
              if (result.paragraphs.items.length > 0) {
                try {
                  const para = result.paragraphs.items[0];
                  para.style = styleName;
                  context.sync(); // 同步样式设置
                } catch (styleError) {
                  const errorMsg = styleError instanceof Error ? styleError.message : String(styleError);
                  const errorStack = styleError instanceof Error ? styleError.stack : undefined;
                  console.error(`❌ 设置段落样式失败 (setHeading/searchText):`, {
                    requestedStyle: edit.style || 'Heading2',
                    mappedStyle: styleName,
                    error: errorMsg,
                    errorStack: errorStack,
                    searchText: edit.searchText?.substring(0, 50)
                  });
                }
              }
            });
            await context.sync();
          }
        }
        break;

      case 'insertTable':
        // 插入表格
        const rows = edit.tableRows || 3;
        const columns = edit.tableColumns || 4;
        const table = body.insertTable(rows, columns, Word.InsertLocation.end);
        
        // 如果有表格数据，填充表格
        if (edit.tableData && edit.tableData.length > 0) {
          table.rows.load('items');
          await context.sync();
          
          // 填充每一行的数据
          edit.tableData.forEach((rowData, rowIndex) => {
            if (rowIndex < table.rows.items.length) {
              const row = table.rows.items[rowIndex];
              row.cells.load('items');
            }
          });
          await context.sync();
          
          // 填充单元格内容
          edit.tableData.forEach((rowData, rowIndex) => {
            if (rowIndex < table.rows.items.length) {
              const row = table.rows.items[rowIndex];
              rowData.forEach((cellText, colIndex) => {
                if (colIndex < row.cells.items.length) {
                  const cell = row.cells.items[colIndex];
                  // 清除单元格原有内容并插入新文本
                  cell.body.clear();
                  cell.body.insertText(cellText, Word.InsertLocation.start);
                  
                  // 如果是表头（第一行），可以加粗
                  if (rowIndex === 0 && edit.format?.bold === undefined) {
                    cell.body.font.bold = true;
                  }
                }
              });
            }
          });
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

