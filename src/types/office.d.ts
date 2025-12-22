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
  }

  interface Body {
    text: string;
    insertText(text: string, insertLocation: Word.InsertLocation): Word.Range;
    insertParagraph(paragraphText: string, insertLocation: Word.InsertLocation): Word.Paragraph;
    search(searchText: string, searchOptions?: Word.SearchOptions): Word.SearchResultCollection;
    load(propertyNames?: string | string[]): void;
  }

  interface Range {
    font: Word.Font;
    insertText(text: string, insertLocation: Word.InsertLocation): Word.Range;
    delete(): void;
  }

  interface Paragraph {
    font: Word.Font;
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

