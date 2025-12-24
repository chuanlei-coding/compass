/// <reference types="office-js" />

declare namespace Office {
  interface AddinCommands {
    Event: any;
  }
}

declare namespace Word {
  interface RequestContext {
    document: Word.Document;
    sync(): Promise<void>;
  }

  interface Document {
    body: Word.Body;
    getSelection(): Word.Range;
  }

  interface Body {
    text: string;
    font: Word.Font;
    insertText(text: string, insertLocation: Word.InsertLocation): Word.Range;
    insertParagraph(paragraphText: string, insertLocation: Word.InsertLocation): Word.Paragraph;
    insertTable(rowCount: number, columnCount: number, insertLocation: Word.InsertLocation): Word.Table;
    search(searchText: string, searchOptions?: Word.SearchOptions): Word.SearchResultCollection;
    clear(): void;
    load(propertyNames?: string | string[]): void;
  }

  interface Table {
    rows: Word.TableRowCollection;
    load(propertyNames?: string | string[]): void;
  }

  interface TableRowCollection {
    items: Word.TableRow[];
    load(propertyNames?: string | string[]): void;
  }

  interface TableRow {
    cells: Word.TableCellCollection;
    load(propertyNames?: string | string[]): void;
  }

  interface TableCellCollection {
    items: Word.TableCell[];
    load(propertyNames?: string | string[]): void;
  }

  interface TableCell {
    body: Word.Body;
    load(propertyNames?: string | string[]): void;
  }

  interface Range {
    text: string;
    font: Word.Font;
    paragraphs: Word.ParagraphCollection;
    insertText(text: string, insertLocation: Word.InsertLocation): Word.Range;
    delete(): void;
    collapse(direction: Word.CollapseDirection): void;
    load(propertyNames?: string | string[]): void;
  }

  enum CollapseDirection {
    start = 'Start',
    end = 'End'
  }

  interface Paragraph {
    font: Word.Font;
    style: string;
    styleBuiltIn: Word.Style;
    load(propertyNames?: string | string[]): void;
  }

  enum Style {
    heading1 = 'heading1',
    heading2 = 'heading2',
    heading3 = 'heading3',
    normal = 'normal',
    title = 'title'
  }

  interface ParagraphCollection {
    items: Word.Paragraph[];
    load(propertyNames?: string | string[]): void;
  }

  interface Font {
    bold: boolean;
    italic: boolean;
    underline: Word.UnderlineType;
    size: number;
    color: string;
  }

  interface SearchResultCollection {
    items: Word.Range[];
    load(propertyNames?: string | string[]): void;
  }

  interface SearchOptions {
    matchCase?: boolean;
  }

  enum InsertLocation {
    before = 'Before',
    after = 'After',
    start = 'Start',
    end = 'End',
    replace = 'Replace'
  }

  enum UnderlineType {
    none = 'None',
    single = 'Single',
    words = 'Words',
    double = 'Double',
    dotted = 'Dotted',
    hidden = 'Hidden',
    thick = 'Thick',
    dash = 'Dash',
    dotDash = 'DotDash',
    dotDotDash = 'DotDotDash',
    wavy = 'Wavy',
    dottedHeavy = 'DottedHeavy',
    dashHeavy = 'DashHeavy',
    dotDashHeavy = 'DotDashHeavy',
    dotDotDashHeavy = 'DotDotDashHeavy',
    wavyHeavy = 'WavyHeavy',
    dashLong = 'DashLong',
    wavyDouble = 'WavyDouble',
    dashLongHeavy = 'DashLongHeavy'
  }

  function run(callback: (context: Word.RequestContext) => Promise<void>): Promise<void>;
}

