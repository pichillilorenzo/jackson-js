import test from 'ava';
import {JsonNaming, JsonNamingStrategy, ObjectMapper} from '../src';

test('@JsonNaming with JsonNamingStrategy.SNAKE_CASE', t => {
  @JsonNaming({strategy: JsonNamingStrategy.SNAKE_CASE})
  class Book {
    id: number;
    bookName: string;
    bookCategory: string;

    constructor(id: number, name: string, category: string) {
      this.id = id;
      this.bookName = name;
      this.bookCategory = category;
    }
  }

  const book = new Book(1, 'Learning TypeScript', 'Web Development');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Book>(book);
  t.assert(jsonData.includes('id'));
  t.assert(jsonData.includes('book_name'));
  t.assert(jsonData.includes('book_category'));

  const bookParsed = objectMapper.parse<Book>(jsonData, {mainCreator: () => [Book]});
  t.assert(bookParsed instanceof Book);
  t.is(book.id, 1);
  t.is(book.bookName, 'Learning TypeScript');
  t.is(book.bookCategory, 'Web Development');
});

test('@JsonNaming with JsonNamingStrategy.LOWER_CASE', t => {
  @JsonNaming({strategy: JsonNamingStrategy.LOWER_CASE})
  class Book {
    id: number;
    bookName: string;
    bookCategory: string;

    constructor(id: number, name: string, category: string) {
      this.id = id;
      this.bookName = name;
      this.bookCategory = category;
    }
  }

  const book = new Book(1, 'Learning TypeScript', 'Web Development');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Book>(book);
  t.assert(jsonData.includes('id'));
  t.assert(jsonData.includes('bookname'));
  t.assert(jsonData.includes('bookcategory'));

  const bookParsed = objectMapper.parse<Book>(jsonData, {mainCreator: () => [Book]});
  t.assert(bookParsed instanceof Book);
  t.is(book.id, 1);
  t.is(book.bookName, 'Learning TypeScript');
  t.is(book.bookCategory, 'Web Development');
});

test('@JsonNaming with JsonNamingStrategy.KEBAB_CASE', t => {
  @JsonNaming({strategy: JsonNamingStrategy.KEBAB_CASE})
  class Book {
    id: number;
    bookName: string;
    bookCategory: string;

    constructor(id: number, name: string, category: string) {
      this.id = id;
      this.bookName = name;
      this.bookCategory = category;
    }
  }

  const book = new Book(1, 'Learning TypeScript', 'Web Development');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Book>(book);
  t.assert(jsonData.includes('id'));
  t.assert(jsonData.includes('book-name'));
  t.assert(jsonData.includes('book-category'));

  const bookParsed = objectMapper.parse<Book>(jsonData, {mainCreator: () => [Book]});
  t.assert(bookParsed instanceof Book);
  t.is(book.id, 1);
  t.is(book.bookName, 'Learning TypeScript');
  t.is(book.bookCategory, 'Web Development');
});

test('@JsonNaming with JsonNamingStrategy.LOWER_CAMEL_CASE', t => {
  @JsonNaming({strategy: JsonNamingStrategy.LOWER_CAMEL_CASE})
  class Book {
    id: number;
    bookName: string;
    bookCategory: string;

    constructor(id: number, name: string, category: string) {
      this.id = id;
      this.bookName = name;
      this.bookCategory = category;
    }
  }

  const book = new Book(1, 'Learning TypeScript', 'Web Development');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Book>(book);
  t.assert(jsonData.includes('id'));
  t.assert(jsonData.includes('bookName'));
  t.assert(jsonData.includes('bookCategory'));

  const bookParsed = objectMapper.parse<Book>(jsonData, {mainCreator: () => [Book]});
  t.assert(bookParsed instanceof Book);
  t.is(book.id, 1);
  t.is(book.bookName, 'Learning TypeScript');
  t.is(book.bookCategory, 'Web Development');
});

test('@JsonNaming with JsonNamingStrategy.UPPER_CAMEL_CASE', t => {
  @JsonNaming({strategy: JsonNamingStrategy.UPPER_CAMEL_CASE})
  class Book {
    id: number;
    bookName: string;
    bookCategory: string;

    constructor(id: number, name: string, category: string) {
      this.id = id;
      this.bookName = name;
      this.bookCategory = category;
    }
  }

  const book = new Book(1, 'Learning TypeScript', 'Web Development');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Book>(book);
  t.assert(jsonData.includes('Id'));
  t.assert(jsonData.includes('BookName'));
  t.assert(jsonData.includes('BookCategory'));

  const bookParsed = objectMapper.parse<Book>(jsonData, {mainCreator: () => [Book]});
  t.assert(bookParsed instanceof Book);
  t.is(book.id, 1);
  t.is(book.bookName, 'Learning TypeScript');
  t.is(book.bookCategory, 'Web Development');
});

test('@JsonNaming with JsonNamingStrategy.LOWER_DOT_CASE', t => {
  @JsonNaming({strategy: JsonNamingStrategy.LOWER_DOT_CASE})
  class Book {
    id: number;
    bookName: string;
    bookCategory: string;

    constructor(id: number, name: string, category: string) {
      this.id = id;
      this.bookName = name;
      this.bookCategory = category;
    }
  }

  const book = new Book(1, 'Learning TypeScript', 'Web Development');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Book>(book);
  t.assert(jsonData.includes('id'));
  t.assert(jsonData.includes('book.name'));
  t.assert(jsonData.includes('book.category'));

  const bookParsed = objectMapper.parse<Book>(jsonData, {mainCreator: () => [Book]});
  t.assert(bookParsed instanceof Book);
  t.is(book.id, 1);
  t.is(book.bookName, 'Learning TypeScript');
  t.is(book.bookCategory, 'Web Development');
});
